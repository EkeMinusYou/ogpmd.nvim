import { DOMParser, type HTMLDocument, puppeteer, chromeFinder, type puppeteer as PuppeteerTypes } from "./deps.ts"; // puppeteer.Browser を型としてインポートするためにエイリアスを使用

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
  let browser: PuppeteerTypes.Browser | undefined; // 型注釈を追加 (エイリアスを使用)
  try {
    browser = await puppeteer.launch({
      headless: true,
      executablePath: chromeFinder(),
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // 一般的なサンドボックス無効化オプション
    });
    const page = await browser.newPage();
    // User-Agent は puppeteer がデフォルトで設定するため、通常は不要
    // 必要であれば page.setUserAgent(...) で設定可能
    const response = await page.goto(url, {
      waitUntil: "domcontentloaded", // DOMの準備ができたら次に進む
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
    return doc;
  } catch (error) {
    // error が Error インスタンスか確認
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error fetching or parsing HTML from ${url}:`, error);
    throw new Error(`Failed to process ${url}: ${errorMessage}`); // 修正: 安全にメッセージを取得
  } finally {
    await browser?.close();
  }
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
        // エラーメッセージを改善
        console.error(`Failed to resolve relative image URL "${imageUrl}" against base "${baseUrl}":`, resolveError);
        // エラーを再スローする代わりに null を返すか、より具体的なエラーを投げる
        return null; // または throw new Error(...)
      }
    }
  }
  return null;
}
