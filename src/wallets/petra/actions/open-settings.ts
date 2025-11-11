import { expect, type Page } from "@playwright/test";
import { homepageSelectors } from "../selectors/homepage-selectors";

export async function openSettings(page: Page) {
    const settingsButton = page.locator(homepageSelectors.settingsMenu);

    await expect(settingsButton).toBeVisible();
    await settingsButton.click();

    await expect(page.getByText("Settings").first()).toBeVisible();
}
