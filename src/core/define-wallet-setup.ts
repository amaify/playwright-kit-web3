import type { WalletSetupFunction } from "@/types";

type WalletSetupConfig = {
    profileName?: string;
};

export default async function defineWalletSetup(fn: WalletSetupFunction, config: WalletSetupConfig = {}) {
    return { fn, config };
}
