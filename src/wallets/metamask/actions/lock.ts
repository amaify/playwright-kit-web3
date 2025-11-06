import { expect, type Page } from "@playwright/test";
import { homepageSelectors } from "../selectors/homepage-selectors";

export async function lockWallet(page: Page) {
    const unlockPageTitle = "unlock-page-title";
    const lockButton = page.getByTestId(homepageSelectors.lockButton);

    await expect(lockButton).toBeVisible();
    await lockButton.click();

    await expect(page.getByTestId(unlockPageTitle)).toBeVisible();
}
