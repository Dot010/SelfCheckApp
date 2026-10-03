import type { Page } from "@playwright/test";

export const SLUG = "tigela";
export const ADMIN_STATE = "test-results/.auth/admin.json";

export const loginAsAdmin = async (page: Page) => {
  await page.goto(`/${SLUG}/admin/login`);
  await page.getByLabel("E-mail").fill("demo@tigela.com");
  await page.getByLabel("Senha").fill("tigela123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL(`**/${SLUG}/admin`);
};

// A random CPF with valid check digits, so each run sees only its own orders.
export const randomCpf = () => {
  const digits = Array.from({ length: 9 }, () =>
    Math.floor(Math.random() * 10),
  );
  for (const length of [9, 10]) {
    const sum = digits
      .slice(0, length)
      .reduce((acc, digit, index) => acc + digit * (length + 1 - index), 0);
    const verifier = ((sum * 10) % 11) % 10;
    digits.push(verifier);
  }
  return digits.join("");
};
