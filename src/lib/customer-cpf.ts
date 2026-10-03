import "server-only";

import { cookies } from "next/headers";

import {
  isValidCpf,
  removeCpfPunctuation,
} from "@/app/[slug]/menu/helpers/cpf";

// The customer's CPF is kept in an httpOnly cookie instead of the URL, so it
// doesn't end up in browser history, analytics or server logs.
const COOKIE_NAME = "customer_cpf";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export const getCustomerCpf = async () => {
  const cpf = (await cookies()).get(COOKIE_NAME)?.value;
  return cpf && isValidCpf(cpf) ? cpf : null;
};

export const setCustomerCpf = async (cpf: string) => {
  (await cookies()).set(COOKIE_NAME, removeCpfPunctuation(cpf), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: THIRTY_DAYS,
  });
};

export const clearCustomerCpf = async () => {
  (await cookies()).delete(COOKIE_NAME);
};
