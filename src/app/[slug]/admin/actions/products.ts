"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";

const revalidate = (slug: string) => {
  revalidatePath(`/${slug}/admin/cardapio`);
  revalidatePath(`/${slug}/menu`, "layout");
};

export const setProductAvailability = async (
  slug: string,
  productId: string,
  isAvailable: boolean,
) => {
  const { restaurantId } = await requireAdmin(slug);
  // Scoping by restaurant means a session can't touch another restaurant's menu.
  const { count } = await db.product.updateMany({
    where: { id: productId, restaurantId },
    data: { isAvailable },
  });
  revalidate(slug);
  return count === 1;
};

const productSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().min(2).max(300),
  price: z.number().int().min(50).max(1_000_00),
});

export type ProductInput = z.input<typeof productSchema>;

export const updateProduct = async (
  slug: string,
  productId: string,
  input: ProductInput,
) => {
  const { restaurantId } = await requireAdmin(slug);
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Confira nome, descrição e preço." };
  }
  const { count } = await db.product.updateMany({
    where: { id: productId, restaurantId },
    data: parsed.data,
  });
  revalidate(slug);
  return count === 1
    ? { ok: true as const }
    : { ok: false as const, error: "Produto não encontrado." };
};
