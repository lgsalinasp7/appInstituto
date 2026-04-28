import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login-page";

/**
 * E2E: Flujo de pago / recaudo.
 *
 * TODO: requires test seed (admin user + estudiante con saldo pendiente).
 * Estos tests estan en skip hasta que exista un seed automatico para tests.
 */
test.describe("Payment flow (recaudos)", () => {
  test.skip("admin can register a new payment for a student", async ({
    page,
  }) => {
    // TODO: requires test seed
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.fillEmail("admin@kaledacademy.test");
    await loginPage.fillPassword("AdminPass123!");
    await loginPage.submit();
    await page.waitForURL("**/dashboard**");

    // Ir a recaudos
    await page.goto("/recaudos");
    await expect(page).toHaveURL(/recaudos/);

    // Capturar saldo inicial del primer estudiante
    const firstRow = page.locator("table tbody tr").first();
    await expect(firstRow).toBeVisible({ timeout: 10000 });
    const initialBalanceText = await firstRow
      .locator("[data-testid='student-balance'], td")
      .last()
      .textContent();

    // Abrir modal de pago
    await firstRow.getByRole("button", { name: /pagar|registrar pago/i }).click();

    // Llenar pago
    await page.getByRole("spinbutton", { name: /monto|valor/i }).fill("50000");
    await page
      .getByRole("combobox", { name: /metodo|tipo/i })
      .selectOption({ index: 1 });
    await page
      .getByRole("button", { name: /guardar|confirmar|registrar/i })
      .click();

    // Verificar toast de exito
    const successToast = page.locator(
      '[data-sonner-toast][data-type="success"]'
    );
    await expect(successToast).toBeVisible({ timeout: 5000 });

    // Verificar que el saldo cambio
    const updatedBalanceText = await firstRow
      .locator("[data-testid='student-balance'], td")
      .last()
      .textContent();
    expect(updatedBalanceText).not.toEqual(initialBalanceText);
  });

  test.skip("listing /recaudos requires authentication", async ({ page }) => {
    // TODO: requires test seed
    await page.goto("/recaudos");
    await page.waitForURL("**/auth/login**", { timeout: 10000 });
    await expect(page).toHaveURL(/auth\/login/);
  });
});
