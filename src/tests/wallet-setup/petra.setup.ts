import defineWalletSetup from "@/core/define-wallet-setup";
import { Petra } from "@/wallets/petra/petra";

const PASSWORD = "PlayerPetra12@!";
// const PRIVATE_KEY = "ed25519-priv-0xd273e27a5f7ede39b8c2f4bde793fb949ecf5019007b5959b7683d5d53a1240f";
const SECRET_PHRASE = "knife income industry useless speak inside scheme illegal stem route lab galaxy";

export default defineWalletSetup(PASSWORD, async ({ walletPage }) => {
    const petra = new Petra(walletPage);

    try {
        await petra.onboard({ mode: "importMnemonic", password: PASSWORD, secretRecoveryPhrase: SECRET_PHRASE });
    } catch (error) {
        console.error("Error setting up Petra: ", (error as Error).message);
    }
});
