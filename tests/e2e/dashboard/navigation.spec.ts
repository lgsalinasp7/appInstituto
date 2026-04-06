import { test, expect } from "@playwright/test";
import { DashboardPage } from "../pages/dashboard-page";

test.describe("Dashboard navigation", () => {
  test("redirects to login if not authenticated", async ({ page }) => {
    await page.goto("/dashboard");
    // The protected layout redirects unauthenticated users to /auth/login
    await page.waitForURL("**/auth/login**", { timeout: 10000 });
    await expect(page).toHaveURL(/auth\/login/);
  });

  test.skip("shows sidebar navigation links when authenticated", async ({
    page,
  }) => {
    // Skipped: requires an authenticated session.
    // To enable, implement a login fixture or seed a session cookie.
    const dashboard = new DashboardPage(page);
    await dashboard.navigate();
    await dashboard.expectSidebarVisible();
    await dashboard.expectNavLinksPresent();

    const links = await dashboard.getNavLinkTexts();
    expect(links.length).toBeGreaterThan(0);
  });
});
