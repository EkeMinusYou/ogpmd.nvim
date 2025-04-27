import { DOMParser, type HTMLDocument } from "./deps.ts";
import { fetchTwitterMetadata } from "./twitter.ts"; // Import fetchTwitterMetadata

export type MetaData = {
  title: string | null;
  imageUrl: string | null;
  url: string;
};

export async function fetchMetadata(urlString: string): Promise<MetaData> {
  try {
    const url = new URL(urlString);
    const hostname = url.hostname;

    if (hostname === "twitter.com" || hostname === "x.com") {
      return await fetchTwitterMetadata(urlString);
    }
    const doc = await fetchHtml(urlString);
    const metadata = getMetadata(doc, urlString);
    return metadata;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error fetching metadata for ${urlString}: ${errorMessage}`);
    throw new Error(`Failed to fetch metadata for ${urlString}: ${errorMessage}`);
  }
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

export function getMetadata(doc: HTMLDocument, baseUrl: string): MetaData {
  const metaUrl = getUrl(doc);
  return {
    title: getTitle(doc),
    imageUrl: getImageUrl(doc, baseUrl),
    url: metaUrl || baseUrl,
  };
}

function getUrl(doc: HTMLDocument): string | null {
  const metaElement = doc.querySelector('meta[property="og:url"]');
  return metaElement?.getAttribute("content")?.trim() || null;
}

function getTitle(doc: HTMLDocument): string | null {
  const ogTitleElement = doc.querySelector('meta[property="og:title"]');
  const ogTitle = ogTitleElement?.getAttribute("content")?.trim();
  if (ogTitle) {
    return ogTitle;
  }

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
        console.error(`Failed to resolve relative image URL "${imageUrl}" against base "${baseUrl}":`, resolveError);
        return null;
      }
    }
  }
  return null;
}
