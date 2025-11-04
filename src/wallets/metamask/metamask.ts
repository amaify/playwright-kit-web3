import type { Page } from "playwright-core";
import { getWalletExtensionIdFromCache } from "@/utils/wallets/get-wallet-extension-id-from-cache";
import onboard from "./actions/onboard";
import type { OnboardingArgs } from "./types";

export class MetamaskProfile {
    readonly name = "metamask" as const;
    readonly onboardingPath = "/home.html#onboarding";

    async indexUrl() {
        const extensionId = await this.extensionId();
        return `chrome-extension://${extensionId}/index.html`;
    }

    async promptUrl() {
        const extensionId = await this.extensionId();
        return `chrome-extension://${extensionId}/prompt.html`;
    }

    async extensionId() {
        return await getWalletExtensionIdFromCache("metamask");
    }
}

export class Metamask {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async onboard(args: OnboardingArgs) {
        await onboard({ page: this.page, ...args });
    }
}
