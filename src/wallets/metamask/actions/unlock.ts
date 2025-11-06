import { expect, type Page } from "@playwright/test";
import { getWalletPasswordFromCache } from "@/utils/wallets/get-wallet-password-from-cache";
import { unlockWalletSelectors } from "../selectors/homepage-selectors";

export default async function unlock(page: Page) {
    const walletPassword = await getWalletPasswordFromCache("metamask");

    const inputField = page.getByTestId(unlockWalletSelectors.passwordInput);
    await expect(inputField).toBeVisible();
    await inputField.fill(walletPassword);

    const unlockButton = page.getByTestId(unlockWalletSelectors.unlockButton);
    await expect(unlockButton).toBeVisible();
    await unlockButton.click();
}
