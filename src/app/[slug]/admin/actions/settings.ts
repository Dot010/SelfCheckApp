"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";

const revalidate = (slug: string) => revalidatePath(`/${slug}`, "layout");

export const setOrdersPaused = async (slug: string, isPaused: boolean) => {
  const { restaurantId } = await requireAdmin(slug);
  await db.restaurant.update({
    where: { id: restaurantId },
    data: { isPaused },
  });
  revalidate(slug);
};

const detailsSchema = z.object({
  name: z.string().trim().min(2).max(60),
  description: z.string().trim().min(2).max(140),
});

export const updateRestaurantDetails = async (
  slug: string,
  input: z.input<typeof detailsSchema>,
) => {
  const { restaurantId } = await requireAdmin(slug);
  const parsed = detailsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Confira o nome e a descrição." };
  }
  await db.restaurant.update({
    where: { id: restaurantId },
    data: parsed.data,
  });
  revalidate(slug);
  return { ok: true as const };
};

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const hoursSchema = z
  .array(
    z
      .object({
        weekday: z.number().int().min(0).max(6),
        opensAt: time,
        closesAt: time,
      })
      .refine((day) => day.opensAt !== day.closesAt),
  )
  .max(7)
  .refine((days) => new Set(days.map((d) => d.weekday)).size === days.length);

// Replaces the whole week: days left out of the list are closed.
export const saveOpeningHours = async (
  slug: string,
  input: z.input<typeof hoursSchema>,
) => {
  const { restaurantId } = await requireAdmin(slug);
  const parsed = hoursSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: "Confira os horários: abertura e fechamento não podem ser iguais.",
    };
  }
  await db.$transaction([
    db.openingHours.deleteMany({ where: { restaurantId } }),
    db.openingHours.createMany({
      data: parsed.data.map((day) => ({ ...day, restaurantId })),
    }),
  ]);
  revalidate(slug);
  return { ok: true as const };
};
