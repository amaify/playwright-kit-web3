import { test } from "@playwright/test";

export function skip(condition: boolean, message: string) {
    if (condition) {
        console.warn(`\n ⚠️ Skipping test: ${message}`);
        test.skip();
    }
}
