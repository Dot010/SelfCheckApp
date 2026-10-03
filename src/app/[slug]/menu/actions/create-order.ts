"use server";

import { ConsumptionMethod } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { resolveSelectedOptions } from "@/helpers/product-options";
import { getOpenStatus } from "@/helpers/restaurant-time";
import { setCustomerCpf } from "@/lib/customer-cpf";
import { db } from "@/lib/prisma";

import { isValidCpf, removeCpfPunctuation } from "../helpers/cpf";

const MAX_QUANTITY_PER_ITEM = 50;

const createOrderSchema = z.object({
  slug: z.string().min(1),
  consumptionMethod: z.enum(ConsumptionMethod),
  customerName: z.string().trim().min(1).max(60),
  customerCpf: z.string().refine(isValidCpf),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(MAX_QUANTITY_PER_ITEM),
        optionIds: z.array(z.string().min(1)).max(20).default([]),
        notes: z.string().trim().max(140).optional(),
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
    select: { id: true, isPaused: true, openingHours: true },
  });
  if (!restaurant) {
    return { ok: false, error: "Restaurante não encontrado." };
  }
  if (restaurant.isPaused) {
    return { ok: false, error: "Os pedidos estão pausados no momento." };
  }
  const openStatus = getOpenStatus(restaurant.openingHours);
  if (!openStatus.isOpen) {
    return { ok: false, error: `Estamos fechados agora. ${openStatus.label}.` };
  }

  // Prices and options always come from the database, and only from this
  // restaurant's products.
  const products = await db.product.findMany({
    where: {
      id: { in: data.items.map((item) => item.productId) },
      restaurantId: restaurant.id,
    },
    include: { optionGroups: { include: { options: true } } },
  });

  const orderProducts = [];
  for (const item of data.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      return {
        ok: false,
        error: "Alguns itens da sacola não estão mais disponíveis.",
      };
    }
    if (!product.isAvailable) {
      return { ok: false, error: `${product.name} esgotou. Remova da sacola.` };
    }
    const selection = resolveSelectedOptions(
      product.optionGroups,
      item.optionIds,
    );
    if (!selection.ok) {
      return { ok: false, error: `${product.name}: ${selection.error}` };
    }
    orderProducts.push({
      productId: product.id,
      quantity: item.quantity,
      price: product.price + selection.extraPrice,
      notes: item.notes || null,
      options: {
        create: selection.options.map(({ name, price }) => ({ name, price })),
      },
    });
  }

  const order = await db.order.create({
    data: {
      status: "PENDING",
      customerName: data.customerName,
      customerCpf: removeCpfPunctuation(data.customerCpf),
      consumptionMethod: data.consumptionMethod,
      total: orderProducts.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
      ),
      orderProducts: { create: orderProducts },
      restaurant: { connect: { id: restaurant.id } },
    },
    select: { id: true },
  });

  await setCustomerCpf(data.customerCpf);
  revalidatePath(`/${data.slug}/orders`);

  return { ok: true, orderId: order.id };
};
