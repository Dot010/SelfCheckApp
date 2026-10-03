import { notFound, redirect } from "next/navigation";

import { db } from "@/lib/prisma";

// Look up the restaurant on every request instead of once at build time,
// so the build never needs the database and new restaurants are picked up.
export const dynamic = "force-dynamic";

const HomePage = async () => {
  const restaurant = await db.restaurant.findFirst({
    orderBy: { createdAt: "asc" },
    select: { slug: true },
  });
  if (!restaurant) {
    return notFound();
  }
  redirect(`/${restaurant.slug}`);
};

export default HomePage;
