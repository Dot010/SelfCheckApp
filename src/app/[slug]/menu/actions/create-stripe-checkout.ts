"use server";

import { ConsumptionMethod } from "@prisma/client";
import { headers } from "next/headers";
import Stripe from "stripe";

import { db } from "@/lib/prisma";

import { CartProduct } from "../contexts/cart";

interface createStripeCheckoutInput {
  products: CartProduct[];
  orderId: number;
  slug: string;
  consumptionMethod: ConsumptionMethod;
}

export const createStripeCheckout = async ({
  orderId,
  products,
  slug,
  consumptionMethod,
}: createStripeCheckoutInput) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key not found");
  }

  const origin = (await headers()).get("origin") as string;

  const productsWithPrices = await db.product.findMany({
    where: {
      id: {
        in: products.map((product) => product.id),
      },
    },
  });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia",
  });

  const searchParams = new URLSearchParams();
  searchParams.set("consumptionMethod", consumptionMethod);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card", "boleto"],
    mode: "payment",
    success_url: `${origin}/${slug}/orders?${searchParams.toString()}`,
    cancel_url: `${origin}/${slug}/orders?${searchParams.toString()}`,
    metadata: {
      orderId,
    },
    line_items: products.map((product) => ({
      price_data: {
        currency: "brl",
        product_data: {
          name: product.name,
          images: [product.imageUrl],
        },
        unit_amount: productsWithPrices.find((p) => p.id === product.id)!.price,
      },
      quantity: product.quantity,
    })),
  });
  return { sessionId: session.id };
};
