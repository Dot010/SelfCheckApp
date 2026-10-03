import { notFound, redirect } from "next/navigation";

import { db } from "@/lib/prisma";

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
