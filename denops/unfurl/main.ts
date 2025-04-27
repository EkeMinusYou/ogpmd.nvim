import type { Denops } from "./deps.ts";
import { format } from "./format.ts";
import { write } from "./buffer.ts";
import { fetchMetadata } from "./metadata.ts";

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    main(args: unknown): void {
      if (typeof args !== "string") {
        denops.cmd("echoerr 'Invalid argument type: expected string'");
        return;
      }
      const url = args;
      if (!isValidUrl(url)) {
        denops.cmd("echoerr 'Invalid URL format. Usage: unfurl <url>'");
        return;
      }

      denops.cmd("echo 'Fetching metadata...'");
      unfurl(denops, url).then(() => {
        denops.cmd("echo 'Metadata fetched successfully'");
      }).catch((e) => {
        const errorMessage = e instanceof Error ? e.message : String(e);
        denops.cmd(`echoerr 'Error processing ${url}: ${errorMessage}'`);
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
