import { Denops } from "./deps.ts";
import { Metadata } from "./metadata.ts";

export const writeImage = async (denops: Denops, data: Metadata): Promise<void> => {
  if (data.type === "ogp" && data.imageUrl) {
    await denops.cmd(`lua require("img-clip").paste_image({use_absolute_path = false, download_images = true}, "${data.imageUrl}")`);
  }
  if (data.type === "twitter" && data.tweetPhotoUrl) {
    await denops.cmd(`lua require("img-clip").paste_image({use_absolute_path = false, download_images = true}, "${data.tweetPhotoUrl}")`);
  }
};
