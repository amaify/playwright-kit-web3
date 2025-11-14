import { expect, type Locator, type Page } from "@playwright/test";
import { skip } from "@/tests/utils/skip";
import { accountSelectors, homepageSelectors } from "../selectors/homepage-selectors";

export type SwitchAccount = {
    page: Page;
    accountName: string;
};

export async function switchAccount({ page, accountName }: SwitchAccount) {
    const accountMenuButton = page.getByTestId(homepageSelectors.accountMenuButton);
    const accountMenuTextContent = await accountMenuButton.textContent();

    skip(
        accountMenuTextContent === accountName,
        `Can't switch account "${accountName}" already selected. Skipping test.`,
    );

    await expect(accountMenuButton).toBeVisible({ timeout: 15_000 });
    await accountMenuButton.click();
    await expect(page.getByRole("heading", { name: /accounts/i })).toBeVisible();

    const addAccountButtonLoading = page.getByTestId(accountSelectors.addMultichainAccountButton);
    const startTextContent = await addAccountButtonLoading.textContent();

    if (startTextContent?.includes("Syncing")) {
        await expect
            .poll(async () => (await addAccountButtonLoading.textContent())?.trim() ?? "", { timeout: 60_000 })
            .not.toBe(startTextContent);
    }

    const accountCells = await page.getByTestId(/^multichain-account-cell-entropy:/).all();
    let currentAccount: Locator | null = null;

    for (const accountCell of accountCells) {
        const textContent = await accountCell.textContent();

        if (textContent?.includes(accountName)) {
            currentAccount = accountCell;
            break;
        }
    }

    if (!currentAccount) {
        skip(!currentAccount, `Account with name "${accountName}" not found.`);
    }

    await currentAccount?.click();
}
