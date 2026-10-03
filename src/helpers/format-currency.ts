/** Formats an amount in cents, e.g. 3990 -> "R$ 39,90". */
export const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
};
