import type { Denops } from "jsr:@denops/core@^7.0.0";
import * as helper from "jsr:@denops/std@^7.0.0/helper";
import { DOMParser, type HTMLDocument } from "https://deno.land/x/deno_dom@v0.1.47/deno-dom-wasm.ts";
import { encodeBase64 } from "jsr:@std/encoding@^0.224.3/base64";

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async fetchOgpmd(args: unknown): Promise<void> {
      if (typeof args !== 'string') {
        await helper.echoerr(denops, `Invalid argument type: expected string, got ${typeof args}`);
        return;
      }
      const url = args;
      if (!url || !isValidUrl(url)) {
        await helper.echoerr(denops, `Invalid URL: ${url}. Usage: Ogpmd <url>`);
        return;
      }

      fetchAndInsertOgpmd(denops, url)
        .catch((error) => {
          helper.echoerr(denops, `Error processing ${url}: ${error}`);
        });
    },
  };

  await denops.cmd(
    `command! -nargs=1 Ogpmd call denops#request('${denops.name}', 'fetchOgpmd', [<f-args>])`,
  );
}

async function fetchAndInsertOgpmd(denops: Denops, url: string): Promise<void> {
  await helper.echo(denops, `Fetching ${url}...`);
  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}\n${errorText}`);
  }
  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, "text/html");

  if (!doc) {
    throw new Error(`Failed to parse HTML from ${url}`);
  }

  const title = extractTitle(doc);
  const ogpImageUrl = extractOgpImageUrl(doc, url); // Pass base URL for relative paths

  const linesToInsert: string[] = [];

  if (title !== "No title found") {
    const markdownLink = createMarkdownLink(title, url);
    linesToInsert.push(markdownLink);
    await helper.echo(denops, `Title found: ${title}`);
  } else {
    await helper.echo(denops, "Could not find title.");
  }

  if (ogpImageUrl) {
    await helper.echo(denops, `OGP image found: ${ogpImageUrl}`);
    try {
      const base64Image = await fetchAndEncodeImage(ogpImageUrl);
      if (base64Image) {
        // Insert the raw Base64 string directly
        linesToInsert.push(base64Image);
        await helper.echo(denops, "OGP image Base64 encoded and ready to insert.");
      }
    } catch (error) {
      await helper.echoerr(denops, `Failed to fetch or encode image ${ogpImageUrl}: ${error}`);
      // Continue without image if fetching/encoding fails
    }
  } else {
    await helper.echo(denops, "Could not find OGP image.");
  }

  if (linesToInsert.length > 0) {
    await denops.call('append', '.', linesToInsert);
    await helper.echo(denops, `Inserted OGP data for ${url}`);
  } else {
    await helper.echo(denops, `No OGP data (title or image) found to insert for ${url}.`);
  }
}

// Extracts the title from a parsed HTML document
function extractTitle(doc: HTMLDocument): string {
  const titleElement = doc.querySelector('title');
  return titleElement?.textContent?.trim() || "No title found";
}

// Extracts the OGP image URL from a parsed HTML document
function extractOgpImageUrl(doc: HTMLDocument, baseUrl: string): string | null {
  const metaElement = doc.querySelector('meta[property="og:image"]');
  let imageUrl = metaElement?.getAttribute('content');

  if (imageUrl) {
    // Handle relative URLs
    try {
      // Check if it's already an absolute URL
      new URL(imageUrl);
    } catch (_) {
      // If it's a relative URL, resolve it against the base URL
      try {
        imageUrl = new URL(imageUrl, baseUrl).href;
      } catch (resolveError) {
        console.error(`Failed to resolve relative image URL ${imageUrl} against base ${baseUrl}: ${resolveError}`);
        return null; // Cannot resolve URL
      }
    }
    return imageUrl;
  }
  return null;
}

// Fetches an image URL and returns its Base64 encoded string
async function fetchAndEncodeImage(imageUrl: string): Promise<string | null> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image ${imageUrl}: ${response.status} ${response.statusText}`);
  }
  const imageBuffer = await response.arrayBuffer();
  return encodeBase64(imageBuffer);
}

// Creates a Markdown link string from a title and URL
function createMarkdownLink(title: string, url: string): string {
  const cleanedTitle = title.replace(/\n/g, ' ');
  return `[${cleanedTitle}](${url})`;
}

// Simple URL validation function
function isValidUrl(urlString: string): boolean {
  if (!urlString) return false;
  try {
    const parsedUrl = new URL(urlString);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:" || parsedUrl.protocol === "file:"; // Allow file protocol for local testing if needed
  } catch (_) {
    return false;
  }
}