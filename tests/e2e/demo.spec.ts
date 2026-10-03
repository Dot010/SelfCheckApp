import { expect, test } from "@playwright/test";

import { SLUG } from "./helpers";

// Only meaningful when the server runs with DEMO_MODE="true" (as in CI).
test.skip(process.env.DEMO_MODE !== "true", "demo mode is off");

test("visitors reach the kitchen panel in one click", async ({ page }) => {
  await page.goto(`/${SLUG}`);
  await expect(
    page.getByText("Este é um projeto de demonstração"),
  ).toBeVisible();
  await page.getByRole("link", { name: "Painel da cozinha" }).click();
  await page
    .getByRole("button", { name: "Entrar com a conta de demonstração" })
    .click();
  await page.waitForURL(`**/${SLUG}/admin`);
  await expect(page.getByRole("heading", { name: "Pedidos" })).toBeVisible();
});

test("checkout can be filled with test data", async ({ page }) => {
  await page.goto(`/${SLUG}/menu?consumptionMethod=DINE_IN`);
  await page.getByRole("link", { name: /Açaí do seu jeito/ }).click();
  await page.getByRole("button", { name: /Adicionar ·/ }).click();
  await page.getByRole("button", { name: "Finalizar pedido" }).click();

  await expect(page.getByText("4242 4242 4242 4242")).toBeVisible();
  await page
    .getByRole("button", { name: "Preencher com dados de teste" })
    .click();
  await expect(page.getByPlaceholder("Digite seu nome...")).toHaveValue(
    "Visitante",
  );
  await expect(page.getByPlaceholder("Digite seu CPF...")).toHaveValue(
    /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  );
  // A valid CPF means no validation error after submitting.
  await page.getByRole("button", { name: "Finalizar", exact: true }).click();
  await expect(page.getByText("CPF inválido.")).toHaveCount(0);
});
