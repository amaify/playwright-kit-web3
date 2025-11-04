import type { Page } from "@playwright/test";

export default async function waitForStablePage(page: Page) {
    await page.waitForLoadState("load", { timeout: 10_000 });
    await page.waitForLoadState("domcontentloaded", { timeout: 10_000 });
}
