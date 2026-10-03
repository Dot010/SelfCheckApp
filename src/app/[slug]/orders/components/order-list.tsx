"use client";

import { Prisma } from "@prisma/client";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/helpers/format-currency";
import {
  orderStatusDisplay,
  orderSteps,
  toneClassName,
} from "@/helpers/order-status";
import { cn } from "@/lib/utils";

import { forgetCustomer } from "../actions/customer";

interface OrderListProps {
  slug: string;
  orders: Array<
    Prisma.OrderGetPayload<{
      include: {
        orderProducts: {
          include: {
            product: { select: { name: true } };
            options: { select: { id: true; name: true } };
          };
        };
      };
    }>
  >;
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const OrderList = ({ slug, orders }: OrderListProps) => {
  const router = useRouter();
  const handleChangeCpf = async () => {
    await forgetCustomer();
    router.refresh();
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="secondary"
            size="icon"
            className="rounded-full"
          >
            <Link href={`/${slug}`} aria-label="Voltar ao início">
              <ChevronLeftIcon />
            </Link>
          </Button>
          <h1 className="text-3xl font-extrabold">Meus pedidos</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={handleChangeCpf}
        >
          Trocar CPF
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-card p-8 text-center shadow-sm ring-1 ring-border">
          <p className="font-medium">Nenhum pedido encontrado para este CPF.</p>
          <Button asChild className="mt-4 rounded-full">
            <Link href={`/${slug}`}>Fazer um pedido</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {orders.map((order) => {
            const status = orderStatusDisplay[order.status];
            return (
              <article
                key={order.id}
                className="flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      toneClassName[status.tone],
                    )}
                  >
                    {status.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Pedido #{order.id} ·{" "}
                    {dateFormatter.format(new Date(order.createdAt))}
                  </span>
                </div>

                {order.status !== "PAYMENT_FAILED" && (
                  <ol
                    className="grid grid-cols-3 gap-2"
                    aria-label="Andamento do pedido"
                  >
                    {orderSteps.map((label, index) => {
                      const done = index < status.step;
                      return (
                        <li
                          key={label}
                          className={cn(
                            "flex flex-col gap-1.5 text-xs",
                            done
                              ? "font-medium text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 rounded-full",
                              done ? "bg-primary" : "bg-muted",
                            )}
                          />
                          {label}
                        </li>
                      );
                    })}
                  </ol>
                )}

                <ul className="flex flex-col gap-2 text-sm">
                  {order.orderProducts.map((orderProduct) => (
                    <li key={orderProduct.id} className="flex gap-2">
                      <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-secondary px-1.5 text-xs font-semibold">
                        {orderProduct.quantity}
                      </span>
                      <span className="min-w-0">
                        {orderProduct.product.name}
                        {(orderProduct.options.length > 0 ||
                          orderProduct.notes) && (
                          <span className="block text-xs text-muted-foreground">
                            {[
                              orderProduct.options
                                .map((o) => o.name)
                                .join(", "),
                              orderProduct.notes && `"${orderProduct.notes}"`,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex items-center justify-between border-t pt-3 text-sm">
                  <span className="text-muted-foreground">
                    {order.consumptionMethod === "DINE_IN"
                      ? "Comer aqui"
                      : "Para levar"}
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default OrderList;
