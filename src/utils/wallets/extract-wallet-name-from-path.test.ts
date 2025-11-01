import { describe, expect, it } from "vitest";
import extractWalletNameFromPath from "./extract-wallet-name-from-path";

describe("extractWalletNameFromPath", () => {
    it("should extract the wallet name from the file path", () => {
        const filePath = "src/core/wallet-setup-test-files/metamask.setup.ts";
        const walletName = extractWalletNameFromPath(filePath);
        expect(walletName).toBe("metamask");
    });

    it("should throw an error if the file path is invalid", () => {
        const filePath = "src/core/wallet-setup-test-files/invalid.file.ts";
        expect(() => extractWalletNameFromPath(filePath)).toThrow(
            'Invalid wallet setup filename: invalid.file.ts (expected "<name>[ -variant].setup.{ts,js,mjs}")',
        );
    });

    it("should extract the wallet name from the file path with a variant", () => {
        const filePath = "src/core/wallet-setup-test-files/metamask-two.setup.ts";
        const walletName = extractWalletNameFromPath(filePath);
        expect(walletName).toBe("metamask");
    });

    it("should extract the wallet name from the file path with a variant and a profile", () => {
        const filePath = "src/core/wallet-setup-test-files/metamask-two-profile-two.setup.ts";
        const walletName = extractWalletNameFromPath(filePath);
        expect(walletName).toBe("metamask");
    });
});
