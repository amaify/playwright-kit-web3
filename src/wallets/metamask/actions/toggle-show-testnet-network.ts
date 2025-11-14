import { expect, type Page } from "@playwright/test";
import { homepageSelectors, settingsSelectors } from "../selectors/homepage-selectors";

export async function toggleShowTestnetNetwork({ page }: { page: Page }) {
    const settingsButton = page.getByTestId(homepageSelectors.openSettingsButton);
    await settingsButton.click();

    const networksButton = page.getByTestId(settingsSelectors.networksButton);
    await networksButton.click();

    const netowrksDialog = page.getByRole("dialog");
    await expect(netowrksDialog).toBeVisible();
    await expect(netowrksDialog).toContainText(/manage networks/i);

    await netowrksDialog.locator("div:has(> label[class='toggle-button toggle-button--off'])").scrollIntoViewIfNeeded();
    const showTestnetNetworkToggle = netowrksDialog.locator(
        "div:has(> label[class='toggle-button toggle-button--off'])",
    );
    await showTestnetNetworkToggle.locator("label[class='toggle-button toggle-button--off']").click();

    await page.getByTestId("Sepolia").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("Sepolia")).toBeVisible();

    const closeButton = netowrksDialog.getByRole("button", { name: /close/i });
    await closeButton.click();
}
