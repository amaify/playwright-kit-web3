import { expect, type Page } from "@playwright/test";
import { openSettings } from "./open-settings";

export async function lockWallet(page: Page) {
    await openSettings(page);

    const lockWalletButton = page.getByRole("button", { name: /lock wallet/i });
    await lockWalletButton.click();

    const unlockPageTitle = page.getByRole("heading", { name: /welcome/i });
    await expect(unlockPageTitle).toBeVisible();
}
