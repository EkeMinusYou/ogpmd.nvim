import type { MetaData } from "./html.ts";

export function format(data: MetaData): string[] {
  const urlToUse = data.url;
  const markdownLink = data.title ? createMarkdownLink(data.title, urlToUse) : null;
  const imageUrl = data.imageUrl;
  const metaType = data.type;

  const linesToInsert: string[] = [];

  if (markdownLink) {
    linesToInsert.push(markdownLink);
  }

  if (metaType) {
    linesToInsert.push(`(Type: ${metaType})`);
  }

  if (imageUrl) {
    linesToInsert.push(imageUrl);
  }
  return linesToInsert;
}

function createMarkdownLink(title: string, url: string): string {
  const cleanedTitle = title.replace(/[\r\n]+/g, " ").trim();
  const targetUrl = url && url !== "#" ? url : "#";
  return `[${cleanedTitle}](${targetUrl})`;
}
