import picocolors from "picocolors";
import type { BrowserContext, Page } from "playwright-core";
import { sleep } from "./sleep";

// Increase max retries for CI environments
const MAX_RETRIES = 20;
// Add delay between retries
const RETRY_DELAY_BASE = 6000;
// Initial delay to ensure browser is fully initialized
const INITIAL_BROWSER_DELAY = 4000;
// Polling interval for finding extension page

/**
 * Finds an extension page in the current browser context
 */
async function findExtensionPage(context: BrowserContext) {
    const pages = context.pages();
    const extensionPage = pages.find((page) => {
        try {
            return page.url().startsWith("chrome-extension://");
        } catch (error) {
            console.error("[WaitForExtensionOnLoadPage] Error checking page URL:", error);
            return false;
        }
    });

    return extensionPage;
}

/**
 * Waits for the extension page to load and ensures it's not blank or has errors
 */
export async function waitForExtensionOnLoadPage(context: BrowserContext, walletName?: string): Promise<Page> {
    let retries = 0;
    let _extensionPage: Page | null = null;

    if (walletName === "meteor") {
        return await context.newPage();
    }

    // Initial delay to ensure browser is fully initialized
    console.info(` Waiting ${INITIAL_BROWSER_DELAY}ms for browser to initialize...`);
    await sleep(INITIAL_BROWSER_DELAY);

    while (retries <= MAX_RETRIES) {
        try {
            console.info(`Looking for extension page (attempt ${retries + 1}/${MAX_RETRIES})...`);

            if (retries === MAX_RETRIES) {
                throw new Error("Extension page not found after maximum retries");
            }

            // Poll for extension page until timeout
            const extensionPage = await findExtensionPage(context);

            if (extensionPage) {
                console.info(`Found extension page after ${retries + 1} polling attempts`);
                _extensionPage = extensionPage;
                break;
            }

            if (!extensionPage) {
                retries++;
                console.info(`Extension page not found, retrying (${retries}/${MAX_RETRIES})...`);
                await sleep(RETRY_DELAY_BASE);
            }
        } catch (e) {
            console.error("Error waiting for extension page:", e instanceof Error ? e.message : "Unknown error");
            throw new Error(`Extension failed to load properly after ${retries} attempts!`);
        }
    }

    console.info(picocolors.greenBright("✅ Extension page is properly loaded and ready"));
    // biome-ignore lint/style/noNonNullAssertion: this is intentional
    return _extensionPage!;
}
