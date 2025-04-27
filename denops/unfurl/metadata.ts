import { fetchOgp } from "./ogp.ts";
import { fetchTwitterMetadata } from "./twitter.ts";

export type Metadata = {
  type: "ogp";
  url: string;
  title: string | null;
  siteName: string | null;
  imageUrl: string | null;
  description: string | null;
} | {
  type: "twitter";
  url: string;
  siteName: "X (formerly Twitter)"
  authorName: string;
  authorUrl: string;
  tweetText: string | null;
  tweetPhotoUrl: string | null;
};

export function fetchMetadata(urlString: string): Promise<Metadata> {
  try {
    const url = new URL(urlString);
    const hostname = url.hostname;

    if (hostname === "twitter.com" || hostname === "x.com") {
      return fetchTwitterMetadata(urlString);
    }
    return fetchOgp(urlString);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error fetching metadata for ${urlString}: ${errorMessage}`);
    throw new Error(`Failed to fetch metadata for ${urlString}: ${errorMessage}`);
  }
}
