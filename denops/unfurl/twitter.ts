import { chromeFinder, DOMParser, puppeteer } from "./deps.ts";
import { getMetadata, type MetaData } from "./html.ts"; // Import necessary functions and type

export const fetchTwitterMetadata = async (url: string): Promise<MetaData> => { // Change return type
  let browser: puppeteer.Browser | undefined;
  try {
    browser = await puppeteer.launch({
      executablePath: chromeFinder(),
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    );
    const response = await page.goto(url, {
      waitUntil: "networkidle0",
    });

    if (!response || !response.ok()) {
      throw new Error(
        `Failed to fetch ${url}: Status ${response?.status() ?? "unknown"}`,
      );
    }

    const html = await page.content();
    const doc = new DOMParser().parseFromString(html, "text/html");
    if (!doc) {
      throw new Error(`Failed to parse HTML from ${url}`);
    }

    const metadata = getMetadata(doc, url);
    return metadata;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error fetching or parsing HTML from ${url}:`, error);
    // Re-throw with a more specific error message if needed, or handle differently
    throw new Error(`Failed to process Twitter URL ${url}: ${errorMessage}`);
  } finally {
    await browser?.close();
  }
};
