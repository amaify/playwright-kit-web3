import type { Page } from "playwright-core";
import { addAccount } from "./actions/add-account";
import { lockWallet } from "./actions/lock";
import onboard from "./actions/onboard";
import { openSettings } from "./actions/open-settings";
import { type RenameAccount, renameAccount } from "./actions/rename-account";
import { type SwitchAccount, switchAccount } from "./actions/switch-account";
import { toggleShowTestnetNetwork } from "./actions/toggle-show-testnet-network";
import unlock from "./actions/unlock";
import type { AddAccountArgs, OnboardingArgs } from "./types";

export class Metamask {
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
        await openSettings(this.page);
        await lockWallet(this.page);
    }

    async renameAccount({ newAccountName, currentAccountName }: Omit<RenameAccount, "page">) {
        await renameAccount({ page: this.page, newAccountName, currentAccountName });
    }

    async addAccount({ privateKey, accountName }: AddAccountArgs) {
        await addAccount({ page: this.page, privateKey, accountName });
    }

    async switchAccount({ accountName }: Omit<SwitchAccount, "page">) {
        await switchAccount({ page: this.page, accountName });
    }

    async toggleShowTestnetNetwork() {
        await toggleShowTestnetNetwork({ page: this.page });
    }
}
