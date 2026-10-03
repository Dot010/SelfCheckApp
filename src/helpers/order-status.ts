import { OrderStatus } from "@prisma/client";

type Tone = "info" | "warning" | "success" | "danger" | "neutral";

// How each status is shown to the customer. `step` drives the progress bar:
// 0 = not paid yet, 1 = paid, 2 = being prepared, 3 = done.
export const orderStatusDisplay: Record<
  OrderStatus,
  { label: string; tone: Tone; step: number }
> = {
  PENDING: { label: "Aguardando pagamento", tone: "neutral", step: 0 },
  PAYMENT_FAILED: { label: "Pagamento não aprovado", tone: "danger", step: 0 },
  PAYMENT_CONFIRMED: { label: "Pagamento confirmado", tone: "info", step: 1 },
  IN_PREPARATION: { label: "Em preparo", tone: "warning", step: 2 },
  FINISHED: { label: "Concluído", tone: "success", step: 3 },
};

export const toneClassName: Record<Tone, string> = {
  info: "bg-sky-100 text-sky-800",
  warning: "bg-amber-100 text-amber-900",
  success: "bg-emerald-100 text-emerald-800",
  danger: "bg-red-100 text-red-800",
  neutral: "bg-muted text-muted-foreground",
};

export const orderSteps = ["Pago", "Em preparo", "Concluído"];
