import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login-page";

/**
 * E2E: Leaderboard de Academia se actualiza tras completar leccion.
 *
 * TODO: requires test seed (alumno + leccion + leaderboard data).
 * Estos tests estan en skip hasta que exista un seed automatico para tests.
 *
 * Pre-requisitos para activar:
 *  - Usuario alumno con sesion valida.
 *  - Leaderboard visible con al menos 2 alumnos.
 */
test.describe("Academia - Leaderboard flow", () => {
  test.skip("alumno puede ver el leaderboard", async ({ page }) => {
    // TODO: requires test seed
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.fillEmail("alumno@kaledacademy.test");
    await loginPage.fillPassword("AlumnoPass123!");
    await loginPage.submit();
    await page.waitForURL("**/dashboard**");

    await page.goto("/academia/leaderboard");
    await expect(page).toHaveURL(/leaderboard/);

    // Verificar tabla/lista de ranking
    await expect(
      page.getByRole("heading", { name: /ranking|leaderboard|tabla/i })
    ).toBeVisible({ timeout: 10000 });

    // Al menos una fila visible
    const firstEntry = page.locator("table tbody tr, [role='row']").first();
    await expect(firstEntry).toBeVisible({ timeout: 10000 });
  });

  test.skip("ranking se actualiza tras completar leccion", async ({ page }) => {
    // TODO: requires test seed
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.fillEmail("alumno@kaledacademy.test");
    await loginPage.fillPassword("AlumnoPass123!");
    await loginPage.submit();
    await page.waitForURL("**/dashboard**");

    // Capturar puntos iniciales en leaderboard
    await page.goto("/academia/leaderboard");
    const initialPoints = await page
      .locator("[data-testid='user-points'], table tbody tr")
      .first()
      .textContent();

    // Completar una leccion
    await page.goto("/academia");
    await page
      .getByRole("link", { name: /leccion|modulo/i })
      .first()
      .click();
    await page
      .getByRole("button", { name: /completad|terminad|finaliz/i })
      .click();

    // Volver al leaderboard y verificar cambio
    await page.goto("/academia/leaderboard");
    await page.reload();
    const updatedPoints = await page
      .locator("[data-testid='user-points'], table tbody tr")
      .first()
      .textContent();

    expect(updatedPoints).not.toEqual(initialPoints);
  });
});
