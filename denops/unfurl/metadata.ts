import { fetchOgp } from "./ogp.ts";
import { fetchTwitterMetadata } from "./twitter.ts";

export type Metadata = {
  type: "ogp";
  title: string | null;
  imageUrl: string | null;
  url: string;
  description: string | null;
} | {
  type: "twitter";
  // Twitter specific fields will be added later in twitter.ts
  [key: string]: unknown; // Allow other properties for now
  url: string; // Ensure url is always present
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
