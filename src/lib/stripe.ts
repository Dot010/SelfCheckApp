import "server-only";

import Stripe from "stripe";

let stripe: Stripe | undefined;

export const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  stripe ??= new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia",
  });
  return stripe;
};
