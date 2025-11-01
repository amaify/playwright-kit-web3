import fs from "node:fs";
import path from "node:path";
import type { SupportedWallets } from "@/types";
import getCacheDirectory from "../get-cache-directory";

export async function getWalletExtensionIdFromCache(walletName: SupportedWallets) {
    const cachedDirectory = getCacheDirectory(walletName);
    const extensionIdText = path.resolve(cachedDirectory, "extension-id.txt");

    try {
        if (!fs.existsSync(extensionIdText)) {
            throw new Error(`❌ extension-id.txt not found. Run setup script first.`);
        }

        return fs.readFileSync(extensionIdText, "utf-8");
    } catch (error) {
        throw new Error(`❌ Failed to get ${walletName} extension ID from cache: ${(error as Error).message}`);
    }
}
