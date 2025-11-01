import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import type * as streamWeb from "node:stream/web";
import cliProgress from "cli-progress";
import colors from "picocolors";
import picocolors from "picocolors";

const TIMEOUT = 120_000;

type DownloadFileArgs = {
    url: string;
    destination: string;
};

export async function downloadFile({ url, destination }: DownloadFileArgs) {
    const controller = new AbortController();
    const requestTimeout = setTimeout(() => controller.abort(), TIMEOUT);
    const response = await fetch(url, { redirect: "follow", signal: controller.signal });

    if (!response.ok) {
        console.error(picocolors.redBright(`❌ Download failed: HTTP ${response.status}`));
        controller.abort();
        process.exit(1);
    }

    const totalBytes = parseInt(response.headers.get("content-length") || "0", 10);
    let downloaded = 0;

    const nodeStream = Readable.fromWeb(response.body as streamWeb.ReadableStream);

    try {
        const progressBar = new cliProgress.SingleBar({
            format: `Downloading ${colors.cyan("{bar}")} {percentage}%`,
            clearOnComplete: true,
            barCompleteChar: "\u2588",
            barIncompleteChar: "\u2591",
            hideCursor: true,
        });

        progressBar.start(totalBytes, 0, { speed: "N/A" });

        await new Promise((resolve, reject) => {
            const stream = createWriteStream(destination);
            nodeStream.pipe(stream);
            nodeStream.on("data", (chunk) => {
                downloaded += chunk.length;
                progressBar.update(downloaded);
            });
            stream.on("error", reject);
            stream.on("finish", () => {
                progressBar.stop();
                resolve(void 0);
            });
        });
    } catch (error) {
        console.error(picocolors.redBright(`❌ Download failed: ${error}`));
        process.exit(1);
    } finally {
        clearTimeout(requestTimeout);
    }
}
