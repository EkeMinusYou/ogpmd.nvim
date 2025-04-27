import type { Denops } from "./deps.ts";
import { format } from "./format.ts";
import { write } from "./buffer.ts";
import { fetchMetadata } from "./metadata.ts";

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async main(args: unknown): Promise<void> {
      if (typeof args !== "string") {
        console.error(`Invalid argument type: expected string, got ${typeof args}`);
        return;
      }
      const url = args;
      if (!isValidUrl(url)) {
        console.error(`Invalid URL: ${url}. Usage: unfurl <url>`);
        return;
      }

      console.log(`Fetching metadata for ${url}...`);
      await unfurl(denops, url).then(() => {
        console.log(`Successfully processed ${url}`);
      }).catch((e) => {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error(`Error processing ${url}: ${errorMessage}`);
      });
    },
  };

  await denops.cmd(
    `command! -nargs=1 Unfurl call denops#request('${denops.name}', 'main', [<f-args>])`,
  );
}

async function unfurl(denops: Denops, url: string): Promise<void> {
  const metadata = await fetchMetadata(url);
  const unfolded = format(metadata);
  await write(denops, unfolded);
}

function isValidUrl(urlString: string): boolean {
  if (!urlString) return false;
  try {
    const parsedUrl = new URL(urlString);
    return ["http:", "https:", "file:"].includes(parsedUrl.protocol);
  } catch (_) {
    return false;
  }
}
