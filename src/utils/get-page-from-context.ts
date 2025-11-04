import { type BrowserContext, expect } from "@playwright/test";
import waitForStablePage from "./wait-for-stable-page";

export default async function getPageFromContext(context: BrowserContext, path: string) {
    const promptPage = await context.newPage();

    await expect(async () => {
        await promptPage.goto(path);

        await waitForStablePage(promptPage);
    }).toPass();

    return promptPage;
}
