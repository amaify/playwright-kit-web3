import { describe, expect, it } from "vitest";
import defineWalletSetup from "../define-wallet-setup";

describe("defineWalletSetup", () => {
    it("should define a wallet setup function with a profile name", async () => {
        const setup = await defineWalletSetup(async () => void 0, { profileName: "test-profile" });

        expect(setup).toHaveProperty("fn");
        expect(setup.config.profileName).toBe("test-profile");
    });

    it("should define a wallet setup function without a profile name", async () => {
        const setup = await defineWalletSetup(async () => void 0);

        expect(setup).toHaveProperty("fn");
        expect(setup.config.profileName).toBeUndefined();
    });
});
