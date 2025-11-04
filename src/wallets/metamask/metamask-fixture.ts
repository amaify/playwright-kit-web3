import fs from "node:fs";
import path from "node:path";
import { type BrowserContext, test as base, chromium, type Page } from "@playwright/test";
import createTempContextDirectory from "@/utils/create-temp-context-directory";
import getCacheDirectory from "@/utils/get-cache-directory";
import getPageFromContext from "@/utils/get-page-from-context";
import persistLocalStorage from "@/utils/persist-local-storage";
import { removeTempContextDir } from "@/utils/remove-temp-context-directory";
import { getWalletExtensionPathFromCache } from "@/utils/wallets/get-wallet-extension-path-from-cache";
import { MetamaskProfile } from "./metamask";

export type MetamaskFixture = {
    context: BrowserContext;
};

let _metamaskPage: Page;

export const metamaskFixture = (slowMo: number = 0, profileName?: string) =>
    base.extend<MetamaskFixture>({
        context: async ({ context: currentContext }, use, testInfo) => {
            const wallet = new MetamaskProfile();

            const CACHE_DIR = getCacheDirectory(wallet.name);
            const extensionPath = await getWalletExtensionPathFromCache(wallet.name);
            const walletDataDir = path.resolve(CACHE_DIR, profileName ?? "wallet-data");
            const contextPath = createTempContextDirectory(testInfo.testId, wallet.name);

            if (!fs.existsSync(walletDataDir)) {
                throw new Error(`❌ Cache for MetaMask wallet data not found. Create it first`);
            }

            fs.copyFileSync(walletDataDir, contextPath);

            const browserArgs = [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`];

            if (process.env.HEADLESS) {
                browserArgs.push("--headless=new");

                if (slowMo > 0) {
                    console.warn("⚠️ Slow motion makes no sense in headless mode. It will be ignored!");
                }
            }

            const context = await chromium.launchPersistentContext(contextPath, {
                headless: false,
                args: browserArgs,
                slowMo: process.env.HEADLESS ? 0 : slowMo,
            });

            const { cookies, origins } = await currentContext.storageState();

            if (cookies) await context.addCookies(cookies);

            if (origins && origins.length > 0) persistLocalStorage(origins, context);

            _metamaskPage = await getPageFromContext(context, await wallet.indexUrl());

            for (const page of context.pages()) {
                const url = page.url();
                if (url.includes(wallet.onboardingPath) || url.includes("about:blank")) {
                    await page.close();
                }
            }

            await use(context);

            await removeTempContextDir(contextPath);

            await context.close();
        },
    });
