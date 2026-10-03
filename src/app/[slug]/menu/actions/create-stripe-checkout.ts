"use server";

import { headers } from "next/headers";
import type Stripe from "stripe";

import { getCustomerCpf } from "@/lib/customer-cpf";
import { db } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

type CreateStripeCheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

const getOrigin = async () => {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const protocol = h.get("x-forwarded-proto") ?? "https";
  return `${protocol}://${host}`;
};

// Stripe downloads product images itself, so it needs a public https URL to a
// raster image. Relative paths, localhost and SVGs are left out.
const toStripeImage = (imageUrl: string, origin: string) => {
  try {
    const url = new URL(imageUrl, origin);
    const isPublic =
      url.protocol === "https:" && !/^(localhost|127\.)/.test(url.hostname);
    return isPublic && !url.pathname.endsWith(".svg") ? [url.href] : [];
  } catch {
    return [];
  }
};

export const createStripeCheckout = async (
  orderId: number,
): Promise<CreateStripeCheckoutResult> => {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      restaurant: { select: { slug: true } },
      orderProducts: {
        include: { product: { select: { name: true, imageUrl: true } } },
      },
    },
  });

  // Only the customer who placed the order can pay for it, and only once.
  const cpf = await getCustomerCpf();
  if (!order || order.customerCpf !== cpf) {
    return { ok: false, error: "Pedido não encontrado." };
  }
  if (order.status !== "PENDING") {
    return {
      ok: false,
      error: "Este pedido não está mais aguardando pagamento.",
    };
  }

  const origin = await getOrigin();
  const { slug } = order.restaurant;
  const metadata = { orderId: String(order.id) };

  // Line items are built from what was saved in the order, never from the client.
  let session: Stripe.Checkout.Session;
  try {
    session = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "boleto"],
      metadata,
      payment_intent_data: { metadata },
      line_items: order.orderProducts.map((orderProduct) => ({
        quantity: orderProduct.quantity,
        price_data: {
          currency: "brl",
          unit_amount: orderProduct.price,
          product_data: {
            name: orderProduct.product.name,
            images: toStripeImage(orderProduct.product.imageUrl, origin),
          },
        },
      })),
      success_url: `${origin}/${slug}/orders?checkout=success`,
      cancel_url: `${origin}/${slug}/menu?consumptionMethod=${order.consumptionMethod}`,
    });
  } catch (error) {
    console.error("Stripe checkout failed", error);
    return {
      ok: false,
      error: "Não foi possível iniciar o pagamento. Tente novamente.",
    };
  }

  if (!session.url) {
    return { ok: false, error: "Não foi possível iniciar o pagamento." };
  }
  return { ok: true, url: session.url };
};
