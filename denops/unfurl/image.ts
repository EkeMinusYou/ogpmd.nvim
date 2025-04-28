import { Denops } from "./deps.ts";
import { Metadata } from "./metadata.ts";
import { getOpt } from "./config.ts";
import { inspect } from "node:util";

export const writeImage = async (denops: Denops, data: Metadata): Promise<void> => {
  const opt = await getOpt(denops);
  const formartedOpt = inspect(opt["img-clip"], { breakLength: 1000 }).replace(/'/g, '"').replace(/:/g, "=");
  const photoUrl = data.type === "twitter" ? data.tweetPhotoUrl : data.imageUrl;

  if (photoUrl) {
    await denops.cmd(`lua require("img-clip").paste_image(${formartedOpt}, "${photoUrl}")`);
    // imgclipの後にinsertモードになってしまうので、stopinsertしておく
    await denops.cmd("stopinsert");
    await denops.cmd("normal 0");
  }
};
