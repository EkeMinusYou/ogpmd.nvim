import { DOMParser, type HTMLDocument } from "./deps.ts";

export type MetaData = {
  title: string | null;
  imageUrl: string | null;
  type: string | null; // Added: og:type
  url: string; // Added: URL (og:url or original)
};

export async function fetchHtml(url: string): Promise<HTMLDocument> {
  // Add a common browser User-Agent header
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0",
  };
  const response = await fetch(url, { headers });
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

function extractMetaUrl(doc: HTMLDocument): string | null {
  const metaElement = doc.querySelector('meta[property="og:url"]');
  return metaElement?.getAttribute("content")?.trim() || null;
}

function extractMetaType(doc: HTMLDocument): string | null {
  const metaElement = doc.querySelector('meta[property="og:type"]');
  return metaElement?.getAttribute("content")?.trim() || null;
}

export function extractMetaData(doc: HTMLDocument, baseUrl: string): MetaData {
  const metaUrl = extractMetaUrl(doc);
  return {
    title: extractTitle(doc),
    imageUrl: extractImageUrl(doc, baseUrl),
    type: extractMetaType(doc),
    url: metaUrl || baseUrl,
  };
}

function extractTitle(doc: HTMLDocument): string | null {
  // Try to get og:title first
  const ogTitleElement = doc.querySelector('meta[property="og:title"]');
  const ogTitle = ogTitleElement?.getAttribute("content")?.trim();
  if (ogTitle) {
    return ogTitle;
  }

  // Fallback to the <title> tag
  const titleElement = doc.querySelector("title");
  return titleElement?.textContent?.trim() || null;
}

function extractImageUrl(doc: HTMLDocument, baseUrl: string): string | null {
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
        throw new Error(
          `Failed to resolve relative image URL "${imageUrl}" against base "${baseUrl}": ${resolveError}`,
        );
      }
    }
  }
  return null;
}
