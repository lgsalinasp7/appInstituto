import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login-page";

/**
 * E2E: Flujo crear compromiso de pago via modal (CarteraView).
 * Implementado en Ola 2.7b PR #39.
 *
 * TODO: requires test seed (admin user + estudiante con deuda).
 * Estos tests estan en skip hasta que exista un seed automatico para tests.
 *
 * Pre-requisitos para activar:
 *  - Usuario admin con sesion valida.
 *  - Al menos un estudiante con saldo > 0 visible en CarteraView.
 */
test.describe("Cartera - Payment Commitment flow", () => {
  test.skip("admin can create a new payment commitment via modal", async ({
    page,
  }) => {
    // TODO: requires test seed
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.fillEmail("admin@kaledacademy.test");
    await loginPage.fillPassword("AdminPass123!");
    await loginPage.submit();
    await page.waitForURL("**/dashboard**");

    // Ir a recaudos (donde vive CarteraView)
    await page.goto("/recaudos");
    await expect(page).toHaveURL(/recaudos/);

    // Cambiar a la vista de cartera si hay tabs
    const carteraTab = page.getByRole("tab", { name: /cartera|deudores/i });
    if (await carteraTab.isVisible().catch(() => false)) {
      await carteraTab.click();
    }

    // Ubicar primer estudiante con deuda y abrir modal de compromiso
    const firstDebtor = page.locator("table tbody tr").first();
    await expect(firstDebtor).toBeVisible({ timeout: 10000 });
    await firstDebtor
      .getByRole("button", { name: /compromiso|comprometer|acuerdo/i })
      .click();

    // Llenar modal: monto + fecha + nota
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 5000 });

    await dialog
      .getByRole("spinbutton", { name: /monto|valor/i })
      .fill("100000");

    // Fecha futura (ej. 7 dias adelante)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const isoDate = futureDate.toISOString().split("T")[0];
    await dialog.locator('input[type="date"]').fill(isoDate);

    const notaField = dialog.getByRole("textbox", { name: /nota|comentario|observ/i });
    if (await notaField.isVisible().catch(() => false)) {
      await notaField.fill("Compromiso de pago E2E test");
    }

    // Guardar
    await dialog
      .getByRole("button", { name: /guardar|crear|confirmar/i })
      .click();

    // Verificar toast
    const successToast = page.locator(
      '[data-sonner-toast][data-type="success"]'
    );
    await expect(successToast).toBeVisible({ timeout: 5000 });

    // Verificar que el compromiso aparece en la lista
    await expect(page.getByText(/compromiso|acuerdo/i).first()).toBeVisible({
      timeout: 10000,
    });
  });

  test.skip("commitment modal validates required fields", async ({ page }) => {
    // TODO: requires test seed
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.fillEmail("admin@kaledacademy.test");
    await loginPage.fillPassword("AdminPass123!");
    await loginPage.submit();
    await page.waitForURL("**/dashboard**");

    await page.goto("/recaudos");

    const firstDebtor = page.locator("table tbody tr").first();
    await firstDebtor
      .getByRole("button", { name: /compromiso|comprometer|acuerdo/i })
      .click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Intentar guardar vacio
    await dialog
      .getByRole("button", { name: /guardar|crear|confirmar/i })
      .click();

    // Debe seguir abierto (validacion bloqueo submit)
    await expect(dialog).toBeVisible();
  });
});
