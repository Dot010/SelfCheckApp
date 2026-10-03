import { getCustomerCpf } from "@/lib/customer-cpf";
import { db } from "@/lib/prisma";

import CpfForm from "./components/cpf-form";
import OrderList from "./components/order-list";

interface OrdersPageProps {
  params: Promise<{ slug: string }>;
}

const OrdersPage = async ({ params }: OrdersPageProps) => {
  const { slug } = await params;
  const cpf = await getCustomerCpf();
  if (!cpf) {
    return <CpfForm />;
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
  return <OrderList orders={orders} />;
};

export default OrdersPage;
