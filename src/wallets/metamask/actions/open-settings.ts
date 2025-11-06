import { expect, type Page } from "@playwright/test";
import { homepageSelectors } from "../selectors/homepage-selectors";

export async function openSettings(page: Page) {
    const settingsButton = page.getByTestId(homepageSelectors.openSettingsButton);

    await expect(settingsButton).toBeVisible();
    await settingsButton.click();

    await expect(page.getByTestId(homepageSelectors.settingsMenu)).toBeVisible();
}
