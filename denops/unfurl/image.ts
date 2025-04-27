import { Denops } from "./deps.ts";
import { Metadata } from "./metadata.ts";

export const writeImage = async (denops: Denops, data: Metadata): Promise<void> => {
  if (data.type === "ogp" && data.imageUrl) {
    await denops.call("append", ".", data.imageUrl);
  }
  if (data.type === "twitter" && data.tweetPhotoUrl) {
    await denops.call("append", ".", data.tweetPhotoUrl);
  }
};
