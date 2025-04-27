import { chromeFinder, puppeteer } from "./deps.ts";
import type { Metadata } from "./html.ts";

// Define the structure of the oEmbed JSON response
interface TwitterOEmbedResponse {
  url: string;
  author_name: string;
  author_url: string;
  html: string;
  width: number;
  height: number | null;
  type: string;
  cache_age: string;
  provider_name: string;
  provider_url: string;
  version: string;
}

export const fetchTwitterMetadata = async (url: string): Promise<Metadata> => {
  let browser: puppeteer.Browser | undefined;
  try {
    // 1. Fetch oEmbed data
    const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`;
    const oembedResponse = await fetch(oembedUrl);
    if (!oembedResponse.ok) {
      throw new Error(
        `Failed to fetch Twitter oEmbed data for ${url}: Status ${oembedResponse.status}`,
      );
    }
    const oembedData: TwitterOEmbedResponse = await oembedResponse.json();

    // 2. Launch Puppeteer to render the oEmbed HTML
    browser = await puppeteer.launch({
      executablePath: chromeFinder(),
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    // 3. Set content and render
    // Wrap the oEmbed HTML in a basic HTML structure for proper rendering
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${oembedData.html}</body></html>`;
    await page.setContent(fullHtml, { waitUntil: "networkidle0" });

    // 4. Extract rendered content (e.g., the main tweet text)
    // The structure of the rendered tweet might change, adjust selector if needed
    const tweetContentElement = await page.$("blockquote > p"); // Example selector
    const tweetText = tweetContentElement ? await page.evaluate((el) => el.textContent, tweetContentElement) : null;

    // 5. Construct Metadata
    const metadata: Metadata = {
      type: "twitter",
      url: oembedData.url || url, // Prefer oEmbed URL, fallback to original
      authorName: oembedData.author_name,
      authorUrl: oembedData.author_url,
      renderedHtml: oembedData.html, // Include the raw embed HTML
      tweetText: tweetText?.trim() || null, // Include extracted text
      // Add other relevant fields from oembedData if needed
    };
    console.log("Twitter metadata fetched successfully:", metadata);

    return metadata;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error processing Twitter URL ${url}:`, error);
    // Return a basic twitter metadata object on error, or rethrow
    // For now, let's rethrow to indicate failure clearly
    throw new Error(`Failed to process Twitter URL ${url}: ${errorMessage}`);
  } finally {
    // 6. Ensure browser is closed
    await browser?.close();
  }
};
