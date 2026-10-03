import AutoRefresh from "@/components/auto-refresh";
import { getCustomerCpf } from "@/lib/customer-cpf";
import { db } from "@/lib/prisma";

import CheckoutSuccess from "./components/checkout-success";
import CpfForm from "./components/cpf-form";
import OrderList from "./components/order-list";
import OrderStatusNotifier from "./components/order-status-notifier";

interface OrdersPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ checkout?: string }>;
}

const OrdersPage = async ({ params, searchParams }: OrdersPageProps) => {
  const { slug } = await params;
  const { checkout } = await searchParams;
  const success = checkout === "success" && <CheckoutSuccess />;
  const cpf = await getCustomerCpf();
  if (!cpf) {
    return (
      <>
        {success}
        <CpfForm slug={slug} />
      </>
    );
  }
  const orders = await db.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    where: {
      customerCpf: cpf,
      restaurant: { slug },
    },
    include: {
      orderProducts: {
        include: {
          product: { select: { name: true } },
          options: { select: { id: true, name: true } },
        },
      },
    },
  });
  // Keep checking while something is still on its way.
  const hasActiveOrder = orders.some((order) =>
    ["PENDING", "PAYMENT_CONFIRMED", "IN_PREPARATION", "READY"].includes(
      order.status,
    ),
  );

  return (
    <>
      {success}
      <AutoRefresh seconds={5} enabled={hasActiveOrder} />
      <OrderStatusNotifier
        orders={orders.map(({ id, status }) => ({ id, status }))}
      />
      <OrderList slug={slug} orders={orders} />
    </>
  );
};

export default OrdersPage;
