import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { glob } from "glob";
import type { CLIOptions } from "@/utils/constants";
import extractWalletNameFromPath from "@/utils/extract-wallet-name-from-path";
import { createWalletSetupHash } from "./create-hash";

type SetupFunctionHash = {
    walletSetupDir: string;
    selectedWallet: CLIOptions;
};

const toPosix = (path: string) => path.replace(/\\/g, "/");

export const createGlobPattern = (walletSetupDir: string) => {
    const base = toPosix(path.resolve(walletSetupDir));
    return `${base}/**/*.setup.{ts,js,}`;
};

export async function getSetupFunctionHash({ walletSetupDir, selectedWallet }: SetupFunctionHash) {
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

    const _fileList = filteredFileList.map((filePath) => ({
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
            const sourceCode = fs.readFileSync(filePath, "utf8");
            const hash = createWalletSetupHash(sourceCode);
            const importUrl = new URL(pathToFileURL(filePath)).href;
            const setupFunction = (await import(importUrl)) as () => Promise<void>;

            return { hash, walletName, setupFunction };
        }),
    );

    return setupFunctionHashes;
}
