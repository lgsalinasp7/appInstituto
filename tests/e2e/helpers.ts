import { type Page } from "@playwright/test";

/**
 * Fills login form and submits.
 * Assumes page is already on /auth/login.
 */
export async function login(page: Page, email: string, password: string) {
  await page.getByRole("textbox", { name: /correo/i }).fill(email);
  await page.getByRole("textbox", { name: /contrase/i }).fill(password);
  await page.getByRole("button", { name: /ingresar|continuar/i }).click();
}

/**
 * Waits for a specific API response matching the given URL pattern.
 * Returns the Response object for further assertions.
 */
export async function waitForApiResponse(page: Page, urlPattern: string) {
  return page.waitForResponse(
    (resp) => resp.url().includes(urlPattern) && resp.status() < 400
  );
}
