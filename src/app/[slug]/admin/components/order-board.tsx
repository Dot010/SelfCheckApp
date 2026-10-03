"use client";

import { OrderStatus, Prisma } from "@prisma/client";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/helpers/format-currency";
import { cn } from "@/lib/utils";

import { advanceOrder } from "../actions/orders";

export type BoardOrder = Prisma.OrderGetPayload<{
  include: {
    orderProducts: {
      include: {
        product: { select: { name: true } };
        options: { select: { id: true; name: true } };
      };
    };
  };
}>;

const columns: Array<{
  status: OrderStatus;
  title: string;
  dot: string;
  action: string;
  actionClassName: string;
}> = [
  {
    status: "PAYMENT_CONFIRMED",
    title: "Pagos, aguardando",
    dot: "bg-sky-500",
    action: "Iniciar preparo",
    actionClassName:
      "bg-highlight text-highlight-foreground hover:bg-highlight/90",
  },
  {
    status: "IN_PREPARATION",
    title: "Em preparo",
    dot: "bg-amber-500",
    action: "Marcar como pronto",
    actionClassName: "",
  },
  {
    status: "READY",
    title: "Prontos para retirar",
    dot: "bg-emerald-500",
    action: "Entregue",
    actionClassName: "bg-secondary text-secondary-foreground hover:bg-accent",
  },
];

const minutesAgo = (date: Date) => {
  const minutes = Math.max(
    0,
    Math.round((Date.now() - new Date(date).getTime()) / 60000),
  );
  return minutes < 1 ? "agora" : `há ${minutes} min`;
};

const Ticket = ({
  slug,
  order,
  action,
  actionClassName,
}: {
  slug: string;
  order: BoardOrder;
  action: string;
  actionClassName: string;
}) => {
  const [isPending, startTransition] = useTransition();
  const handleAdvance = () =>
    startTransition(async () => {
      const result = await advanceOrder(slug, order.id);
      if (!result.ok) toast.error(result.error);
    });

  return (
    <article className="flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-display text-xl font-extrabold">#{order.id}</span>
        {/* Relative time differs between server and browser by design. */}
        <span
          className="text-xs text-muted-foreground"
          suppressHydrationWarning
        >
          {minutesAgo(order.updatedAt)}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        {order.consumptionMethod === "DINE_IN" ? "Comer aqui" : "Para levar"} ·{" "}
        {order.customerName}
      </p>
      <ul className="flex flex-col gap-2 text-sm">
        {order.orderProducts.map((item) => (
          <li key={item.id} className="flex gap-2">
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-secondary px-1.5 text-xs font-bold">
              {item.quantity}
            </span>
            <span className="min-w-0">
              <span className="font-medium">{item.product.name}</span>
              {item.options.length > 0 && (
                <span className="block text-xs text-muted-foreground">
                  {item.options.map((o) => o.name).join(", ")}
                </span>
              )}
              {item.notes && (
                <span className="mt-1 block rounded-lg bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900">
                  Obs.: {item.notes}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between gap-2 border-t pt-3">
        <span className="text-sm font-semibold">
          {formatCurrency(order.total)}
        </span>
        <Button
          size="sm"
          className={cn("rounded-full", actionClassName)}
          disabled={isPending}
          onClick={handleAdvance}
        >
          {isPending ? "Salvando…" : action}
        </Button>
      </div>
    </article>
  );
};

const OrderBoard = ({
  slug,
  orders,
}: {
  slug: string;
  orders: BoardOrder[];
}) => (
  <div className="grid items-start gap-4 lg:grid-cols-3">
    {columns.map((column) => {
      const columnOrders = orders.filter((o) => o.status === column.status);
      return (
        <section
          key={column.status}
          aria-label={column.title}
          className="flex flex-col gap-3 rounded-3xl bg-secondary p-3"
        >
          <header className="flex items-center justify-between px-2 pt-1">
            <h2 className="flex items-center gap-2 font-sans text-sm font-semibold tracking-normal">
              <span className={cn("h-2.5 w-2.5 rounded-full", column.dot)} />
              {column.title}
            </h2>
            <span className="rounded-full bg-card px-2.5 py-0.5 text-xs font-semibold">
              {columnOrders.length}
            </span>
          </header>
          {columnOrders.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              Nada por aqui.
            </p>
          ) : (
            columnOrders.map((order) => (
              <Ticket
                key={order.id}
                slug={slug}
                order={order}
                action={column.action}
                actionClassName={column.actionClassName}
              />
            ))
          )}
        </section>
      );
    })}
  </div>
);

export default OrderBoard;
