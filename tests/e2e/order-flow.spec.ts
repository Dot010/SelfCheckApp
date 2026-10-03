import { expect, type Page, test } from "@playwright/test";
import Stripe from "stripe";

import { ADMIN_STATE, randomCpf, SLUG } from "./helpers";

// Must match STRIPE_WEBHOOK_SECRET_KEY on the server under test.
const WEBHOOK_SECRET =
  process.env.STRIPE_WEBHOOK_SECRET_KEY ?? "whsec_e2e_local_secret";

// Sends the event Stripe would send after a successful payment.
const confirmPayment = async (page: Page, orderId: number) => {
  const payload = JSON.stringify({
    id: `evt_e2e_${orderId}`,
    object: "event",
    type: "checkout.session.completed",
    data: {
      object: {
        id: `cs_e2e_${orderId}`,
        object: "checkout.session",
        payment_status: "paid",
        metadata: { orderId: String(orderId) },
      },
    },
  });
  const signature = new Stripe(
    "sk_test_unused",
  ).webhooks.generateTestHeaderString({ payload, secret: WEBHOOK_SECRET });
  const response = await page.request.post("/api/webhooks/stripe", {
    data: payload,
    headers: {
      "content-type": "application/json",
      "stripe-signature": signature,
    },
  });
  expect(response.ok()).toBe(true);
};

test("a customer builds an açaí, pays and picks it up", async ({
  page,
  browser,
}) => {
  const cpf = randomCpf();

  // Customer: build the açaí.
  await page.goto(`/${SLUG}`);
  await page.getByRole("link", { name: /Para levar/ }).click();
  await page.getByRole("link", { name: /Açaí do seu jeito/ }).click();

  await page.getByRole("button", { name: /700 ml/ }).click();
  await page.getByRole("button", { name: /Morango/ }).click();
  await page.getByRole("button", { name: /Kiwi/ }).click();
  await page.getByPlaceholder(/granola à parte/).fill("Bem gelado");
  // R$ 16,90 + 700 ml R$ 12,00 + morango R$ 3,00 + kiwi R$ 3,50
  await page.getByRole("button", { name: /Adicionar · R\$\s35,40/ }).click();

  // Checkout. Stripe isn't reachable from the tests, so the order is created
  // and stays pending; the payment is confirmed below through the webhook.
  await page.getByRole("button", { name: "Finalizar pedido" }).click();
  await page.getByPlaceholder("Digite seu nome...").fill("Cliente Teste");
  await page.getByPlaceholder("Digite seu CPF...").fill(cpf);
  await page.getByRole("button", { name: "Finalizar", exact: true }).click();
  await expect(
    page.getByText(/Não foi possível iniciar o pagamento/),
  ).toBeVisible({
    timeout: 30_000,
  });

  await page.goto(`/${SLUG}/orders`);
  const card = page.getByRole("article").first();
  await expect(card.getByText("Aguardando pagamento")).toBeVisible();
  await expect(card).toContainText("Açaí do seu jeito");
  await expect(card).toContainText("700 ml, Morango, Kiwi");
  await expect(card).toContainText("Bem gelado");
  const orderId = Number(
    (await card.getByText(/Pedido #\d+/).textContent())?.match(/#(\d+)/)?.[1],
  );
  expect(orderId).toBeGreaterThan(0);

  // Stripe confirms the payment (twice, as it may retry: must be harmless).
  await confirmPayment(page, orderId);
  await confirmPayment(page, orderId);
  await page.reload();
  await expect(card.getByText("Pagamento confirmado")).toBeVisible();

  // Kitchen: move the order along the board.
  const admin = await browser.newContext({ storageState: ADMIN_STATE });
  const kitchen = await admin.newPage();
  await kitchen.goto(`/${SLUG}/admin`);
  const ticket = (column: string) =>
    kitchen
      .getByRole("region", { name: column })
      .getByRole("article")
      .filter({ hasText: `#${orderId}` });

  await expect(ticket("Pagos, aguardando")).toContainText("Obs.: Bem gelado");
  await ticket("Pagos, aguardando")
    .getByRole("button", { name: "Iniciar preparo" })
    .click();
  await ticket("Em preparo")
    .getByRole("button", { name: "Marcar como pronto" })
    .click();
  await expect(ticket("Prontos para retirar")).toBeVisible();

  // The TV at the counter calls the number.
  await kitchen.goto(`/${SLUG}/telao`);
  await expect(
    kitchen.getByText(String(orderId), { exact: true }),
  ).toBeVisible();
  await admin.close();

  // Customer sees it's ready.
  await page.reload();
  await expect(card.getByText("Pronto para retirar")).toBeVisible();
  await expect(card).toContainText("Seu pedido está pronto!");
});

test("the webhook rejects unsigned requests", async ({ request }) => {
  const response = await request.post("/api/webhooks/stripe", {
    data: { type: "checkout.session.completed" },
    headers: { "stripe-signature": "t=1,v1=forged" },
  });
  expect(response.status()).toBe(400);
});
