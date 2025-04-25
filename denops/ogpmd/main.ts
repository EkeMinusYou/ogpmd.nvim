import type { Denops } from "jsr:@denops/core@^7.0.0";
import * as batch from "jsr:@denops/std@^7.0.0/batch";
import * as helper from "jsr:@denops/std@^7.0.0/helper";
// HTML Parser
import { DOMParser, Element } from "https://deno.land/x/deno_dom@v0.1.47/deno-dom-wasm.ts";

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async hello(): Promise<void> {
      await helper.echo(denops, "Hello World from ogpmd (denops)!");
    },
    async fetchUrl(args: unknown): Promise<void> {
      const url = args as string;
      if (!url || !isValidUrl(url)) {
        await helper.echo(denops, `Invalid URL: ${url}. Usage: Ogpmd <url>`);
        console.error(`Invalid URL received: ${url}`);
        return;
      }

      try {
        await helper.echo(denops, `Fetching ${url}...`);
        const response = await fetch(url);
        if (!response.ok) {
          const errorText = await response.text();
          await helper.echo(denops, `Failed to fetch ${url}: ${response.status} ${response.statusText}`);
          console.error(`Failed to fetch ${url}: ${response.status} ${response.statusText}\n${errorText}`);
          return;
        }
        const html = await response.text();

        // Parse HTML and extract title
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
          console.error(`Error parsing HTML from ${url}:`, parseError);
          await helper.echo(denops, `Error parsing HTML from ${url}.`);
          // パースエラーが発生しても、HTML自体の表示は試みる
        }

        // Insert title before the current cursor line
        if (title !== "No title found") {
          await denops.call('append', '.', title.split('\n')); // Append title lines after the current line
          await helper.echo(denops, `Inserted title: ${title}`); // Notify user
        } else {
          await helper.echo(denops, "Could not find title to insert.");
        }

      } catch (error) {
        await helper.echo(denops, `Error fetching ${url}: ${error}`);
        console.error(`Error fetching ${url}:`, error);
      }
    },
  };

  await batch.batch(denops, async (denops) => {
    await denops.cmd(
      `command! OgpmdHello call denops#request('${denops.name}', 'hello', [])`,
    );
    await denops.cmd(
      `command! -nargs=1 Ogpmd call denops#request('${denops.name}', 'fetchUrl', [<f-args>])`,
    );
  });

  console.log("ogpmd.nvim (denops) loaded");
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