"use server";

import { ConsumptionMethod } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { setCustomerCpf } from "@/lib/customer-cpf";
import { db } from "@/lib/prisma";

import { isValidCpf, removeCpfPunctuation } from "../helpers/cpf";

const MAX_QUANTITY_PER_ITEM = 50;

const createOrderSchema = z.object({
  slug: z.string().min(1),
  consumptionMethod: z.enum(ConsumptionMethod),
  customerName: z.string().trim().min(1).max(60),
  customerCpf: z.string().refine(isValidCpf),
  products: z
    .array(
      z.object({
        id: z.string().min(1),
        quantity: z.number().int().min(1).max(MAX_QUANTITY_PER_ITEM),
      }),
    )
    .min(1)
    .max(50),
});

export type CreateOrderInput = z.input<typeof createOrderSchema>;

export type CreateOrderResult =
  | { ok: true; orderId: number }
  | { ok: false; error: string };

export const createOrder = async (
  input: CreateOrderInput,
): Promise<CreateOrderResult> => {
  // Server actions are public endpoints, so never trust what the client sends.
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Confira os dados do pedido e tente novamente.",
    };
  }
  const data = parsed.data;

  const restaurant = await db.restaurant.findUnique({
    where: { slug: data.slug },
    select: { id: true },
  });
  if (!restaurant) {
    return { ok: false, error: "Restaurante não encontrado." };
  }

  // The same product can show up more than once; merge the quantities.
  const quantities = new Map<string, number>();
  for (const product of data.products) {
    quantities.set(
      product.id,
      (quantities.get(product.id) ?? 0) + product.quantity,
    );
  }

  // Prices always come from the database, and only from this restaurant.
  const products = await db.product.findMany({
    where: {
      id: { in: [...quantities.keys()] },
      restaurantId: restaurant.id,
    },
    select: { id: true, price: true },
  });
  if (products.length !== quantities.size) {
    return {
      ok: false,
      error: "Alguns itens da sacola não estão mais disponíveis.",
    };
  }

  const orderProducts = products.map((product) => ({
    productId: product.id,
    price: product.price,
    quantity: Math.min(quantities.get(product.id)!, MAX_QUANTITY_PER_ITEM),
  }));

  const order = await db.order.create({
    data: {
      status: "PENDING",
      customerName: data.customerName,
      customerCpf: removeCpfPunctuation(data.customerCpf),
      consumptionMethod: data.consumptionMethod,
      total: orderProducts.reduce(
        (acc, product) => acc + product.price * product.quantity,
        0,
      ),
      orderProducts: { createMany: { data: orderProducts } },
      restaurant: { connect: { id: restaurant.id } },
    },
    select: { id: true },
  });

  await setCustomerCpf(data.customerCpf);
  revalidatePath(`/${data.slug}/orders`);

  return { ok: true, orderId: order.id };
};
