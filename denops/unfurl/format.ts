import type { Metadata } from "./metadata.ts";

export function format(data: Metadata): string[] {
  const outputs: string[] = [];
  const urlToUse = data.url;

  if (data.type === "ogp") {
    if (data.siteName) {
      outputs.push(buildBlockquote(buildEmphasis(data.siteName)));
    }
    const link = data.title ? buildLink(data.title, urlToUse) : null;
    if (link) {
      outputs.push(buildBlockquote(link));
    }
    if (data.imageUrl) {
      outputs.push(data.imageUrl);
    }
    if (data.description) {
      outputs.push(buildBlockquote(data.description));
    }
  } else if (data.type === "twitter") {
    const markdownLink = buildLink("Twitter Link", urlToUse);
    outputs.push(markdownLink);
  }

  return outputs;
}

function buildLink(title: string, url: string): string {
  const cleanedTitle = title.replace(/[\r\n]+/g, " ").trim();
  const targetUrl = url && url !== "#" ? url : "#";
  return `[${cleanedTitle}](${targetUrl})`;
}

function buildBlockquote(text: string): string {
  return `> ${text}`;
}

function buildEmphasis(text: string): string {
  return `*${text}*`;
}
