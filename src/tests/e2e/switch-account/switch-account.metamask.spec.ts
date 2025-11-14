import { expect } from "@playwright/test";
import { testWithMetamaskFixture } from "@/tests/fixture/test-with-metamask-fixture";
import { homepageSelectors } from "@/wallets/metamask/selectors/homepage-selectors";

const test = testWithMetamaskFixture;

test.describe("Switch account E2E tests", () => {
    test("Should switch account successfully", async ({ metamask, metamaskPage }) => {
        const ACCOUNT_NAME = "Account 2";

        await metamask.switchAccount({ accountName: ACCOUNT_NAME });

        const accountMenuButton = metamaskPage.getByTestId(homepageSelectors.accountMenuButton);

        await expect(metamaskPage.getByTestId("app-header-logo").first()).toBeVisible();
        await expect(accountMenuButton).toBeVisible();
        await expect(accountMenuButton).toContainText(ACCOUNT_NAME);
    });
});
