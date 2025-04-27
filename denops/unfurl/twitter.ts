import { chromeFinder, puppeteer } from "./deps.ts";
import type { Metadata } from "./html.ts";

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
    const oembedResponse = await fetch(`https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`);
    if (!oembedResponse.ok) {
      throw new Error(
        `Failed to fetch Twitter oEmbed data for ${url}: Status ${oembedResponse.status}`,
      );
    }
    const oembedData: TwitterOEmbedResponse = await oembedResponse.json();

    browser = await puppeteer.launch({
      executablePath: chromeFinder(),
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(oembedData.html, { waitUntil: "domcontentloaded" });

    return {
      type: "twitter",
      url: oembedData.url || url,
      authorName: oembedData.author_name,
      authorUrl: oembedData.author_url,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to process Twitter URL ${url}: ${errorMessage}`);
  } finally {
    await browser?.close();
  }
};
