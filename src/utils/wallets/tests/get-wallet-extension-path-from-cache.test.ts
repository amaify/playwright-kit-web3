import fs from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { CLIOptions } from "@/types";
import { getWalletExtensionPathFromCache } from "../get-wallet-extension-path-from-cache";

vi.mock("@/utils/get-cache-directory", () => ({
    default: (walletName: CLIOptions) =>
        path.resolve(process.cwd(), `src/utils/wallets/.test-wallet-cache/${walletName}`),
}));

describe("Get wallet extension path from cache", () => {
    const CACHE_ROOT = path.resolve(process.cwd(), "src/utils/wallets/.test-wallet-cache");
    const CACHE_DIR = path.resolve(CACHE_ROOT, "petra");
    const EXTENSION_PATH = "/Users/tobeugwuanyi/Desktop/playwright-kit-web3/.wallet-cache/petra/petra-extension";

    beforeAll(() => {
        if (!fs.existsSync(CACHE_DIR)) {
            fs.mkdirSync(CACHE_DIR, { recursive: true });
            fs.writeFileSync(path.resolve(CACHE_DIR, "extension-path.txt"), EXTENSION_PATH);
        }
    });

    afterAll(() => {
        fs.rmSync(CACHE_ROOT, { force: true, recursive: true });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("should return the extension path from the cache", async () => {
        const extensionPath = await getWalletExtensionPathFromCache("petra");
        expect(extensionPath).toBe(EXTENSION_PATH);
    });

    it("should throw an error if the extension path is not found", async () => {
        await expect(getWalletExtensionPathFromCache("phantom")).rejects.toThrow(
            "❌ extension-path.txt not found. Run setup script first.",
        );
    });
});
