import { DOMParser, type HTMLDocument } from "./deps.ts";

/**
 * Represents the extracted OGP data.
 */
export type OgpData = {
  title: string | null;
  ogpImageUrl: string | null;
};

/**
 * Fetches HTML content from the given URL and parses it into an HTMLDocument.
 * @param url The URL to fetch HTML from.
 * @returns A Promise resolving to the parsed HTMLDocument.
 * @throws If fetching or parsing fails.
 */
export async function fetchAndParseHtml(url: string): Promise<HTMLDocument> {
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

/**
 * Extracts OGP data (title and image URL) from the HTML document.
 * @param doc The parsed HTMLDocument.
 * @param baseUrl The base URL used to resolve relative image URLs.
 * @returns An OgpData object.
 */
export function extractOgpData(doc: HTMLDocument, baseUrl: string): OgpData {
  return {
    title: extractTitle(doc),
    ogpImageUrl: extractOgpImageUrl(doc, baseUrl),
  };
}

/**
 * Extracts the title from the HTML document.
 * @param doc The parsed HTMLDocument.
 * @returns The trimmed title text or null if not found.
 */
function extractTitle(doc: HTMLDocument): string | null {
  const titleElement = doc.querySelector("title");
  return titleElement?.textContent?.trim() || null;
}

/**
 * Extracts the OGP image URL from the HTML document.
 * Resolves relative URLs against the base URL.
 * @param doc The parsed HTMLDocument.
 * @param baseUrl The base URL for resolving relative paths.
 * @returns The absolute OGP image URL or null if not found or invalid.
 */
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