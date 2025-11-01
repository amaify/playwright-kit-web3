import fs from "node:fs";
import path from "node:path";
import type { SupportedWallets } from "@/types";
import getCacheDirectory from "../get-cache-directory";

export async function getWalletExtensionPathFromCache(walletName: SupportedWallets) {
    try {
        const cachedDirectory = getCacheDirectory(walletName);
        const extensionPathText = path.resolve(cachedDirectory, "extension-path.txt");

        if (!fs.existsSync(extensionPathText)) {
            throw new Error(`❌ extension-path.txt not found. Run setup script first.`);
        }

        const rawFile = fs.readFileSync(extensionPathText, "utf-8").trim();

        if (!rawFile) {
            throw new Error(`❌ extension-path.txt is empty. Run setup script first.`);
        }

        return rawFile;
    } catch (error) {
        throw new Error(`❌ Failed to get ${walletName} extension path: ${(error as Error).message}`);
    }
}
