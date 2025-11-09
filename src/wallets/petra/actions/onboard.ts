import { expect, type Page } from "@playwright/test";
import picocolors from "picocolors";
import { sleep } from "@/utils/sleep";
import { PetraProfile } from "../petra-profile";
import { homepageSelectors } from "../selectors/homepage-selectors";
import { onboardSelectors } from "../selectors/onboard-selectors";
import type { OnboardingArgs } from "../types";

type Onboard = OnboardingArgs & {
    page: Page;
};

export default async function onboard({ page, mode, password, ...args }: Onboard) {
    console.info(picocolors.yellowBright(`\n Petra onboarding started...`));

    const petraProfile = new PetraProfile();

    const createAccountButton = page.locator(onboardSelectors.createWalletButton);
    const importWalletButton = page.locator(onboardSelectors.importWalletButton);
    const createNewPasswordInput = page.locator(onboardSelectors.createNewPasswordInput);
    const confirmNewPasswordInput = page.locator(onboardSelectors.confirmNewPasswordInput);
    const confirmPasswordCheckbox = page.locator(onboardSelectors.confirmPasswordCheckbox);
    const continueButton = page.locator(onboardSelectors.continueButton);
    const getStartedButton = page.locator(onboardSelectors.getStartedButton);
    const onboardingCompleteText = page.locator(onboardSelectors.onboardingCompleteText);

    if (mode === "create") {
        const createSeedPhraseButton = page.locator(onboardSelectors.createSeedPhraseButton);
        await expect(createAccountButton).toBeVisible();
        await createAccountButton.click();

        await expect(createSeedPhraseButton).toBeVisible();
        await createSeedPhraseButton.click();

        await expect(createNewPasswordInput).toBeVisible();
        await createNewPasswordInput.fill(password);

        await expect(confirmNewPasswordInput).toBeVisible();
        await confirmNewPasswordInput.fill(password);

        await expect(confirmPasswordCheckbox).toBeVisible();
        await confirmPasswordCheckbox.click();

        await expect(continueButton).toBeVisible();
        await continueButton.click();

        const skipCopyRecoveryPhraseButton = page.locator(onboardSelectors.skipCopyRecoveryPhraseButton);
        await expect(skipCopyRecoveryPhraseButton).toBeVisible();
        await skipCopyRecoveryPhraseButton.click();

        await expect(getStartedButton).toBeVisible();
        await getStartedButton.click();

        await expect(onboardingCompleteText).toBeVisible();
        await page.goto(await petraProfile.indexUrl());

        await expect(page.locator(homepageSelectors.depositButton)).toBeVisible();
        await expect(page.locator(homepageSelectors.sendButton)).toBeVisible();
    }

    if (mode === "importPrivateKey") {
        const privateKey = "privateKey" in args ? args.privateKey : "";
        const importPrivateKeyButton = page.locator(onboardSelectors.importUsingPrivateKeyButton);
        const privateKeyInput = page.locator(onboardSelectors.privateKeyInput);
        const importButton = page.locator(onboardSelectors.importButton);

        await expect(importWalletButton).toBeVisible();
        await importWalletButton.click();

        await expect(importPrivateKeyButton).toBeVisible();
        await importPrivateKeyButton.click();

        await expect(privateKeyInput).toBeVisible();
        await privateKeyInput.fill(privateKey);

        await expect(importButton).toBeEnabled();
        await importButton.click();

        await expect(createNewPasswordInput).toBeVisible();
        await createNewPasswordInput.fill(password);

        await expect(confirmNewPasswordInput).toBeVisible();
        await confirmNewPasswordInput.fill(password);

        await expect(confirmPasswordCheckbox).toBeVisible();
        await confirmPasswordCheckbox.click();

        await expect(continueButton).toBeEnabled();
        await continueButton.click();

        await expect(getStartedButton).toBeVisible();
        await getStartedButton.click();

        await expect(onboardingCompleteText).toBeVisible();
        await page.goto(await petraProfile.indexUrl());

        await expect(page.locator(homepageSelectors.depositButton)).toBeVisible();
        await expect(page.locator(homepageSelectors.sendButton)).toBeVisible();
    }

    if (mode === "importMnemonic") {
        const mnemonicPhrase = "secretRecoveryPhrase" in args ? args.secretRecoveryPhrase.split(" ") : [];
        const importMnemonicPhraseButton = page.locator(onboardSelectors.importUsingMnemonicButton);

        await expect(importWalletButton).toBeVisible();
        await importWalletButton.click();

        await expect(importMnemonicPhraseButton).toBeVisible();
        await importMnemonicPhraseButton.click();

        await expect(page.getByText("Enter your Secret Recovery Phrase")).toBeVisible();

        for (const [index, phrase] of mnemonicPhrase.entries()) {
            const phraseInput = page.locator(
                `input[name="mnemonic-${String.fromCharCode("a".charCodeAt(0) + index)}"]`,
            );
            await phraseInput.fill(phrase);
        }

        await expect(continueButton).toBeEnabled();
        await continueButton.click();

        await expect(createNewPasswordInput).toBeVisible();
        await createNewPasswordInput.fill(password);

        await expect(confirmNewPasswordInput).toBeVisible();
        await confirmNewPasswordInput.fill(password);

        await expect(confirmPasswordCheckbox).toBeVisible();
        await confirmPasswordCheckbox.click();

        await expect(continueButton).toBeEnabled();
        await continueButton.click();

        await expect(getStartedButton).toBeVisible();
        await getStartedButton.click();

        await expect(onboardingCompleteText).toBeVisible();
        await page.goto(await petraProfile.indexUrl());

        await expect(page.locator(homepageSelectors.depositButton)).toBeVisible();
        await expect(page.locator(homepageSelectors.sendButton)).toBeVisible();
    }

    await sleep(8_000);
    console.info(picocolors.greenBright("✨ MetaMask onboarding completed successfully"));
}
