import { getCustomerCpf } from "@/lib/customer-cpf";
import { db } from "@/lib/prisma";

import CheckoutSuccess from "./components/checkout-success";
import CpfForm from "./components/cpf-form";
import OrderList from "./components/order-list";

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
        <CpfForm />
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
      restaurant: {
        select: {
          name: true,
          avatarImageUrl: true,
        },
      },
      orderProducts: {
        include: {
          product: true,
        },
      },
    },
  });
  return (
    <>
      {success}
      <OrderList orders={orders} />
    </>
  );
};

export default OrdersPage;
