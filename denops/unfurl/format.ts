import type { Denops } from "./deps.ts";
import { helper } from "./deps.ts";
import type { OgpData } from "./html.ts";

/**
 * Represents the processed OGP data ready for insertion.
 */
export type ProcessedOgpData = {
  markdownLink: string | null;
  imageUrl: string | null;
};

/**
 * Processes the extracted OGP data into a format suitable for insertion.
 * Logs information about found data.
 * @param denops The Denops instance.
 * @param data The extracted OgpData.
 * @param originalUrl The original URL that was unfurled.
 * @returns A Promise resolving to the ProcessedOgpData.
 */
export async function processOgpData(denops: Denops, data: OgpData, originalUrl: string): Promise<ProcessedOgpData> {
  const markdownLink = data.title ? createMarkdownLink(data.title, originalUrl) : null;
  const imageUrl = data.ogpImageUrl;

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

/**
 * Inserts the processed OGP data (Markdown link and/or image) into the current buffer.
 * @param denops The Denops instance.
 * @param processedData The data to insert.
 * @param url The original URL (used for logging).
 */
export async function insertDataIntoBuffer(denops: Denops, processedData: ProcessedOgpData, url: string): Promise<void> {
  const linesToInsert: string[] = [];
  let titleForAlt = "ogp-image";

  if (processedData.markdownLink) {
    linesToInsert.push(processedData.markdownLink);
    const match = processedData.markdownLink.match(/^\[(.*?)\]\(.*\)$/);
    if (match?.[1]) {
      titleForAlt = match[1];
    }
  }

  if (processedData.imageUrl) {
    linesToInsert.push(processedData.imageUrl);
  }

  if (linesToInsert.length > 0) {
    await denops.call("append", ".", linesToInsert);
    await helper.echo(denops, `Inserted OGP data for ${url}`);
  } else {
    await helper.echo(denops, `No OGP data (title or image URL) found to insert for ${url}.`);
  }
}

/**
 * Creates a Markdown link string.
 * Cleans up the title by removing newlines.
 * @param title The link text (title).
 * @param url The link target URL.
 * @returns A Markdown formatted link string.
 */
function createMarkdownLink(title: string, url: string): string {
  const cleanedTitle = title.replace(/[\r\n]+/g, " ").trim();
  const targetUrl = url && url !== "#" ? url : "#";
  return `[${cleanedTitle}](${targetUrl})`;
}