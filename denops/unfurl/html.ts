import { DOMParser, type HTMLDocument } from "./deps.ts";

export type MetaData = {
  title: string | null;
  imageUrl: string | null;
  type: string | null;
  url: string;
};

export async function fetchMetadata(url: string): Promise<MetaData> {
  const doc = await fetchHtml(url);
  const metadata = getMetadata(doc, url);
  return metadata;
}

async function fetchHtml(url: string): Promise<HTMLDocument> {
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

function getMetadata(doc: HTMLDocument, baseUrl: string): MetaData {
  const metaUrl = getUrl(doc);
  return {
    title: getTitle(doc),
    imageUrl: getImageUrl(doc, baseUrl),
    type: getType(doc),
    url: metaUrl || baseUrl,
  };
}

function getUrl(doc: HTMLDocument): string | null {
  const metaElement = doc.querySelector('meta[property="og:url"]');
  return metaElement?.getAttribute("content")?.trim() || null;
}

function getType(doc: HTMLDocument): string | null {
  const metaElement = doc.querySelector('meta[property="og:type"]');
  return metaElement?.getAttribute("content")?.trim() || null;
}

function getTitle(doc: HTMLDocument): string | null {
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

function getImageUrl(doc: HTMLDocument, baseUrl: string): string | null {
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
