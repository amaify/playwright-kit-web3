import defineWalletSetup from "@/core/define-wallet-setup";

export default defineWalletSetup(
    async () => {
        console.info("Setting up MetaMask Profile Two.....");
        return void 0;
    },
    { profileName: "profile-two" },
);
