"use server";

import { clearCustomerCpf, setCustomerCpf } from "@/lib/customer-cpf";

import { isValidCpf } from "../../menu/helpers/cpf";

export const identifyCustomer = async (cpf: string) => {
  if (!isValidCpf(cpf)) {
    return { ok: false as const, error: "CPF inválido." };
  }
  await setCustomerCpf(cpf);
  return { ok: true as const };
};

export const forgetCustomer = async () => {
  await clearCustomerCpf();
};
