import path from "node:path";
import { fileURLToPath } from "node:url";
import type { SupportedWallets } from "@/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_CONTEXT_DIR = path.resolve(__dirname, "..", "../.wallet-context");

export default function createTempContextDirectory(testId: string, walletName: SupportedWallets) {
    return path.resolve(BASE_CONTEXT_DIR, `${walletName}-${testId}`);
}
