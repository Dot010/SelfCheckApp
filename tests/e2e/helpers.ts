import type { Page } from "@playwright/test";

import { generateCpf } from "../../src/app/[slug]/menu/helpers/cpf";

export const SLUG = "tigela";
export const ADMIN_STATE = "test-results/.auth/admin.json";

export const loginAsAdmin = async (page: Page) => {
  await page.goto(`/${SLUG}/admin/login`);
  await page.getByLabel("E-mail").fill("demo@tigela.com");
  await page.getByLabel("Senha").fill("tigela123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForURL(`**/${SLUG}/admin`);
};

// Digits only, so it can be typed into the masked field.
export const randomCpf = () => generateCpf().replace(/\D/g, "");
