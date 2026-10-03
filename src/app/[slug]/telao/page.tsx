import { notFound } from "next/navigation";

import AutoRefresh from "@/components/auto-refresh";
import { db } from "@/lib/prisma";

import TvBoard from "./tv-board";

interface TvPageProps {
  params: Promise<{ slug: string }>;
}

export const metadata = { title: "Telão de senhas" };

// Orders that went quiet hours ago (forgotten in "ready") don't stay up forever.
const RECENT_HOURS = 3;

const TvPage = async ({ params }: TvPageProps) => {
  const { slug } = await params;
  const restaurant = await db.restaurant.findUnique({
    where: { slug },
    select: { id: true, name: true, avatarImageUrl: true },
  });
  if (!restaurant) return notFound();

  const orders = await db.order.findMany({
    where: {
      restaurantId: restaurant.id,
      status: { in: ["PAYMENT_CONFIRMED", "IN_PREPARATION", "READY"] },
      updatedAt: { gte: new Date(Date.now() - RECENT_HOURS * 3600_000) },
    },
    orderBy: { id: "asc" },
    select: { id: true, status: true },
  });

  return (
    <>
      <AutoRefresh seconds={5} />
      <TvBoard
        name={restaurant.name}
        logo={restaurant.avatarImageUrl}
        preparing={orders.filter((o) => o.status !== "READY").map((o) => o.id)}
        ready={orders.filter((o) => o.status === "READY").map((o) => o.id)}
      />
    </>
  );
};

export default TvPage;
