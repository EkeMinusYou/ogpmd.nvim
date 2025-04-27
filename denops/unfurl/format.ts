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
      const description = data.description.split("\n");
      for (const line of description) {
        outputs.push(buildBlockquote(line));
      }
    }
  } else if (data.type === "twitter") {
    if (data.siteName) {
      outputs.push(buildBlockquote(buildEmphasis(data.siteName)));
    }
    const link = data.authorUrl ? buildLink(data.authorName, urlToUse) : null;
    if (link) {
      outputs.push(buildBlockquote(link));
    }
    if (data.tweetText) {
      const tweetText = data.tweetText.split("\n");
      for (const line of tweetText) {
        outputs.push(buildBlockquote(line));
      }
    }
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
