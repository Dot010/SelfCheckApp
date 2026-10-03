"use client";

import { OrderStatus } from "@prisma/client";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface OrderStatusNotifierProps {
  orders: Array<{ id: number; status: OrderStatus }>;
}

// Compares each refresh with the previous one and tells the customer when
// something they're waiting for happens.
const OrderStatusNotifier = ({ orders }: OrderStatusNotifierProps) => {
  const previous = useRef<Map<number, OrderStatus> | null>(null);

  useEffect(() => {
    const before = previous.current;
    previous.current = new Map(orders.map((o) => [o.id, o.status]));
    // First render: nothing changed yet.
    if (!before) return;

    for (const order of orders) {
      const was = before.get(order.id);
      if (!was || was === order.status) continue;
      if (order.status === "READY") {
        toast.success(`Pedido #${order.id} pronto! Retire no balcão.`, {
          duration: 10_000,
        });
        navigator.vibrate?.([200, 100, 200]);
      } else if (order.status === "PAYMENT_CONFIRMED") {
        toast.success(`Pagamento do pedido #${order.id} confirmado.`);
      } else if (order.status === "PAYMENT_FAILED") {
        toast.error(`O pagamento do pedido #${order.id} não foi aprovado.`);
      }
    }
  }, [orders]);

  return null;
};

export default OrderStatusNotifier;
