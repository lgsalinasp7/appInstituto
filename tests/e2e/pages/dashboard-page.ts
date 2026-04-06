import { type Page, type Locator, expect } from "@playwright/test";
import { BasePage } from "../base-page";

export class DashboardPage extends BasePage {
  readonly sidebar: Locator;
  readonly navLinks: Locator;

  constructor(page: Page) {
    super(page);
    this.sidebar = page.locator("nav, aside, [role='navigation']").first();
    this.navLinks = this.sidebar.locator("a");
  }

  async navigate() {
    await this.goto("/dashboard");
  }

  async expectSidebarVisible() {
    await expect(this.sidebar).toBeVisible({ timeout: 10000 });
  }

  async expectNavLinksPresent() {
    await expect(this.navLinks.first()).toBeVisible({ timeout: 10000 });
  }

  async getNavLinkTexts(): Promise<string[]> {
    return this.navLinks.allTextContents();
  }
}
