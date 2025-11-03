import fs from "node:fs";
import path from "node:path";
import { glob } from "glob";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { CLIOptions } from "@/types";
import getSetupFunction from "../get-setup-function";

// Mock glob
vi.mock("glob", () => ({
    glob: vi.fn(),
}));

describe("getSetupFunction", () => {
    const WALLET_SETUP_DIR = path.resolve(process.cwd(), "src/core/test/wallet-setup-test-files");

    beforeAll(() => {
        const setupFiles = ["metamask.setup.ts", "metamask-two.setup.ts", "phantom.setup.ts", "solflare.setup.ts"];

        if (!fs.existsSync(WALLET_SETUP_DIR)) {
            fs.mkdirSync(WALLET_SETUP_DIR, { recursive: true });

            setupFiles.forEach((filename) => {
                if (!fs.existsSync(path.resolve(WALLET_SETUP_DIR, filename))) {
                    fs.writeFileSync(
                        path.resolve(WALLET_SETUP_DIR, filename),
                        `
                        import defineWalletSetup from "@/core/define-wallet-setup";

                        export default defineWalletSetup(async () => {
                            console.info("Setting up ${filename}.....");
                            return void 0;
                        }, ${filename === "metamask-two.setup.ts" ? '{ profileName: "profile-two" }' : undefined});
                        `.trim(),
                    );
                }
            });
        }
    });

    // Remove the wallet setup test files after all tests
    // This is to avoid the test files being left behind and causing issues with the next test run
    afterAll(() => {
        fs.rm(WALLET_SETUP_DIR, { force: true, recursive: true }, (err) => {
            if (err) {
                console.error("Error deleting wallet setup test files: ", err);
            }
        });
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    async function handleMock(mockFilePaths: string[], selectedWallet: CLIOptions = "all", walletSetupDir?: string) {
        vi.mocked(glob).mockResolvedValue(mockFilePaths);

        const result = await getSetupFunction({
            walletSetupDir: walletSetupDir ?? WALLET_SETUP_DIR,
            selectedWallet: selectedWallet,
        });

        return result;
    }

    it("should return all setup functions when selectedWallet is 'all'", async () => {
        const mockFilePaths = [
            path.resolve(WALLET_SETUP_DIR, "metamask.setup.ts"),
            path.resolve(WALLET_SETUP_DIR, "metamask-two.setup.ts"),
            path.resolve(WALLET_SETUP_DIR, "phantom.setup.ts"),
            path.resolve(WALLET_SETUP_DIR, "solflare.setup.ts"),
        ];

        const result = await handleMock(mockFilePaths);

        expect(result).toHaveLength(4);
        expect(result[0]).toHaveProperty("walletName");
        expect(result[0]).toHaveProperty("setupFunction");
        expect(result[0]).toHaveProperty("fileList");
        expect(result[0]?.fileList).toHaveLength(4);

        // Verify all results have fileList
        result.forEach((item) => {
            expect(item).toHaveProperty("fileList");
            expect(item.fileList).toHaveLength(4);
        });
    });

    it("should filter setup functions when selectedWallet is specific", async () => {
        const mockFilePaths = [
            path.resolve(WALLET_SETUP_DIR, "metamask.setup.ts"),
            path.resolve(WALLET_SETUP_DIR, "metamask-two.setup.ts"),
            path.resolve(WALLET_SETUP_DIR, "phantom.setup.ts"),
        ];
        vi.mocked(glob).mockResolvedValue(mockFilePaths);
        const result = await handleMock(mockFilePaths, "metamask");
        expect(result).toHaveLength(2);
        result.forEach((item) => {
            expect(item).toHaveProperty("walletName", "metamask");
            expect(item).toHaveProperty("setupFunction");
            expect(item).toHaveProperty("fileList");
        });
    });

    it("should throw an error when no setup files are found", async () => {
        vi.mocked(glob).mockResolvedValue([]);

        await expect(handleMock([], "all")).rejects.toThrow(
            `No wallet setup files found at ${WALLET_SETUP_DIR} Remember that all wallet setup files must end with ".setup.{ts,js,mjs}" extension!`,
        );
    });

    it("should throw an error when filtered file list is empty", async () => {
        const walletSetupDir = "/test/wallet-setup";
        const mockFilePaths = [
            path.resolve("/test/wallet-setup/phantom.setup.ts"),
            path.resolve("/test/wallet-setup/solflare.setup.ts"),
        ];

        vi.mocked(glob).mockResolvedValue(mockFilePaths);

        await expect(handleMock(mockFilePaths, "metamask", walletSetupDir)).rejects.toThrow(
            `No wallet setup files found at ${walletSetupDir} Remember that all wallet setup files must end with ".setup.{ts,js,mjs}" extension!`,
        );
    });

    it("should handle wallet profiles correctly", async () => {
        const mockFilePaths = [path.resolve(WALLET_SETUP_DIR, "metamask-two.setup.ts")];

        vi.mocked(glob).mockResolvedValue(mockFilePaths);

        const result = await handleMock(mockFilePaths, "metamask");

        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty("walletName", "metamask");
        expect(result[0]).toHaveProperty(["walletProfile"], "profile-two");
        expect(result[0]).toHaveProperty("setupFunction");
    });

    it("should use absolute paths in glob pattern", async () => {
        const walletSetupDir = "./src/test/wallet-setup";
        const resolvedDir = path.resolve(walletSetupDir);
        const mockFilePaths = [path.resolve(resolvedDir, "metamask.setup.ts")];

        vi.mocked(glob).mockResolvedValue(mockFilePaths);

        await handleMock(mockFilePaths, "metamask", walletSetupDir);

        const globCall = vi.mocked(glob).mock.calls[0];
        if (globCall?.[0]) {
            expect(globCall[0]).toContain(path.resolve(walletSetupDir));
            expect(globCall[0]).toMatch(/\.setup\.\{ts,js,\}/);
        }
    });

    it("should sort file list alphabetically", async () => {
        const mockFilePaths = [
            path.resolve(WALLET_SETUP_DIR, "solflare.setup.ts"),
            path.resolve(WALLET_SETUP_DIR, "metamask.setup.ts"),
            path.resolve(WALLET_SETUP_DIR, "phantom.setup.ts"),
        ];

        vi.mocked(glob).mockResolvedValue(mockFilePaths);

        const result = await handleMock(mockFilePaths, "all");

        expect(vi.mocked(glob)).toHaveBeenCalled();
        // Verify the file list is sorted (glob should sort, but we verify the result)
        const sortedPaths = [...mockFilePaths].sort();
        const firstResult = result[0];
        if (firstResult) {
            // The fileList should match the sorted order
            const fileListPaths = firstResult.fileList.map((f) => f.filePath);
            expect(fileListPaths).toEqual(sortedPaths);
        }
    });

    it("should include fileList in all returned objects", async () => {
        const mockFilePaths = [
            path.resolve(WALLET_SETUP_DIR, "metamask.setup.ts"),
            path.resolve(WALLET_SETUP_DIR, "phantom.setup.ts"),
        ];

        vi.mocked(glob).mockResolvedValue(mockFilePaths);

        const result = await handleMock(mockFilePaths, "all");

        expect(result).toHaveLength(2);
        result.forEach((item) => {
            expect(item).toHaveProperty("fileList");
            expect(item.fileList).toHaveLength(2);
            expect(item.fileList).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ filePath: mockFilePaths[0] }),
                    expect.objectContaining({ filePath: mockFilePaths[1] }),
                ]),
            );
        });
    });

    it("should correctly extract wallet names from file paths", async () => {
        const mockFilePaths = [
            path.resolve(WALLET_SETUP_DIR, "metamask.setup.ts"),
            path.resolve(WALLET_SETUP_DIR, "metamask-two.setup.ts"),
            path.resolve(WALLET_SETUP_DIR, "phantom.setup.ts"),
        ];

        vi.mocked(glob).mockResolvedValue(mockFilePaths);

        const result = await handleMock(mockFilePaths, "all");

        expect(result).toHaveLength(3);
        // Verify wallet names are correctly extracted
        const walletNames = result.map((r) => r.walletName);
        expect(walletNames).toContain("metamask");
        expect(walletNames).toContain("phantom");
    });
});
