import fs from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { CLIOptions } from "@/types";
import { getWalletExtensionIdFromCache } from "./get-wallet-extension-id-from-cache";

vi.mock("@/utils/get-cache-directory", () => ({
    default: (walletName: CLIOptions) =>
        path.resolve(process.cwd(), `src/utils/wallets/.test-wallet-cache/${walletName}`),
}));

describe("Get wallet extension ID from cache", () => {
    const CACHE_ROOT = path.resolve(process.cwd(), "src/utils/wallets/.test-wallet-cache");
    const CACHE_DIR = path.resolve(CACHE_ROOT, "petra");

    beforeAll(() => {
        if (!fs.existsSync(CACHE_DIR)) {
            fs.mkdirSync(CACHE_DIR, { recursive: true });
            fs.writeFileSync(path.resolve(CACHE_DIR, "extension-id.txt"), "nacmplfodgmlifcimbokhbinifgmgceh");
        }
    });

    afterAll(() => {
        fs.rm(CACHE_ROOT, { force: true, recursive: true }, (error) => {
            if (error) {
                console.error("Error deleting wallet cache directory: ", error);
            }
        });
    });

    it("should return the extension ID from the cache", async () => {
        const extensionId = await getWalletExtensionIdFromCache("petra");
        expect(extensionId).toBe("nacmplfodgmlifcimbokhbinifgmgceh");
    });

    it("should throw an error if the extension ID is not found", async () => {
        await expect(getWalletExtensionIdFromCache("phantom")).rejects.toThrow(
            "❌ extension-id.txt not found. Run setup script first.",
        );
    });
});
