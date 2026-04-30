import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login-page";

/**
 * E2E: Flujo de completar leccion en Academia.
 *
 * TODO: requires test seed (alumno + modulo + leccion).
 * Estos tests estan en skip hasta que exista un seed automatico para tests.
 *
 * Pre-requisitos para activar:
 *  - Usuario alumno con sesion valida en kaledacademy.localhost.
 *  - Al menos un modulo con leccion no completada.
 */
test.describe("Academia - Lesson completion flow", () => {
  test.skip("alumno puede ver modulo y abrir una leccion", async ({ page }) => {
    // TODO: requires test seed
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.fillEmail("alumno@kaledacademy.test");
    await loginPage.fillPassword("AlumnoPass123!");
    await loginPage.submit();
    await page.waitForURL("**/dashboard**");

    // Ir a academia
    await page.goto("/academia");
    await expect(page).toHaveURL(/academia/);

    // Ubicar primer modulo y abrirlo
    const firstModule = page
      .getByRole("link", { name: /modulo|leccion/i })
      .first();
    await expect(firstModule).toBeVisible({ timeout: 10000 });
    await firstModule.click();

    // Verificar contenido de leccion visible
    await expect(
      page.getByRole("heading", { name: /leccion|tema|contenido/i })
    ).toBeVisible({ timeout: 10000 });
  });

  test.skip("alumno puede marcar leccion como completada", async ({ page }) => {
    // TODO: requires test seed
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.fillEmail("alumno@kaledacademy.test");
    await loginPage.fillPassword("AlumnoPass123!");
    await loginPage.submit();
    await page.waitForURL("**/dashboard**");

    await page.goto("/academia");

    // Abrir primera leccion disponible
    const firstLesson = page
      .getByRole("link", { name: /leccion|modulo/i })
      .first();
    await firstLesson.click();

    // Click en "Marcar como completado"
    await page
      .getByRole("button", { name: /completad|terminad|finaliz/i })
      .click();

    // Verificar toast de exito
    const successToast = page.locator(
      '[data-sonner-toast][data-type="success"]'
    );
    await expect(successToast).toBeVisible({ timeout: 5000 });

    // Verificar badge de completado visible
    await expect(
      page.getByText(/completado|finalizado/i).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test.skip("leccion completada persiste al recargar", async ({ page }) => {
    // TODO: requires test seed
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.fillEmail("alumno@kaledacademy.test");
    await loginPage.fillPassword("AlumnoPass123!");
    await loginPage.submit();
    await page.waitForURL("**/dashboard**");

    await page.goto("/academia");
    await page.reload();

    // Verificar que al menos una leccion muestra estado completado
    const completedBadge = page.getByText(/completado|finalizado/i).first();
    await expect(completedBadge).toBeVisible({ timeout: 10000 });
  });
});
