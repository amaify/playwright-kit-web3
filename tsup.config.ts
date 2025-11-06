import { defineConfig } from "tsup";

export default defineConfig({
    name: "playwright-kit-web3",
    entry: ["src/cli/index.ts", "src/wallets/index.ts"],
    external: ["playwright-core", "@playwright/test", "commander", "zod"],
    outDir: "dist",
    format: "esm",
    target: "es2024",
    sourcemap: true,
    clean: true,
    dts: true,
    splitting: false,
    bundle: true,
    minify: true,
});
