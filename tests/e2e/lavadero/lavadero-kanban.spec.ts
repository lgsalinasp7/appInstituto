import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login-page";

/**
 * E2E: Flujo Kanban Lavadero Pro.
 *
 * TODO: requires test seed (tenant lavadero-prueba + admin lavadero + orden RECEIVED).
 * Estos tests estan en skip hasta que exista un seed automatico para tests.
 *
 * Pre-requisitos para activar:
 *  - Subdominio lavadero-prueba.localhost en hosts file.
 *  - Usuario LAVADERO_ADMIN seedeado.
 *  - Al menos una orden en estado RECEIVED.
 */
test.describe("Lavadero kanban flow", () => {
  test.skip("supervisor can move order from RECEIVED to WASHING", async ({
    page,
  }) => {
    // TODO: requires test seed
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.fillEmail("admin@lavadero-prueba.test");
    await loginPage.fillPassword("LavaderoAdmin123!");
    await loginPage.submit();

    // Ir al dashboard del lavadero (kanban)
    await page.goto("/lavadero/admin/dashboard");
    await expect(page).toHaveURL(/lavadero\/admin\/dashboard/);

    // Verificar columnas del Kanban
    const columnReceived = page.locator(
      "[data-status='RECEIVED'], [data-column='RECEIVED']"
    );
    const columnWashing = page.locator(
      "[data-status='WASHING'], [data-column='WASHING']"
    );
    await expect(columnReceived.first()).toBeVisible({ timeout: 10000 });
    await expect(columnWashing.first()).toBeVisible({ timeout: 10000 });

    // Tomar la primera orden en RECEIVED
    const firstOrder = columnReceived
      .locator("[data-testid='order-card'], .order-card")
      .first();
    await expect(firstOrder).toBeVisible({ timeout: 10000 });

    const orderId = await firstOrder.getAttribute("data-order-id");
    expect(orderId).toBeTruthy();

    // Cambiar estado: drag-and-drop o boton de transicion
    // Intentamos primero con boton (mas estable que drag-drop en Playwright)
    await firstOrder.click();
    await page.getByRole("button", { name: /lavar|iniciar lavado|washing/i }).click();

    // Verificar toast
    const successToast = page.locator(
      '[data-sonner-toast][data-type="success"]'
    );
    await expect(successToast).toBeVisible({ timeout: 5000 });

    // Verificar que la orden ya no esta en RECEIVED
    const movedOrder = columnWashing.locator(`[data-order-id="${orderId}"]`);
    await expect(movedOrder).toBeVisible({ timeout: 10000 });
  });

  test.skip("dashboard /lavadero/admin/dashboard requires lavadero auth", async ({
    page,
  }) => {
    // TODO: requires test seed
    await page.goto("/lavadero/admin/dashboard");
    await page.waitForURL("**/auth/login**", { timeout: 10000 });
    await expect(page).toHaveURL(/auth\/login/);
  });
});
