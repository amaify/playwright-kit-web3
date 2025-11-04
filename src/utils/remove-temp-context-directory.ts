import fs from "node:fs";

export async function removeTempContextDir(dir: string) {
    return fs.rmSync(dir, { recursive: true, force: true, maxRetries: 5 });
}
