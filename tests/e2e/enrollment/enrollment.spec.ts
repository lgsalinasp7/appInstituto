import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login-page";

/**
 * E2E: Flujo matricula academia.
 *
 * TODO: requires test seed (admin user + tenant kaledacademy + programa activo).
 * Estos tests estan en skip hasta que exista un seed automatico para tests.
 *
 * Pre-requisitos para activar:
 *  - Tenant kaledacademy configurado en hosts file (kaledacademy.localhost).
 *  - Usuario admin con email/password conocidos seedeado en DB de test.
 *  - Al menos un programa academico activo.
 */
test.describe("Enrollment flow (academia)", () => {
  test.skip("admin can create a new student via /matriculas", async ({
    page,
  }) => {
    // TODO: requires test seed
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.fillEmail("admin@kaledacademy.test");
    await loginPage.fillPassword("AdminPass123!");
    await loginPage.submit();
    await page.waitForURL("**/dashboard**");

    // Ir a matriculas
    await page.goto("/matriculas");
    await expect(page).toHaveURL(/matriculas/);

    // Abrir modal nuevo estudiante
    await page.getByRole("button", { name: /nuevo|crear|agregar/i }).click();

    // Llenar formulario minimo
    const uniqueEmail = `student-${Date.now()}@test.com`;
    await page
      .getByRole("textbox", { name: /nombre/i })
      .fill("Estudiante Test");
    await page.getByRole("textbox", { name: /correo|email/i }).fill(uniqueEmail);
    await page.getByRole("textbox", { name: /telefono|tel/i }).fill("3001234567");
    await page.getByRole("button", { name: /guardar|crear|registrar/i }).click();

    // Verificar toast de exito
    const successToast = page.locator(
      '[data-sonner-toast][data-type="success"]'
    );
    await expect(successToast).toBeVisible({ timeout: 5000 });

    // Verificar que el estudiante aparece en la lista
    await expect(page.getByText(uniqueEmail)).toBeVisible({ timeout: 10000 });
  });

  test.skip("listing /matriculas requires authentication", async ({ page }) => {
    // TODO: requires test seed (or just testing redirect)
    await page.goto("/matriculas");
    await page.waitForURL("**/auth/login**", { timeout: 10000 });
    await expect(page).toHaveURL(/auth\/login/);
  });
});
