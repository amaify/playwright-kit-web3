import { expect } from "@playwright/test";
import { testWithMetamaskFixture } from "@/tests/fixture/test-with-metamask-fixture";

const test = testWithMetamaskFixture;

test.describe("Toggle show testnet networks E2E tests", () => {
    test("Should toggle show testnet networks successfully", async ({ metamask, metamaskPage }) => {
        await metamask.toggleShowTestnetNetwork();

        const netowrksDialog = metamaskPage.getByRole("dialog");
        await expect(netowrksDialog).not.toBeVisible();

        await expect(metamaskPage.getByTestId("app-header-logo").first()).toBeVisible();
    });
});
