import defineWalletSetup from "@/core/define-wallet-setup";
import { Metamask } from "@/wallets/metamask/metamask";

export default defineWalletSetup(
    async ({ walletPage }) => {
        const metamask = new Metamask(walletPage);

        const seedPhrase = "slam razor near morning edge across provide sting section bind soup differ";

        await metamask.onboard({ mode: "import", password: "test1234", secretRecoveryPhrase: seedPhrase });

        return void 0;
    },
    { slowMo: 1_500 },
);
