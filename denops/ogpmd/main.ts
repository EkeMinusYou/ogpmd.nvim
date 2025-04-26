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

      fetchAndInsertMarkdownLink(denops, url)
        .catch((error) => {
          helper.echoerr(denops, `Error processing ${url}: ${error}`);
        });
    },
  };

  await denops.cmd(
    `command! -nargs=1 Ogpmd call denops#request('${denops.name}', 'fetchUrl', [<f-args>])`,
  );
}

async function fetchAndInsertMarkdownLink(denops: Denops, url: string): Promise<void> {
  await helper.echo(denops, `Fetching ${url}...`);
  const response = await fetch(url);
  if (!response.ok) {
    // Throw an error if the fetch failed, to be caught by the caller
    const errorText = await response.text();
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}\n${errorText}`);
  }
  const html = await response.text();
  const title = await extractTitleFromHtml(html, denops, url); // Pass url for logging context

  // Insert title after the current cursor line
  if (title !== "No title found") {
    const markdownLink = createMarkdownLink(title, url);
    await denops.call('append', '.', markdownLink); // Append markdown link after the current line
    await helper.echo(denops, `Inserted: ${markdownLink}`); // Notify user
  } else {
    // Optionally insert just the URL if title is not found, or do nothing
    await helper.echo(denops, "Could not find title to insert.");
  }
}

// Extracts the title from an HTML string
async function extractTitleFromHtml(html: string, denops: Denops, url: string): Promise<string> {
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
    // Log parsing error but return default title
    await helper.echoerr(denops, `Error parsing HTML from ${url}: ${parseError}`);
  }
  return title;
}

// Creates a Markdown link string from a title and URL
function createMarkdownLink(title: string, url: string): string {
  // Replace newlines in title with spaces for single-line display in Markdown
  const cleanedTitle = title.replace(/\n/g, ' ');
  return `[${cleanedTitle}](${url})`;
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