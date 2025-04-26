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
export async function processMetaData(_denops: Denops, data: MetaData, _originalUrl: string): Promise<ProcessedMetaData> {
  // Use the URL from MetaData (prioritizes og:url)
  const urlToUse = data.url;
  const markdownLink = data.title ? createMarkdownLink(data.title, urlToUse) : null;
  const imageUrl = data.imageUrl;
  const metaType = data.type;

  // Removed debug logs

  return { markdownLink, imageUrl, type: metaType, url: urlToUse };
}

/**
 * Inserts the processed metadata (Markdown link and/or image) into the current buffer.
 * @param denops The Denops instance.
 * @param processedData The data to insert.
 * @param _url The original URL (now unused, URL comes from processedData).
 */
export async function insertDataIntoBuffer(denops: Denops, processedData: ProcessedMetaData): Promise<void> {
  const linesToInsert: string[] = [];
  // Removed unused titleForAlt variable

  // Insert title (markdownLink) first
  if (processedData.markdownLink) {
    linesToInsert.push(processedData.markdownLink);
    // Removed unused title extraction for alt text
  }

  // Then insert type
  if (processedData.type) { // Changed property name
    linesToInsert.push(`(Type: ${processedData.type})`); // Changed property name
  }

  // Finally insert imageUrl
  if (processedData.imageUrl) {
    linesToInsert.push(processedData.imageUrl); // Keep original logic for image URL
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