import type { Denops } from "jsr:@denops/core@^7.0.0";
import * as helper from "jsr:@denops/std@^7.0.0/helper";
import { DOMParser, type HTMLDocument } from "https://deno.land/x/deno_dom@v0.1.47/deno-dom-wasm.ts";
import { encodeBase64 } from "jsr:@std/encoding@^0.224.3/base64";

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async fetchOgpmd(args: unknown): Promise<void> {
      // 1. Validate arguments
      if (typeof args !== 'string') {
        await helper.echoerr(denops, `Invalid argument type: expected string, got ${typeof args}`);
        return;
      }
      const url = args;
      if (!isValidUrl(url)) {
        await helper.echoerr(denops, `Invalid URL: ${url}. Usage: Ogpmd <url>`);
        return;
      }

      // 2. Execute main logic with error handling
      await helper.echo(denops, `Fetching OGP data for ${url}...`);
      handleOgpmdRequest(denops, url)
        .then(() => {
          helper.echo(denops, `Successfully processed ${url}`);
        })
        .catch((error) => {
          helper.echoerr(denops, `Error processing ${url}: ${error.message || error}`);
        });
    },
  };

  // Register the command
  await denops.cmd(
    `command! -nargs=1 Ogpmd call denops#request('${denops.name}', 'fetchOgpmd', [<f-args>])`,
  );
}

// --- Main Logic Handler ---

async function handleOgpmdRequest(denops: Denops, url: string): Promise<void> {
  // 1. Fetch and parse HTML
  const doc = await fetchAndParseHtml(url);

  // 2. Extract OGP data
  const ogpData = extractOgpData(doc, url);

  // 3. Process extracted data (fetch/encode image)
  const processedData = await processOgpData(denops, ogpData, url);

  // 4. Insert data into buffer
  await insertDataIntoBuffer(denops, processedData, url);
}

// --- Helper Functions ---

// Represents the extracted OGP data
type OgpData = {
  title: string | null;
  ogpImageUrl: string | null;
};

// Represents the processed data ready for insertion
type ProcessedOgpData = {
  markdownLink: string | null;
  base64Image: string | null;
};

// Fetches HTML content from a URL and parses it into a DOM document.
async function fetchAndParseHtml(url: string): Promise<HTMLDocument> {
  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text().catch(() => "Could not read error response body");
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}\n${errorText}`);
  }
  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  if (!doc) {
    throw new Error(`Failed to parse HTML from ${url}`);
  }
  return doc;
}

// Extracts title and OGP image URL from the HTML document.
function extractOgpData(doc: HTMLDocument, baseUrl: string): OgpData {
  return {
    title: extractTitle(doc),
    ogpImageUrl: extractOgpImageUrl(doc, baseUrl),
  };
}

// Processes the extracted OGP data, fetching and encoding the image if available, using the original URL for the link.
async function processOgpData(denops: Denops, data: OgpData, originalUrl: string): Promise<ProcessedOgpData> {
  const markdownLink = data.title ? createMarkdownLink(data.title, originalUrl) : null;
  let base64Image: string | null = null;

  if (data.ogpImageUrl) {
    await helper.echo(denops, `OGP image found: ${data.ogpImageUrl}`);
    base64Image = await fetchAndEncodeImage(data.ogpImageUrl)
      .catch(async (error) => {
        await helper.echoerr(denops, `Failed to fetch or encode image ${data.ogpImageUrl}: ${error.message || error}`);
        return null; // Continue without image on error
      });
    if (base64Image) {
      await helper.echo(denops, "OGP image Base64 encoded.");
    }
  } else {
    await helper.echo(denops, "Could not find OGP image.");
  }

  if (data.title) {
     await helper.echo(denops, `Title found: ${data.title}`);
  } else {
     await helper.echo(denops, "Could not find title.");
  }


  return { markdownLink, base64Image };
}

// Inserts the processed OGP data (Markdown link and/or Base64 image) into the current buffer.
async function insertDataIntoBuffer(denops: Denops, processedData: ProcessedOgpData, url: string): Promise<void> {
  const linesToInsert: string[] = [];
  if (processedData.markdownLink) {
    linesToInsert.push(processedData.markdownLink);
  }
  if (processedData.base64Image) {
    // Insert the raw Base64 string directly
    linesToInsert.push(processedData.base64Image);
  }

  if (linesToInsert.length > 0) {
    await denops.call('append', '.', linesToInsert);
    await helper.echo(denops, `Inserted OGP data for ${url}`);
  } else {
    await helper.echo(denops, `No OGP data (title or image) found to insert for ${url}.`);
  }
}

// Extracts the title from a parsed HTML document. Returns null if not found.
function extractTitle(doc: HTMLDocument): string | null {
  const titleElement = doc.querySelector('title');
  return titleElement?.textContent?.trim() || null;
}

// Extracts the OGP image URL from a parsed HTML document, resolving relative URLs.
function extractOgpImageUrl(doc: HTMLDocument, baseUrl: string): string | null {
  const metaElement = doc.querySelector('meta[property="og:image"]');
  const imageUrl = metaElement?.getAttribute('content');

  if (imageUrl) {
    try {
      // Try to parse as an absolute URL first
      new URL(imageUrl);
      return imageUrl; // It's already absolute
    } catch (_) {
      // If parsing fails, assume it's relative and resolve against baseUrl
      try {
        return new URL(imageUrl, baseUrl).href;
      } catch (resolveError) {
        console.error(`Failed to resolve relative image URL "${imageUrl}" against base "${baseUrl}": ${resolveError}`);
        return null; // Cannot resolve URL
      }
    }
  }
  return null;
}

// Fetches an image URL and returns its Base64 encoded string. Throws error on failure.
async function fetchAndEncodeImage(imageUrl: string): Promise<string> {
    const response = await fetch(imageUrl);
    if (!response.ok) {
        const errorText = await response.text().catch(() => "Could not read error response body");
        throw new Error(`Failed to fetch image ${imageUrl}: ${response.status} ${response.statusText}\n${errorText}`);
    }
    const imageBuffer = await response.arrayBuffer();
    if (imageBuffer.byteLength === 0) {
        throw new Error(`Fetched empty image buffer from ${imageUrl}`);
    }
    return encodeBase64(imageBuffer);
}


// Creates a Markdown link string from a title and URL.
function createMarkdownLink(title: string, url: string): string {
  // Clean title (remove newlines) and ensure URL is present
  const cleanedTitle = title.replace(/[\r\n]+/g, ' ').trim();
  const targetUrl = url && url !== '#' ? url : '#'; // Use '#' if URL is missing or invalid placeholder
  return `[${cleanedTitle}](${targetUrl})`;
}

// Simple URL validation function (allows http, https, file protocols).
function isValidUrl(urlString: string): boolean {
  if (!urlString) return false;
  try {
    const parsedUrl = new URL(urlString);
    // Allow common web protocols and file protocol for local testing
    return ["http:", "https:", "file:"].includes(parsedUrl.protocol);
  } catch (_) {
    return false;
  }
}