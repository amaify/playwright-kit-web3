import { expect } from "@playwright/test";
import { testWithMetamaskFixture } from "@/tests/fixture/test-with-metamask-fixture";

const test = testWithMetamaskFixture;

test.describe("Add account E2E tests", () => {
    test("Should add account successfully via import wallet", async ({ metamask, metamaskPage }) => {
        await metamask.addAccount({
            privateKey: "df47c5bf98f2b01720914cde200ad63eb32663c10348b44c403305ac35f2dcf0",
            accountName: "Gamify",
        });

        await expect(metamaskPage.getByTestId("app-header-logo").first()).toBeVisible();
    });
});
