import { expect } from "@playwright/test";
import picocolors from "picocolors";
import type { Page } from "playwright-core";
import { homepageSelectors } from "../selectors/homepage-selectors";
import { onboardSelectors } from "../selectors/onboard-selectors";
import type { OnboardingArgs } from "../types";

type Onboard = OnboardingArgs & {
    page: Page;
};

export default async function onboard({ page, mode, password, ...args }: Onboard) {
    console.info(picocolors.yellowBright(`\n 🦊 MetaMask onboarding started...`));

    const createWalletButton = page.getByTestId(onboardSelectors.createWalletButton);
    const importWalletButton = page.getByTestId(onboardSelectors.importWalletButton);
    const createNewPasswordInput = page.getByTestId(onboardSelectors.createNewPasswordInput);
    const confirmNewPasswordInput = page.getByTestId(onboardSelectors.confirmNewPasswordInput);
    const confirmPasswordCheckbox = page.getByTestId(onboardSelectors.confirmPasswordCheckbox);
    const createPasswordButton = page.getByTestId(onboardSelectors.createPasswordButton);
    const metamaskMetricsIAgreeButton = page.getByTestId(onboardSelectors.metamaskMetricsIAgreeButton);
    const onboardingDoneButton = page.getByTestId(onboardSelectors.onboardingDoneButton);

    if (mode === "create") {
        const useSecretRecoveryPhraseButton = page.getByTestId(onboardSelectors.useSecretRecoveryPhraseButton);
        await expect(createWalletButton).toBeVisible();
        await createWalletButton.click();

        await expect(useSecretRecoveryPhraseButton).toBeVisible();
        await useSecretRecoveryPhraseButton.click();

        await expect(createNewPasswordInput).toBeVisible();
        await createNewPasswordInput.fill(password);

        await expect(confirmNewPasswordInput).toBeVisible();
        await confirmNewPasswordInput.fill(password);

        await expect(confirmPasswordCheckbox).toBeVisible();
        await confirmPasswordCheckbox.click();

        await expect(createPasswordButton).toBeVisible();
        await createPasswordButton.click();

        const revealSecretRecoveryPhraseButton = page.getByTestId(onboardSelectors.revealSecretRecoveryPhraseButton);
        await expect(revealSecretRecoveryPhraseButton).toBeVisible();
        await revealSecretRecoveryPhraseButton.click();

        const recoveryPhraseRemindMeLaterButton = page.getByTestId(onboardSelectors.recoveryPhraseRemindMeLaterButton);
        await expect(recoveryPhraseRemindMeLaterButton).toBeVisible();
        await recoveryPhraseRemindMeLaterButton.click();

        await expect(metamaskMetricsIAgreeButton).toBeVisible();
        await metamaskMetricsIAgreeButton.click();

        await expect(onboardingDoneButton).toBeVisible();
        await onboardingDoneButton.click();

        await expect(page.getByTestId(homepageSelectors.buyButton)).toBeVisible();
        await expect(page.getByTestId(homepageSelectors.swapButton)).toBeVisible();
        await expect(page.getByTestId(homepageSelectors.sendButton)).toBeVisible();
        await expect(page.getByTestId(homepageSelectors.receiveButton)).toBeVisible();

        console.info(picocolors.greenBright("✨ MetaMask onboarding completed successfully"));
        return;
    }

    const recoveryPhrase = "secretRecoveryPhrase" in args ? (args.secretRecoveryPhrase?.split(" ") ?? []) : [];
    const importUsingSecretRecoveryPhraseButton = page.getByTestId(
        onboardSelectors.importUsingSecretRecoveryPhraseButton,
    );

    await expect(importWalletButton).toBeVisible();
    await importWalletButton.click();

    await expect(importUsingSecretRecoveryPhraseButton).toBeVisible();
    await importUsingSecretRecoveryPhraseButton.click();

    const initialSecretRecoveryPhraseTextAreaInput = page.getByTestId(
        onboardSelectors.secretRecoveryPhraseTextAreaInput,
    );
    await initialSecretRecoveryPhraseTextAreaInput.fill(recoveryPhrase[0] as string);
    await initialSecretRecoveryPhraseTextAreaInput.press("Space");

    for (let i = 1; i < recoveryPhrase.length; i++) {
        const inputField = page.getByTestId(`import-srp__srp-word-${i}`);
        await inputField.fill(recoveryPhrase[i] as string);
        await inputField.press("Space");
    }

    const importWalletConfirmButton = page.getByTestId(onboardSelectors.importWalletConfirmButton);
    await expect(importWalletConfirmButton).toBeVisible();
    await expect(importWalletConfirmButton).toBeEnabled();
    await importWalletConfirmButton.click();

    await expect(createNewPasswordInput).toBeVisible();
    await createNewPasswordInput.fill(password);

    await expect(confirmNewPasswordInput).toBeVisible();
    await confirmNewPasswordInput.fill(password);

    await expect(confirmPasswordCheckbox).toBeVisible();
    await confirmPasswordCheckbox.click();

    await expect(createPasswordButton).toBeVisible();
    await createPasswordButton.click();

    await expect(metamaskMetricsIAgreeButton).toBeVisible();
    await metamaskMetricsIAgreeButton.click();

    const walletReadyBox = page.getByTestId("wallet-ready");
    await expect(walletReadyBox).toContainText(/your wallet is ready/i);
    await expect(onboardingDoneButton).toBeVisible();
    await onboardingDoneButton.click();

    await expect(page.getByTestId(homepageSelectors.buyButton)).toBeVisible();
    await expect(page.getByTestId(homepageSelectors.swapButton)).toBeVisible();
    await expect(page.getByTestId(homepageSelectors.sendButton)).toBeVisible();
    await expect(page.getByTestId(homepageSelectors.receiveButton)).toBeVisible();

    console.info(picocolors.greenBright("✨ MetaMask onboarding completed successfully"));
}
