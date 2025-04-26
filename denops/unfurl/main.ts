import type { Denops } from "./deps.ts";
import { helper } from "./deps.ts";
import { DOMParser, type HTMLDocument } from "./deps.ts";
export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async fetchunfurl(args: unknown): Promise<void> {
      // 1. Validate arguments
      if (typeof args !== "string") {
        await helper.echoerr(denops, `Invalid argument type: expected string, got ${typeof args}`);
        return;
      }
      const url = args;
      if (!isValidUrl(url)) {
        await helper.echoerr(denops, `Invalid URL: ${url}. Usage: unfurl <url>`);
        return;
      }

      // 2. Execute main logic with error handling
      await helper.echo(denops, `Fetching OGP data for ${url}...`);
      handleunfurlRequest(denops, url)
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
    `command! -nargs=1 Unfurl call denops#request('${denops.name}', 'fetchunfurl', [<f-args>])`,
  );
}

// --- Main Logic Handler ---

async function handleunfurlRequest(denops: Denops, url: string): Promise<void> {
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
  markdownLink: string | null; // Markdown link like [title](url)
  imageUrl: string | null; // Direct URL of the OGP image
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
  const imageUrl = data.ogpImageUrl; // Use the extracted URL directly

  if (imageUrl) {
    await helper.echo(denops, `OGP image URL found: ${imageUrl}`);
  } else {
    await helper.echo(denops, "Could not find OGP image URL.");
  }

  if (data.title) {
    await helper.echo(denops, `Title found: ${data.title}`);
  } else {
    await helper.echo(denops, "Could not find title.");
  }

  return { markdownLink, imageUrl };
}

// Inserts the processed OGP data (Markdown link and/or image URL) into the current buffer.
async function insertDataIntoBuffer(denops: Denops, processedData: ProcessedOgpData, url: string): Promise<void> {
  const linesToInsert: string[] = [];
  let titleForAlt = "ogp-image"; // Default alt text

  if (processedData.markdownLink) {
    linesToInsert.push(processedData.markdownLink);
    // Extract title from markdown link for image alt text if available
    const match = processedData.markdownLink.match(/^\[(.*?)\]\(.*\)$/);
    if (match?.[1]) { // Use optional chaining
      titleForAlt = match[1];
    }
  }
  if (processedData.imageUrl) {
    // Insert the image URL as a Markdown image link
    linesToInsert.push(`![${titleForAlt}](${processedData.imageUrl})`);
  }

  if (linesToInsert.length > 0) {
    await denops.call("append", ".", linesToInsert);
    await helper.echo(denops, `Inserted OGP data for ${url}`);
  } else {
    await helper.echo(denops, `No OGP data (title or image URL) found to insert for ${url}.`);
  }
}

// Extracts the title from a parsed HTML document. Returns null if not found.
function extractTitle(doc: HTMLDocument): string | null {
  const titleElement = doc.querySelector("title");
  return titleElement?.textContent?.trim() || null;
}

// Extracts the OGP image URL from a parsed HTML document, resolving relative URLs.
function extractOgpImageUrl(doc: HTMLDocument, baseUrl: string): string | null {
  const metaElement = doc.querySelector('meta[property="og:image"]');
  const imageUrl = metaElement?.getAttribute("content");

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

// Creates a Markdown link string from a title and URL.
function createMarkdownLink(title: string, url: string): string {
  // Clean title (remove newlines) and ensure URL is present
  const cleanedTitle = title.replace(/[\r\n]+/g, " ").trim();
  const targetUrl = url && url !== "#" ? url : "#"; // Use '#' if URL is missing or invalid placeholder
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
