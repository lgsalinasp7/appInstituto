import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login-page";

test.describe("Login page", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test("shows login page with email and password fields", async () => {
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test("shows error with invalid credentials", async () => {
    await loginPage.fillEmail("nonexistent@test.com");
    await loginPage.fillPassword("wrongpassword123");
    await loginPage.submit();
    await loginPage.expectErrorVisible();
  });

  test.skip("navigates to dashboard after successful login", async () => {
    // Skipped: requires a test user seeded in the database.
    // To enable, create a test user and fill valid credentials below.
    await loginPage.fillEmail("testuser@example.com");
    await loginPage.fillPassword("ValidPassword123!");
    await loginPage.submit();
    await loginPage.page.waitForURL("**/dashboard**");
    await expect(loginPage.page).toHaveURL(/dashboard/);
  });
});
