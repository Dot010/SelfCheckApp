import { db } from "@/lib/prisma";

export const getRestaurantBySlug = async (slug: string) => {
  return db.restaurant.findUnique({ where: { slug } });
};
