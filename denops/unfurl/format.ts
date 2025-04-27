import type { Metadata } from "./metadata.ts";

export function format(data: Metadata): string[] {
  const outputs: string[] = [];
  const urlToUse = data.url;

  if (data.type === "ogp") {
    if (data.siteName) {
      outputs.push(new MarkdownBuilder(data.siteName).emphasis().blockquote().build());
    }
    const link = data.title ? new MarkdownBuilder(data.title).link(urlToUse).blockquote().build() : null;
    if (link) {
      outputs.push(link);
    }
    if (data.imageUrl) {
      outputs.push(data.imageUrl);
    }
    if (data.description) {
      const description = data.description.split("\n");
      for (const line of description) {
        outputs.push(new MarkdownBuilder(line).blockquote().build());
      }
    }
  } else if (data.type === "twitter") {
    if (data.siteName) {
      outputs.push(new MarkdownBuilder(data.siteName).emphasis().blockquote().build());
    }
    const link = data.authorUrl ? new MarkdownBuilder(data.authorName).link(data.authorUrl).blockquote().build() : null;
    if (link) {
      outputs.push(link);
    }
    if (data.tweetText) {
      const tweetText = data.tweetText.split("\n");
      for (const line of tweetText) {
        outputs.push(new MarkdownBuilder(line).blockquote().build());
      }
    }
  }

  return outputs;
}

class MarkdownBuilder {
  constructor(private text: string) {}

  link(url: string): MarkdownBuilder {
    const cleanedTitle = this.text.replace(/[\r\n]+/g, " ").trim();
    const targetUrl = url && url !== "#" ? url : "#";
    return new MarkdownBuilder(`[${cleanedTitle}](${targetUrl})`);
  }

  blockquote(): MarkdownBuilder {
    return new MarkdownBuilder(`> ${this.text}`);
  }

  emphasis(): MarkdownBuilder {
    return new MarkdownBuilder(`*${this.text}*`);
  }

  build(): string {
    return this.text;
  }
}
