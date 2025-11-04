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
