import { expect, type Locator, type Page } from "@playwright/test";
import { skip } from "@/tests/utils/skip";
import { accountSelectors, homepageSelectors } from "../selectors/homepage-selectors";

export type RenameAccount = {
    page: Page;
    currentAccountName: string;
    newAccountName: string;
};

export async function renameAccount({ page, currentAccountName, newAccountName }: RenameAccount) {
    const accountMenuButton = page.getByTestId(homepageSelectors.accountMenuButton);
    const accountMenuTextContent = await accountMenuButton.textContent();

    skip(
        accountMenuTextContent === newAccountName,
        `The account to be renamed "${newAccountName}" already exists. Skipping test.`,
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

        if (textContent?.includes(currentAccountName)) {
            currentAccount = accountCell;
            break;
        }
    }

    if (!currentAccount) {
        skip(!currentAccount, `Account with name "${currentAccountName}" not found.`);
    }

    const currentAccountText = await currentAccount?.textContent();

    if (currentAccountText?.split("$")[0] === newAccountName) {
        skip(
            currentAccountText?.split("$")[0] === newAccountName,
            `The new account name "${newAccountName}" is the same as the old account name "${currentAccountName}".`,
        );
    }

    const optionsButton = page.locator(`div[aria-label='${currentAccountName} options']`);

    await expect(optionsButton).toBeVisible();
    await optionsButton.click();

    await expect(page.getByRole("tooltip")).toBeVisible();
    const renameOption = page.locator(`div[aria-label='${accountSelectors.renameAccountLabel}']`);
    await expect(renameOption).toBeVisible();
    await renameOption.click();

    const dialog = page.getByRole("dialog");
    const dialogTitle = dialog.getByRole("heading", { name: /rename/i });
    await expect(dialogTitle).toBeVisible();

    const inputField = dialog.getByRole("textbox");
    await expect(inputField).toBeVisible();
    await inputField.fill(newAccountName);

    const confirmButton = dialog.getByRole("button", { name: /confirm/i });
    await expect(confirmButton).toBeEnabled();
    await confirmButton.click();

    for (const accountCell of accountCells) {
        const textContent = await accountCell.textContent();

        if (textContent?.includes(newAccountName)) {
            await expect(accountCell).toBeVisible();
            await expect(accountCell).toContainText(newAccountName);
            break;
        }
    }

    const backButton = page.locator("button[aria-label='Back']").nth(1);
    await backButton.click();
}
