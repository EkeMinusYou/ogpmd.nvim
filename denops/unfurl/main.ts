import type { Denops } from "./deps.ts";
import { helper } from "./deps.ts";
import { DOMParser, type HTMLDocument } from "./deps.ts";

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async fetchUnfurl(args: unknown): Promise<void> {
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
      handleunfurlRequest(denops, url)
        .then(() => {
          helper.echo(denops, `Successfully processed ${url}`);
        })
        .catch((error) => {
          helper.echoerr(denops, `Error processing ${url}: ${error.message || error}`);
        });
    },
  };

  await denops.cmd(
    `command! -nargs=1 Unfurl call denops#request('${denops.name}', 'fetchunfurl', [<f-args>])`,
  );
}

async function handleunfurlRequest(denops: Denops, url: string): Promise<void> {
  const doc = await fetchAndParseHtml(url);

  const ogpData = extractOgpData(doc, url);

  const processedData = await processOgpData(denops, ogpData, url);

  await insertDataIntoBuffer(denops, processedData, url);
}

type OgpData = {
  title: string | null;
  ogpImageUrl: string | null;
};

type ProcessedOgpData = {
  markdownLink: string | null; // Markdown link like [title](url)
  imageUrl: string | null; // Direct URL of the OGP image
};

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

function extractOgpData(doc: HTMLDocument, baseUrl: string): OgpData {
  return {
    title: extractTitle(doc),
    ogpImageUrl: extractOgpImageUrl(doc, baseUrl),
  };
}

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

async function insertDataIntoBuffer(denops: Denops, processedData: ProcessedOgpData, url: string): Promise<void> {
  const linesToInsert: string[] = [];
  let titleForAlt = "ogp-image"; // Default alt text

  if (processedData.markdownLink) {
    linesToInsert.push(processedData.markdownLink);
    const match = processedData.markdownLink.match(/^\[(.*?)\]\(.*\)$/);
    if (match?.[1]) {
      titleForAlt = match[1];
    }
  }
  if (processedData.imageUrl) {
    linesToInsert.push(`![${titleForAlt}](${processedData.imageUrl})`);
  }

  if (linesToInsert.length > 0) {
    await denops.call("append", ".", linesToInsert);
    await helper.echo(denops, `Inserted OGP data for ${url}`);
  } else {
    await helper.echo(denops, `No OGP data (title or image URL) found to insert for ${url}.`);
  }
}

function extractTitle(doc: HTMLDocument): string | null {
  const titleElement = doc.querySelector("title");
  return titleElement?.textContent?.trim() || null;
}

function extractOgpImageUrl(doc: HTMLDocument, baseUrl: string): string | null {
  const metaElement = doc.querySelector('meta[property="og:image"]');
  const imageUrl = metaElement?.getAttribute("content");

  if (imageUrl) {
    try {
      new URL(imageUrl);
      return imageUrl;
    } catch (_) {
      try {
        return new URL(imageUrl, baseUrl).href;
      } catch (resolveError) {
        console.error(`Failed to resolve relative image URL "${imageUrl}" against base "${baseUrl}": ${resolveError}`);
        return null;
      }
    }
  }
  return null;
}

function createMarkdownLink(title: string, url: string): string {
  const cleanedTitle = title.replace(/[\r\n]+/g, " ").trim();
  const targetUrl = url && url !== "#" ? url : "#";
  return `[${cleanedTitle}](${targetUrl})`;
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
