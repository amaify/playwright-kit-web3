import path from "node:path";
import { pathToFileURL } from "node:url";
import { glob } from "glob";
import type { CLIOptions, GetSetupFunctionFileList } from "@/types";
import extractWalletNameFromPath from "@/utils/wallets/extract-wallet-name-from-path";
import type defineWalletSetup from "./define-wallet-setup";

type SetupFunctionHash = {
    walletSetupDir: string;
    selectedWallet: CLIOptions;
};

type SetupFunction = Awaited<ReturnType<typeof defineWalletSetup>>;

const toPosix = (path: string) => path.replace(/\\/g, "/");

const createGlobPattern = (walletSetupDir: string) => {
    const base = toPosix(path.resolve(walletSetupDir));
    return `${base}/**/*.setup.{ts,js,}`;
};

export default async function getSetupFunction({ walletSetupDir, selectedWallet }: SetupFunctionHash) {
    const globPattern = createGlobPattern(walletSetupDir);
    const fileList = (
        await glob(globPattern, {
            dot: true,
            absolute: true,
            nodir: true,
            windowsPathsNoEscape: true,
        })
    ).sort();

    const filteredFileList =
        selectedWallet === "all" ? fileList : fileList.filter((filePath) => filePath.includes(selectedWallet));

    const _fileList: GetSetupFunctionFileList[] = filteredFileList.map((filePath) => ({
        filePath,
        walletName: extractWalletNameFromPath(filePath),
    }));

    if (!_fileList.length || _fileList.length === 0) {
        throw new Error(
            `No wallet setup files found at ${walletSetupDir} Remember that all wallet setup files must end with ".setup.{ts,js,mjs}" extension!`,
        );
    }

    const setupFunctionHashes = await Promise.all(
        _fileList.map(async ({ filePath, walletName }) => {
            const importUrl = new URL(pathToFileURL(filePath)).href;
            const setupFunction = (await import(importUrl).then((module) => module.default)) as SetupFunction;
            const { fn, config, password } = setupFunction;

            return {
                walletName,
                fileList: _fileList,
                config,
                walletPassword: password,
                setupFunction: fn,
            };
        }),
    );

    return setupFunctionHashes;
}
