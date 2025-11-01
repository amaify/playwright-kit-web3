import fs from "node:fs";
import path from "node:path";
import AdmZip from "adm-zip";
import picocolors from "picocolors";
import type { CLIOptions } from "@/types";
import { SUPPORTED_WALLETS } from "./constants";
import { downloadFile } from "./download-file";
import getCacheDirectory from "./get-cache-directory";

type Args = {
    name: CLIOptions;
    downloadUrl: string;
    force: boolean;
};

export async function prepareWalletExtension({ downloadUrl, name, force }: Args) {
    const CACHE_DIR_NAME = getCacheDirectory(name);
    const supportedWallet = SUPPORTED_WALLETS[name as Exclude<CLIOptions, "all">];
    const walletName = supportedWallet.extensionName;
    const zipFilePath = path.join(CACHE_DIR_NAME, `${name}-extension.zip`);
    const outputPath = path.join(CACHE_DIR_NAME, `${name}-extension`);

    if (force && fs.existsSync(CACHE_DIR_NAME)) {
        fs.rmSync(CACHE_DIR_NAME, { recursive: true });
        console.info(picocolors.magenta(`🧹 Removed ${walletName} because of the force flag`));
    }

    // Ensure the cache directory exists
    if (!fs.existsSync(CACHE_DIR_NAME)) {
        fs.mkdir(CACHE_DIR_NAME, { recursive: true }, (error) => {
            if (error) throw Error("Failed to create cache directory");
            console.info(`✅ ${walletName} Cache directory created successfully.`);
        });
    }

    // Download wallet extension if not cached
    if (fs.existsSync(outputPath)) {
        console.info(`✅ ${walletName} Version is downloaded already.`);
    } else {
        console.info(picocolors.cyanBright(`📥 Downloading ${walletName} extension...`));
        await downloadFile({ url: downloadUrl, destination: zipFilePath });
        console.info(picocolors.green(`✅ ${name.toUpperCase()} Extension downloaded successfully.`));
    }

    // Unzip the archive if not already extracted
    if (!fs.existsSync(outputPath)) {
        console.info(`📦 Extracting extension...`);
        const zip = new AdmZip(zipFilePath);
        zip.extractAllTo(outputPath, true);
        console.info(`✅ ${walletName} Extension extracted successfully.`);
    } else {
        console.info(
            picocolors.yellow(
                `⚠️ Skipping ${walletName} cache creation: Cache already exists at ${outputPath}. Use --force to overwrite.`,
            ),
        );
    }

    // Validate the extracted extension
    const manifestPath = path.join(outputPath, "manifest.json");
    if (!fs.existsSync(manifestPath)) {
        throw new Error(`❌ (${walletName}) Invalid extension: manifest.json not found`);
    }

    return outputPath;
}
