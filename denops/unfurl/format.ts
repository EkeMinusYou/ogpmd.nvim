import type { Metadata } from "./html.ts";

export function format(data: Metadata): string[] {
  const outputs: string[] = [];
  const urlToUse = data.url;

  if (data.type === "normal") {
    const markdownLink = data.title ? createMarkdownLink(data.title, urlToUse) : null;
    const imageUrl = data.imageUrl;

    if (markdownLink) {
      outputs.push(markdownLink);
    }
    if (imageUrl) {
      outputs.push(imageUrl);
    }
  } else if (data.type === "twitter") {
    const markdownLink = createMarkdownLink("Twitter Link", urlToUse);
    outputs.push(markdownLink);
  }

  if (outputs.length === 0 && urlToUse) {
    outputs.push(urlToUse);
  }

  return outputs;
}

function createMarkdownLink(title: string, url: string): string {
  const cleanedTitle = title.replace(/[\r\n]+/g, " ").trim();
  const targetUrl = url && url !== "#" ? url : "#";
  return `[${cleanedTitle}](${targetUrl})`;
}
