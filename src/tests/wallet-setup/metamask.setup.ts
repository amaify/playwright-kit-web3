import defineWalletSetup from "@/core/define-wallet-setup";
import { Metamask } from "@/wallets/metamask/metamask";

const PASSWORD = "test1234";

export default defineWalletSetup(PASSWORD, async ({ walletPage }) => {
    const metamask = new Metamask(walletPage);

    const seedPhrase = "slam razor near morning edge across provide sting section bind soup differ";

    try {
        await metamask.onboard({ mode: "import", password: PASSWORD, secretRecoveryPhrase: seedPhrase });
    } catch (error) {
        console.error("Error setting up Metamask: ", (error as Error).message);
    }
});
