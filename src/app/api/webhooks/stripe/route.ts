import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { db } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

// Moves a pending order to its new status. Stripe may deliver the same event
// more than once, so orders that already left PENDING are left untouched.
const settleOrder = async (
  session: Stripe.Checkout.Session,
  status: OrderStatus,
) => {
  const orderId = Number(session.metadata?.orderId);
  if (!Number.isInteger(orderId)) return;

  const { count } = await db.order.updateMany({
    where: { id: orderId, status: "PENDING" },
    data: { status },
  });
  if (count === 0) return;

  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { restaurant: { select: { slug: true } } },
  });
  if (order) {
    revalidatePath(`/${order.restaurant.slug}/orders`);
  }
};

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_KEY;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET_KEY is not set");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      await request.text(),
      signature,
      webhookSecret,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
      // Card payments are paid here. Boleto completes as "unpaid" and is
      // confirmed later by checkout.session.async_payment_succeeded.
      if (event.data.object.payment_status === "paid") {
        await settleOrder(event.data.object, "PAYMENT_CONFIRMED");
      }
      break;
    case "checkout.session.async_payment_succeeded":
      await settleOrder(event.data.object, "PAYMENT_CONFIRMED");
      break;
    case "checkout.session.async_payment_failed":
    case "checkout.session.expired":
      await settleOrder(event.data.object, "PAYMENT_FAILED");
      break;
  }

  return NextResponse.json({ received: true });
}
