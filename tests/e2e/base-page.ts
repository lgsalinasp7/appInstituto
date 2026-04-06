import { type Page } from "@playwright/test";

export class BasePage {
  constructor(public readonly page: Page) {}

  async goto(path: string) {
    await this.page.goto(path);
  }

  async waitForLoad() {
    await this.page.waitForLoadState("networkidle");
  }
}
