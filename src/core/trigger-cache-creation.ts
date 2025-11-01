import fs from "node:fs";
import path from "node:path";
import picocolors from "picocolors";
import { chromium } from "playwright-core";
import type { GetSetupFunctionFileList, SupportedWallets, WalletSetupFunction } from "@/types";
import getCacheDirectory from "@/utils/get-cache-directory";
import { getWalletExtensionIdFromBrowser } from "@/utils/wallets/get-wallet-extension-id-from-browser";
import { SUPPORTED_WALLETS } from "../utils/constants";
import { prepareWalletExtension } from "../utils/prepare-wallet-extension";
import { waitForExtensionOnLoadPage } from "../utils/wait-for-extension-on-load-page";

type Args = {
    walletName: SupportedWallets;
    force: boolean;
    setupFunction: WalletSetupFunction;
    fileList: GetSetupFunctionFileList[];
    walletProfile?: string;
};

export async function triggerCacheCreation({ walletName, force, walletProfile, fileList, setupFunction }: Args) {
    const { downloadUrl, extensionName } = SUPPORTED_WALLETS[walletName];
    const CACHE_DIR_NAME = getCacheDirectory(walletName);

    const walletProfileDir = walletProfile ? `${walletProfile}` : `wallet-data`;
    const extensionIdPathTxt = path.resolve(CACHE_DIR_NAME, "extension-id.txt");
    const extensionPathTxt = path.resolve(CACHE_DIR_NAME, "extension-path.txt");
    const userDataDir = path.join(CACHE_DIR_NAME, walletProfileDir);

    const extensionPath = await prepareWalletExtension({
        downloadUrl,
        name: walletName,
        force,
    });

    const browserArgs = [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`];

    if (fs.existsSync(userDataDir) && fileList.length > 1) {
        console.error(
            [
                `❌ ${walletProfileDir} directory already exists for ${extensionName}.`,
                `To setup another profile, please add the profile name to the wallet setup function.`,
                picocolors.yellowBright(
                    `Example: defineWalletSetup(async ({ context, walletPage }) => { ... }, "profile-name");`,
                ),
            ].join("\n"),
        );
        process.exit(0);
    }

    if (fs.existsSync(userDataDir)) {
        process.exit(0);
    }

    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        args: browserArgs,
    });

    console.info(picocolors.magentaBright(`🧩🚀 Starting Chrome extension for ${walletName.toUpperCase()}`));
    const walletPage = await waitForExtensionOnLoadPage(context, walletName);

    if (!fs.existsSync(extensionIdPathTxt) && !fs.existsSync(extensionPathTxt)) {
        const extensionId = await getWalletExtensionIdFromBrowser(context, extensionName);
        console.info(picocolors.magentaBright(`🆔 ${extensionName} extension ID: ${extensionId}`));

        fs.writeFileSync(extensionIdPathTxt, extensionId, "utf-8");
        console.info(picocolors.cyanBright(`💾 Saved extension ID to: ${extensionIdPathTxt}`));

        // // Save extension path to disk
        fs.writeFileSync(extensionPathTxt, extensionPath, "utf-8");
        console.info(picocolors.blueBright(`📁 Saved extension Path to: ${extensionPathTxt}`));
    }

    await setupFunction({ context, walletPage });

    await context.close();
}
