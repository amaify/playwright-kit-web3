import fs from "node:fs";
import path from "node:path";
import type { SupportedWallets } from "@/types";
import getCacheDirectory from "../get-cache-directory";

export async function getWalletPasswordFromCache(walletName: SupportedWallets) {
    const cachedDirectory = getCacheDirectory(walletName);
    const passwordText = path.resolve(cachedDirectory, "password.txt");

    try {
        if (!fs.existsSync(passwordText)) {
            throw new Error(`❌ password.txt not found. Run setup script first.`);
        }

        return fs.readFileSync(passwordText, "utf-8");
    } catch (error) {
        throw new Error(`❌ Failed to get ${walletName} password from cache: ${(error as Error).message}`);
    }
}
