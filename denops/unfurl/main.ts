import type { Denops } from "./deps.ts";
import { helper } from "./deps.ts";
import { fetchAndParseHtml, extractOgpData } from "./html.ts";
import { processOgpData, insertDataIntoBuffer } from "./format.ts";

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async unfurl(args: unknown): Promise<void> {
      if (typeof args !== "string") {
        await helper.echoerr(denops, `Invalid argument type: expected string, got ${typeof args}`);
        return;
      }
      const url = args;
      if (!isValidUrl(url)) {
        await helper.echoerr(denops, `Invalid URL: ${url}. Usage: unfurl <url>`);
        return;
      }

      await helper.echo(denops, `Fetching OGP data for ${url}...`);
      handleUnfurlRequest(denops, url)
        .then(() => {
          helper.echo(denops, `Successfully processed ${url}`);
        })
        .catch((error) => {
          const errorMessage = error instanceof Error ? error.message : String(error);
          helper.echoerr(denops, `Error processing ${url}: ${errorMessage}`);
        });
    },
  };

  await denops.cmd(
    `command! -nargs=1 Unfurl call denops#request('${denops.name}', 'unfurl', [<f-args>])`,
  );
}

/**
 * Handles the core logic for fetching, processing, and inserting OGP data.
 * Delegates tasks to imported functions from html.ts and format.ts.
 * @param denops The Denops instance.
 * @param url The URL to unfurl.
 */
async function handleUnfurlRequest(denops: Denops, url: string): Promise<void> {
  const doc = await fetchAndParseHtml(url);
  const ogpData = extractOgpData(doc, url);
  const processedData = await processOgpData(denops, ogpData, url);
  await insertDataIntoBuffer(denops, processedData, url);
}

/**
 * Validates if the given string is a valid URL with http, https, or file protocol.
 * @param urlString The string to validate.
 * @returns True if the string is a valid URL, false otherwise.
 */
function isValidUrl(urlString: string): boolean {
  if (!urlString) return false;
  try {
    const parsedUrl = new URL(urlString);
    return ["http:", "https:", "file:"].includes(parsedUrl.protocol);
  } catch (_) {
    return false;
  }
}
