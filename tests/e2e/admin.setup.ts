import { expect, test as setup } from "@playwright/test";

import { ADMIN_STATE, loginAsAdmin, SLUG } from "./helpers";

const WEEKDAYS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

// Logs in once for every test and opens the shop all day, so the suite
// doesn't depend on the time it runs.
setup("log in and open the shop", async ({ page }) => {
  await loginAsAdmin(page);
  await page.context().storageState({ path: ADMIN_STATE });

  await page.goto(`/${SLUG}/admin/configuracoes`);
  for (const day of WEEKDAYS) {
    await page.getByRole("switch", { name: `Abre ${day}` }).check();
    await page.getByLabel(`${day}: abre às`).fill("00:00");
    await page.getByLabel(`${day}: fecha às`).fill("23:59");
  }
  await page.getByRole("button", { name: "Salvar horários" }).click();
  await expect(page.getByText("Horários salvos")).toBeVisible();

  // Make sure orders aren't paused (e.g. left paused by a previous run).
  const pause = page.getByRole("switch", { name: /Pedidos pausados/ });
  if (await pause.isVisible()) {
    await pause.uncheck();
    await expect(page.getByText("Recebendo pedidos")).toBeVisible();
  }
});
