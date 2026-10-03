import { expect, test } from "@playwright/test";

import { SLUG } from "./helpers";

test("the panel requires a login", async ({ page }) => {
  await page.goto(`/${SLUG}/admin`);
  await expect(page).toHaveURL(new RegExp(`/${SLUG}/admin/login`));
});

test("a wrong password is refused", async ({ page }) => {
  await page.goto(`/${SLUG}/admin/login`);
  await page.getByLabel("E-mail").fill("demo@tigela.com");
  await page.getByLabel("Senha").fill("senha-errada");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/${SLUG}/admin/login`));
});
