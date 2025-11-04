import fs from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { CLIOptions } from "@/types";
import { getWalletPasswordFromCache } from "../get-wallet-password-from-cache";

vi.mock("@/utils/get-cache-directory", () => ({
    default: (walletName: CLIOptions) =>
        path.resolve(process.cwd(), `src/utils/wallets/tests/.test-wallet-cache/${walletName}`),
}));

describe("Get wallet password from cache", () => {
    const CACHE_ROOT = path.resolve(process.cwd(), "src/utils/wallets/tests/.test-wallet-cache");
    const CACHE_DIR = path.resolve(CACHE_ROOT, "petra");

    beforeAll(() => {
        if (!fs.existsSync(CACHE_DIR)) {
            fs.mkdirSync(CACHE_DIR, { recursive: true });
            fs.writeFileSync(path.resolve(CACHE_DIR, "password.txt"), "test1234");
        }
    });

    afterAll(() => {
        fs.rmSync(CACHE_ROOT, { force: true, recursive: true });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("should return the password from the cache", async () => {
        const password = await getWalletPasswordFromCache("petra");
        expect(password).toBe("test1234");
    });

    it("should throw an error if the password is not found", async () => {
        await expect(getWalletPasswordFromCache("phantom")).rejects.toThrow(
            "❌ password.txt not found. Run setup script first.",
        );
    });
});
