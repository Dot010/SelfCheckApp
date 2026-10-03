import { formatCurrency } from "@/helpers/format-currency";
import { startOfToday } from "@/helpers/restaurant-time";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";

import AutoRefresh from "../components/auto-refresh";
import OrderBoard from "../components/order-board";

interface AdminOrdersPageProps {
  params: Promise<{ slug: string }>;
}

const PAID = [
  "PAYMENT_CONFIRMED",
  "IN_PREPARATION",
  "READY",
  "FINISHED",
] as const;

const AdminOrdersPage = async ({ params }: AdminOrdersPageProps) => {
  const { slug } = await params;
  const { restaurantId } = await requireAdmin(slug);
  const today = startOfToday();

  const [activeOrders, todayTotals, waitingPayment] = await Promise.all([
    // Paid orders the kitchen still has to deal with, oldest first.
    db.order.findMany({
      where: {
        restaurantId,
        status: { in: ["PAYMENT_CONFIRMED", "IN_PREPARATION", "READY"] },
      },
      orderBy: { createdAt: "asc" },
      include: {
        orderProducts: {
          include: {
            product: { select: { name: true } },
            options: { select: { id: true, name: true } },
          },
        },
      },
    }),
    db.order.aggregate({
      where: {
        restaurantId,
        status: { in: [...PAID] },
        createdAt: { gte: today },
      },
      _count: true,
      _sum: { total: true },
    }),
    db.order.count({
      where: { restaurantId, status: "PENDING", createdAt: { gte: today } },
    }),
  ]);

  const stats = [
    { label: "Pedidos pagos hoje", value: String(todayTotals._count) },
    {
      label: "Faturamento hoje",
      value: formatCurrency(todayTotals._sum.total ?? 0),
    },
    {
      label: "Em preparo",
      value: String(
        activeOrders.filter((o) => o.status === "IN_PREPARATION").length,
      ),
    },
    {
      label: "Prontos no balcão",
      value: String(activeOrders.filter((o) => o.status === "READY").length),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <AutoRefresh />
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Pedidos</h1>
          <p className="text-sm text-muted-foreground">
            Só aparecem pedidos pagos. Atualiza sozinho a cada 10 segundos.
            {waitingPayment > 0 &&
              ` ${waitingPayment} aguardando pagamento hoje.`}
          </p>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border"
          >
            <dt className="text-xs text-muted-foreground">{stat.label}</dt>
            <dd className="mt-1 font-display text-2xl font-bold">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <OrderBoard slug={slug} orders={activeOrders} />
    </div>
  );
};

export default AdminOrdersPage;
