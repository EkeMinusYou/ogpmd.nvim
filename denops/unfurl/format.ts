import type { Denops } from "./deps.ts";
import { helper } from "./deps.ts";
import type { MetaData } from "./html.ts";

/**
 * Represents the processed metadata ready for insertion.
 */
export type ProcessedMetaData = {
  markdownLink: string | null;
  imageUrl: string | null;
  type: string | null; // Added: og:type
  url: string; // Added: URL (og:url or original)
};

/**
 * Processes the extracted metadata into a format suitable for insertion.
 * Logs information about found data.
 * @param denops The Denops instance.
 * @param data The extracted MetaData.
 * @param originalUrl The original URL that was unfurled.
 * @returns A Promise resolving to the ProcessedMetaData.
 */
export async function processMetaData(denops: Denops, data: MetaData, originalUrl: string): Promise<ProcessedMetaData> {
  // Use the URL from MetaData (prioritizes og:url)
  const urlToUse = data.url;
  const markdownLink = data.title ? createMarkdownLink(data.title, urlToUse) : null;
  const imageUrl = data.imageUrl; // Changed from data.ogpImageUrl
  const metaType = data.type; // Changed from data.ogType

  if (imageUrl) {
    await helper.echo(denops, `Image URL found: ${imageUrl}`); // Changed log message
  } else {
    await helper.echo(denops, "Could not find image URL."); // Changed log message
  }

  if (data.title) {
    await helper.echo(denops, `Title found: ${data.title}`);
  } else {
    await helper.echo(denops, "Could not find title.");
  }

  // Added: Log og:type if found
  if (metaType) { // Changed variable name
    await helper.echo(denops, `Meta type found: ${metaType}`); // Changed log message and variable
  } else {
    await helper.echo(denops, "Could not find meta type."); // Changed log message
  }


  return { markdownLink, imageUrl, type: metaType, url: urlToUse }; // Changed property name and variable
}

/**
 * Inserts the processed metadata (Markdown link and/or image) into the current buffer.
 * @param denops The Denops instance.
 * @param processedData The data to insert.
 * @param _url The original URL (now unused, URL comes from processedData).
 */
export async function insertDataIntoBuffer(denops: Denops, processedData: ProcessedMetaData, _url: string): Promise<void> { // Changed type
  const linesToInsert: string[] = [];
  let titleForAlt = "meta-image"; // Changed default alt text

  // Added: Insert og:type if available
  if (processedData.type) { // Changed property name
    linesToInsert.push(`(Type: ${processedData.type})`); // Changed property name
  }

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
    // Use the URL from processedData for logging
    await helper.echo(denops, `Inserted metadata for ${processedData.url}`); // Changed log message
  } else {
    // Use the URL from processedData for logging
    await helper.echo(denops, `No metadata (title or image URL) found to insert for ${processedData.url}.`); // Changed log message
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