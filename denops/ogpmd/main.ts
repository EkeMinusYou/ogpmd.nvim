import type { Denops } from "jsr:@denops/core@^7.0.0";
import * as helper from "jsr:@denops/std@^7.0.0/helper";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.47/deno-dom-wasm.ts";

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async fetchUrl(args: unknown): Promise<void> {
      if (typeof args !== 'string') {
        await helper.echoerr(denops, `Invalid argument type: expected string, got ${typeof args}`);
        return;
      }
      const url = args;
      if (!url || !isValidUrl(url)) {
        await helper.echoerr(denops, `Invalid URL: ${url}. Usage: Ogpmd <url>`);
        return;
      }

      try {
        await helper.echo(denops, `Fetching ${url}...`);
        const response = await fetch(url);
        if (!response.ok) {
          const errorText = await response.text();
          await helper.echoerr(denops, `Failed to fetch ${url}: ${response.status} ${response.statusText}\n${errorText}`);
          return;
        }
        const html = await response.text();

        let title = "No title found";
        try {
          const doc = new DOMParser().parseFromString(html, "text/html");
          if (doc) {
            const titleElement = doc.querySelector('title');
            if (titleElement) {
              title = titleElement.textContent?.trim() || "No title found";
            }
          }
        } catch (parseError) {
          await helper.echoerr(denops, `Error parsing HTML from ${url}: ${parseError}`);
        }

        // Insert title after the current cursor line
        if (title !== "No title found") {
          const markdownLink = `[${title.replace(/\n/g, ' ')}](${url})`; // Create markdown link, replace newlines in title
          await denops.call('append', '.', markdownLink); // Append markdown link after the current line
          await helper.echo(denops, `Inserted: ${markdownLink}`); // Notify user
        } else {
          await helper.echo(denops, "Could not find title to insert.");
        }

      } catch (error) {
        await helper.echoerr(denops, `Error fetching ${url}: ${error}`);
      }
    },
  };

  await denops.cmd(
    `command! -nargs=1 Ogpmd call denops#request('${denops.name}', 'fetchUrl', [<f-args>])`,
  );
}

// Simple URL validation function
function isValidUrl(urlString: string): boolean {
  if (!urlString) return false;
  try {
    const parsedUrl = new URL(urlString);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch (_) {
    return false;
  }
}