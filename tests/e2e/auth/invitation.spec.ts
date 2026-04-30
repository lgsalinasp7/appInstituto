import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login-page";

/**
 * E2E: Flujo de invitacion + aceptacion de usuario.
 *
 * TODO: requires test seed (admin + invitation token valido).
 * Estos tests estan en skip hasta que exista un seed automatico para tests.
 *
 * Pre-requisitos para activar:
 *  - Usuario admin con permiso de crear invitaciones.
 *  - SMTP/mock de email para capturar el token.
 */
test.describe("Invitation flow", () => {
  test.skip("admin puede crear una invitacion para nuevo usuario", async ({
    page,
  }) => {
    // TODO: requires test seed
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.fillEmail("admin@kaledacademy.test");
    await loginPage.fillPassword("AdminPass123!");
    await loginPage.submit();
    await page.waitForURL("**/dashboard**");

    // Ir a usuarios/invitaciones
    await page.goto("/usuarios");
    await page
      .getByRole("button", { name: /invitar|nueva invitaci/i })
      .click();

    // Llenar modal
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 5000 });

    await dialog
      .getByRole("textbox", { name: /email|correo/i })
      .fill("nuevo@kaledacademy.test");
    await dialog
      .getByRole("combobox", { name: /rol|permiso/i })
      .selectOption({ index: 1 });

    await dialog
      .getByRole("button", { name: /enviar|invitar|crear/i })
      .click();

    // Verificar toast
    const successToast = page.locator(
      '[data-sonner-toast][data-type="success"]'
    );
    await expect(successToast).toBeVisible({ timeout: 5000 });
  });

  test.skip("usuario invitado puede aceptar invitacion con token valido", async ({
    page,
  }) => {
    // TODO: requires test seed (token capturado del email mock)
    const validToken = "TEST_INVITATION_TOKEN";
    await page.goto(`/auth/aceptar-invitacion?token=${validToken}`);

    await expect(
      page.getByRole("heading", { name: /invitaci|bienvenido|aceptar/i })
    ).toBeVisible({ timeout: 10000 });

    // Llenar formulario de aceptacion
    await page
      .getByRole("textbox", { name: /nombre/i })
      .fill("Usuario Nuevo");
    await page.locator('input[type="password"]').first().fill("NuevoPass123!");
    await page
      .locator('input[type="password"]')
      .nth(1)
      .fill("NuevoPass123!");

    await page
      .getByRole("button", { name: /aceptar|continuar|crear/i })
      .click();

    // Verificar redireccion a dashboard
    await page.waitForURL("**/dashboard**", { timeout: 10000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  test.skip("invitacion con token invalido muestra error", async ({ page }) => {
    // TODO: requires test seed
    await page.goto("/auth/aceptar-invitacion?token=INVALID_TOKEN");

    await expect(
      page.getByText(/invalid|expirad|no valid/i)
    ).toBeVisible({ timeout: 10000 });
  });
});
