import type { Page } from "playwright-core";
import { lockWallet } from "./actions/lock";
import onboard from "./actions/onboard";
import { type RenameAccount, renameAccount } from "./actions/rename-account";
import unlock from "./actions/unlock";
import type { OnboardingArgs } from "./types";

export class Petra {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async onboard(args: OnboardingArgs) {
        await onboard({ page: this.page, ...args });
    }

    async unlock() {
        await unlock(this.page);
    }

    async lock() {
        await lockWallet(this.page);
    }

    async renameAccount({ newAccountName }: Omit<RenameAccount, "page">) {
        await renameAccount({ page: this.page, newAccountName });
    }
}
