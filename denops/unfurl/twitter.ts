import { DOMParser } from "./deps.ts";
import type { MetaData } from "./html.ts"; // Import MetaData type

// Helper function to check if URL is from Twitter/X
export function isTwitterUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return hostname === "twitter.com" || hostname === "x.com";
  } catch {
    return false;
  }
}

// Function to fetch and parse oEmbed data for Twitter/X
export async function fetchTwitterOembed(url: string): Promise<MetaData> {
  const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`;
  const headers = {
    "User-Agent": "Mozilla/5.0 (compatible; unfurl.nvim)", // Set a specific user agent
  };

  try {
    const response = await fetch(oembedUrl, { headers });
    if (!response.ok) {
      const errorText = await response.text().catch(() => "Could not read error response body");
      throw new Error(`Failed to fetch oEmbed for ${url}: ${response.status} ${response.statusText}\n${errorText}`);
    }
    const data = await response.json();

    // Extract title from the oEmbed HTML response
    let title: string | null = null;
    if (data.html) {
      const doc = new DOMParser().parseFromString(data.html, "text/html");
      const blockquote = doc?.querySelector("blockquote p");
      if (blockquote) {
        // Use author name and the beginning of the tweet text as title
        const tweetText = blockquote.textContent?.trim().replace(/\s+/g, ' ').substring(0, 100); // Limit length
        title = `${data.author_name || 'Tweet'}: ${tweetText}...`;
      }
    }
    // Fallback to author_name if HTML parsing fails
    if (!title && data.author_name) {
        title = `Tweet by ${data.author_name}`;
    }

    return {
      title: title,
      imageUrl: null, // oEmbed for tweets often doesn't provide a direct image URL
      type: data.type || "rich", // Typically 'rich' for tweets
      url: data.url || url, // Use the URL from oEmbed response if available
    };
  } catch (error) {
    console.error(`Error fetching or parsing oEmbed for ${url}: ${error}`);
    // Fallback to basic metadata if oEmbed fails
    return { title: null, imageUrl: null, type: null, url: url };
  }
}