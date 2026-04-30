import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login-page";

/**
 * E2E: Flujo de recaudo - procesar pago + verificar saldo actualizado.
 *
 * Diferenciado de payment.spec.ts: este se enfoca en flujo completo de recaudo
 * con conciliacion (verificacion saldo despues + visualizacion en historial).
 *
 * TODO: requires test seed (admin + estudiante con saldo + cuenta bancaria).
 * Estos tests estan en skip hasta que exista un seed automatico para tests.
 */
test.describe("Recaudo - procesamiento de pago + saldo", () => {
  test.skip("procesar pago reduce el saldo del estudiante", async ({
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

    // Capturar saldo inicial
    const firstRow = page.locator("table tbody tr").first();
    await expect(firstRow).toBeVisible({ timeout: 10000 });
    const initialBalance = await firstRow
      .locator("[data-testid='student-balance'], td")
      .last()
      .textContent();
    const initialNumber = parseFloat(
      (initialBalance ?? "0").replace(/[^0-9.-]/g, "")
    );

    // Abrir modal de recaudo
    await firstRow
      .getByRole("button", { name: /pagar|recaudar|registrar/i })
      .click();

    const dialog = page.getByRole("dialog");
    await dialog
      .getByRole("spinbutton", { name: /monto|valor/i })
      .fill("25000");
    await dialog
      .getByRole("combobox", { name: /metodo|tipo/i })
      .selectOption({ index: 1 });
    await dialog
      .getByRole("button", { name: /guardar|confirmar|registrar/i })
      .click();

    // Verificar toast de exito
    const successToast = page.locator(
      '[data-sonner-toast][data-type="success"]'
    );
    await expect(successToast).toBeVisible({ timeout: 5000 });

    // Verificar que saldo se redujo
    await page.reload();
    const updatedBalance = await firstRow
      .locator("[data-testid='student-balance'], td")
      .last()
      .textContent();
    const updatedNumber = parseFloat(
      (updatedBalance ?? "0").replace(/[^0-9.-]/g, "")
    );

    expect(updatedNumber).toBeLessThan(initialNumber);
  });

  test.skip("recaudo aparece en historial de pagos del estudiante", async ({
    page,
  }) => {
    // TODO: requires test seed
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.fillEmail("admin@kaledacademy.test");
    await loginPage.fillPassword("AdminPass123!");
    await loginPage.submit();
    await page.waitForURL("**/dashboard**");

    await page.goto("/recaudos");

    // Click en estudiante para ver historial
    const firstRow = page.locator("table tbody tr").first();
    await firstRow.click();

    // Ver tab/seccion de historial
    const historialTab = page.getByRole("tab", {
      name: /historial|pagos|movimientos/i,
    });
    if (await historialTab.isVisible().catch(() => false)) {
      await historialTab.click();
    }

    // Verificar que existe al menos un registro de pago
    const pagoRow = page
      .locator("table tbody tr, [role='row']")
      .first();
    await expect(pagoRow).toBeVisible({ timeout: 10000 });
  });

  test.skip("recaudo con monto cero es rechazado", async ({ page }) => {
    // TODO: requires test seed
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.fillEmail("admin@kaledacademy.test");
    await loginPage.fillPassword("AdminPass123!");
    await loginPage.submit();
    await page.waitForURL("**/dashboard**");

    await page.goto("/recaudos");

    const firstRow = page.locator("table tbody tr").first();
    await firstRow
      .getByRole("button", { name: /pagar|recaudar|registrar/i })
      .click();

    const dialog = page.getByRole("dialog");
    await dialog.getByRole("spinbutton", { name: /monto|valor/i }).fill("0");
    await dialog
      .getByRole("button", { name: /guardar|confirmar|registrar/i })
      .click();

    // Modal sigue abierto (validacion bloquea)
    await expect(dialog).toBeVisible();
  });
});
