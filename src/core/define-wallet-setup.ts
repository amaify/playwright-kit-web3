import type { WalletSetupConfig, WalletSetupFunction } from "@/types";

export default async function defineWalletSetup(
    password: string,
    fn: WalletSetupFunction,
    config: WalletSetupConfig = {},
) {
    return { fn, password, config };
}
