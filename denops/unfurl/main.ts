import { type Denops } from "./deps.ts";
import { format } from "./format.ts";
import { write } from "./buffer.ts";
import { fetchMetadata } from "./metadata.ts";
import { writeImage } from "./image.ts";
import { getOpt, Opt } from "./config.ts";

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async main(...args: unknown[]): Promise<void> {
      if (typeof args[0] !== "string") {
        denops.cmd("echoerr 'Invalid argument type: expected string'");
        return;
      }
      const url = args[0];
      if (!isValidUrl(url)) {
        denops.cmd("echoerr 'Invalid URL format. Usage: unfurl <url>'");
        return;
      }

      denops.cmd("echo 'Fetching metadata...'");
      const opt = await getOpt(denops);

      unfurl(denops, url, opt).then(() => {
        denops.cmd("echo 'Metadata fetched successfully'");
      }).catch((e) => {
        const errorMessage = e instanceof Error ? e.message : String(e);
        denops.cmd(`echoerr 'Error processing ${url}: ${errorMessage}'`);
      });
    },

    async maind(...args: unknown[]): Promise<void> {
      if (typeof args[0] !== "string") {
        denops.cmd("echoerr 'Invalid argument type: expected string'");
        return;
      }
      const url = args[0];
      if (!isValidUrl(url)) {
        denops.cmd("echoerr 'Invalid URL format. Usage: unfurl <url>'");
        return;
      }

      denops.cmd("echo 'Fetching metadata...'");
      const opt = await getOpt(denops).then((opt) => {
        return {
          ...opt,
          "img-clip": {
            ...opt["img-clip"],
            download_images: true,
          },
        };
      });

      unfurl(denops, url, opt).then(() => {
        denops.cmd("echo 'Metadata fetched successfully'");
      }).catch((e) => {
        const errorMessage = e instanceof Error ? e.message : String(e);
        denops.cmd(`echoerr 'Error processing ${url}: ${errorMessage}'`);
      });
    },
  };

  await denops.cmd(
    `command! -nargs=* Unfurl call denops#request('${denops.name}', 'main', [<f-args>])`,
  );
  await denops.cmd(
    `command! -nargs=* Unfurld call denops#request('${denops.name}', 'maind', [<f-args>])`,
  );
}

async function unfurl(denops: Denops, url: string, opt: Opt): Promise<void> {
  const metadata = await fetchMetadata(url);
  const unfolded = format(metadata);
  await write(denops, unfolded);
  await writeImage(denops, metadata, opt["img-clip"]);
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
