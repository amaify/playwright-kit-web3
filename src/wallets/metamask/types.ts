export type OnboardingArgs =
    | {
          mode: "create";
          password: string;
      }
    | {
          mode: "import";
          password: string;
          secretRecoveryPhrase: string;
      };

export type AddAccountArgs = {
    privateKey: string;
    accountName: string;
};
