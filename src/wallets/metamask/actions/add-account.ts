import { expect, type Locator, type Page } from "@playwright/test";
import z from "zod";
import { skip } from "@/tests/utils/skip";
import { accountSelectors, homepageSelectors } from "../selectors/homepage-selectors";
import { onboardSelectors } from "../selectors/onboard-selectors";
import type { AddAccountArgs } from "../types";

type AddAccount = AddAccountArgs & {
    page: Page;
};

export async function addAccount({ page, privateKey, accountName }: AddAccount) {
    const parsedAccountName = z.string().min(1, "Account name cannot be an empty string").trim().parse(accountName);
    const parsedPrivateKey = z.string().min(1, "Private key cannot be an empty string").trim().parse(privateKey);

    const accountMenuButton = page.getByTestId(homepageSelectors.accountMenuButton);

    await expect(accountMenuButton).toBeVisible({ timeout: 15_000 });
    await accountMenuButton.click();
    await expect(page.getByRole("heading", { name: /accounts/i })).toBeVisible();

    const addWalletButton = page.getByTestId(accountSelectors.addWalletButton);
    await addWalletButton.click();

    const addWalletModal = page.getByRole("dialog");
    await expect(addWalletModal).toContainText(/add wallet/i);

    const importAccountButton = page.getByTestId(accountSelectors.importAccountButton);
    await importAccountButton.click();

    const inputField = page.locator("input[id='private-key-box']");
    await inputField.fill(parsedPrivateKey);

    const confirmButton = page.getByTestId(onboardSelectors.importAccountConfirmButton);
    await expect(confirmButton).toBeEnabled();
    await confirmButton.click();

    const importSRPError = page.getByTestId(onboardSelectors.importSRPError);
    const isErrorVisible = await importSRPError.isVisible().catch(() => false);

    if (isErrorVisible) {
        skip(isErrorVisible, `${(await importSRPError.textContent())?.split(".")[0]}`);
    }

    const activeAccount = page.locator(
        "div:has(> div[data-testid^='multichain-account-cell-keyring'][data-testid$='-selected-indicator'])",
    );

    const activeAccountName = (await activeAccount.textContent())?.split("$")[0];

    if (activeAccountName) {
        await renameImportedAccount({
            page,
            accountName: parsedAccountName,
            activeAccountLocator: activeAccount,
            activeAccountName,
        });
    }

    const backButton = page.locator("button[aria-label='Back']").first();
    await backButton.click();
}

type RenameImportedAccount = {
    page: Page;
    accountName: string;
    activeAccountName: string;
    activeAccountLocator: Locator;
};

async function renameImportedAccount({
    page,
    accountName,
    activeAccountLocator,
    activeAccountName,
}: RenameImportedAccount) {
    const optionsButton = activeAccountLocator.locator(`div[aria-label='${activeAccountName} options']`);

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
    await inputField.fill(accountName);

    const confirmButton = dialog.getByRole("button", { name: /confirm/i });
    await expect(confirmButton).toBeEnabled();
    await confirmButton.click();

    const activeAccount = page.locator(
        "div:has(> div[data-testid^='multichain-account-cell-keyring'][data-testid$='-selected-indicator'])",
    );

    await expect(activeAccount).toContainText(accountName);
}
