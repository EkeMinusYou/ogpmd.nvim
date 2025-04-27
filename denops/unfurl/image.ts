import { Denops } from "./deps.ts";
import { Metadata } from "./metadata.ts";

export const writeImage = async (denops: Denops, data: Metadata): Promise<void> => {
  if (data.type === "ogp" && data.imageUrl) {
    console.log(data.imageUrl);
    await denops.cmd(
      `lua require("img-clip").paste_image({use_absolute_path = false, download_images = true, template = "![]($FILE_PATH)"}, "${data.imageUrl}")`,
    );
    // imgclipの後にinsertモードになってしまうので、stopinsertしておく
    await denops.cmd("stopinsert");
    await denops.cmd("normal 0");
  }
  if (data.type === "twitter" && data.tweetPhotoUrl) {
    console.log(data.tweetPhotoUrl);
    await denops.cmd(
      `lua require("img-clip").paste_image({use_absolute_path = false, download_images = true, template = "![]($FILE_PATH)"}, "${data.tweetPhotoUrl}")`,
    );
    // imgclipの後にinsertモードになってしまうので、stopinsertしておく
    await denops.cmd("stopinsert");
    await denops.cmd("normal 0");
  }
};
