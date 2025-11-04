#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { select } from "@inquirer/prompts";
import { Command } from "commander";
import pc from "picocolors";
import getSetupFunction from "@/core/get-setup-function";
import { triggerCacheCreation } from "@/core/trigger-cache-creation";
import type { CLIOptions, SupportedWallets } from "@/types";
import { WALLET_SETUP_DIR_NAME } from "../utils/constants";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_DIR = path.join(__dirname, "..", "test", WALLET_SETUP_DIR_NAME);

type ActionOptions = {
    headless: boolean;
    force: boolean;
    all: "all" | boolean;
    metamask: "metamask" | boolean;
    solflare: "solflare" | boolean;
};

export async function clientEntry() {
    const program = new Command();

    program
        .name(pc.yellow("Playwright Kit Web3"))
        .description(pc.green("A CLI tool for setting up wallet cache for E2E testing of web3 applications"))
        .version(pc.blue("0.1.0"));

    program
        .command("setup-wallet")
        .argument("[dir]", "Directory containing the wallet setup functions", path.resolve(BASE_DIR))
        .option(
            "--headless",
            "Build cache in the headless browser mode. Alternatively, set the `HEADLESS` env variable to `true`",
            false,
        )
        .option("-f, --force", "Force the creation of cache even if it already exists", false)
        .option("-a, --all", "Setup all wallets", "all")
        .option("-m, --metamask", "Setup MetaMask", "metamask")
        .option("-s, --solflare", "Setup Solflare", "solflare")
        .option("--pt, --petra", "Setup Petra", "petra")
        .option("--ph, --phantom", "Setup Phantom", "phantom")
        .action(async (setupDir: string, flags: ActionOptions) => {
            // Use this to filter out "headless" and "force"
            const commandOptions = ["all", "metamask", "solflare", "petra", "phantom"] as const;

            const flagValue = Object.keys(flags).filter((_key) => {
                return commandOptions.includes(_key as CLIOptions)
                    ? flags[_key as keyof ActionOptions] === true
                    : false;
            });

            const isWalletSelected = flagValue.length > 0;
            const response: CLIOptions = !isWalletSelected
                ? await select({
                      message: "Select the wallet you want to setup",
                      choices: [
                          { name: "All", value: "all" },
                          { name: "MetaMask", value: "metamask" },
                          { name: "Petra", value: "petra" },
                          { name: "Phantom", value: "phantom" },
                          { name: "Solflare", value: "solflare" },
                      ],
                      loop: false,
                      pageSize: 10,
                      default: "all",
                  })
                : (flagValue[0] as CLIOptions);

            let walletSetupDir = setupDir;
            const customDirectory = program.commands[0]?.args ?? [];

            if (customDirectory[0]) walletSetupDir = path.resolve(process.cwd(), customDirectory[0]);

            if (flags.headless) process.env.HEADLESS = true;

            const _setupFunction = await getSetupFunction({
                walletSetupDir,
                selectedWallet: response,
            });

            for (const { walletName, config, walletPassword, setupFunction, fileList } of _setupFunction) {
                try {
                    console.info(pc.cyanBright(`\nSetting up cache for ${walletName}...`));
                    await triggerCacheCreation({
                        walletName: walletName as SupportedWallets,
                        config,
                        setupFunction,
                        fileList,
                        force: flags.force,
                        walletPassword: walletPassword,
                    });
                } catch (error) {
                    if ((error as Error).message.includes("directory already exists")) {
                        console.warn((error as Error).message);
                    }

                    if (!(error as Error).message.includes("directory already exists")) {
                        console.error(
                            pc.redBright(`❌  Failed to setup cache for ${walletName}: ${(error as Error).message}`),
                        );
                    }
                }
            }
        });

    await program.parseAsync(process.argv);
}

clientEntry().catch((error) => console.error("Failed to run the CLI: ", (error as Error).message));
