import { DOMParser, type HTMLDocument } from "./deps.ts";
import type { Metadata } from "./metadata.ts";

export async function fetchOgp(url: string): Promise<Metadata> {
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
  const metadata = getMetadata(doc, url);
  return metadata;
}

export function getMetadata(doc: HTMLDocument, baseUrl: string): Metadata {
  const metaUrl = getUrl(doc);
  return {
    type: "ogp",
    url: metaUrl || baseUrl,
    siteName: getSiteName(doc),
    title: getTitle(doc),
    imageUrl: getImageUrl(doc, baseUrl),
    description: getDescription(doc),
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

function getDescription(doc: HTMLDocument): string | null {
  const ogDescriptionElement = doc.querySelector('meta[property="og:description"]');
  const ogDescription = ogDescriptionElement?.getAttribute("content")?.trim();
  if (ogDescription) {
    return ogDescription;
  }
  return null;
}

function getSiteName(doc: HTMLDocument): string | null {
  const ogSiteNameElement = doc.querySelector('meta[property="og:site_name"]');
  return ogSiteNameElement?.getAttribute("content")?.trim() || null;
}
