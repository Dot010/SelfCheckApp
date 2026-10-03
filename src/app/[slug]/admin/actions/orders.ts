"use server";

import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";

// The kitchen can only move an order one step forward.
const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  PAYMENT_CONFIRMED: "IN_PREPARATION",
  IN_PREPARATION: "READY",
  READY: "FINISHED",
};

export const advanceOrder = async (slug: string, orderId: number) => {
  const session = await requireAdmin(slug);

  const order = await db.order.findFirst({
    where: { id: orderId, restaurantId: session.restaurantId },
    select: { status: true },
  });
  const status = order && nextStatus[order.status];
  if (!status) {
    return { ok: false as const, error: "Este pedido já foi atualizado." };
  }

  // Only update if nobody changed it in the meantime (two tablets, double tap).
  const { count } = await db.order.updateMany({
    where: { id: orderId, status: order.status },
    data: { status },
  });
  revalidatePath(`/${slug}/admin`);
  revalidatePath(`/${slug}/orders`);
  return count === 1
    ? { ok: true as const, status }
    : { ok: false as const, error: "Este pedido já foi atualizado." };
};
