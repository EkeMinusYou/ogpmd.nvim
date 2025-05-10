import type { Denops } from "./deps.ts";
import type { Metadata } from "./metadata.ts";
import type { Opt } from "./config.ts";
import { inspect } from "node:util";

export const writeImage = async (denops: Denops, data: Metadata, opt: Opt["img-clip"]): Promise<void> => {
  const formartedOpt = inspect(opt, { breakLength: 1000 }).replace(/'/g, '"').replace(/:/g, "=");
  const photoUrl = data.type === "twitter" ? data.tweetPhotoUrl : data.imageUrl;

  if (photoUrl) {
    await denops.cmd(`lua require("img-clip").paste_image(${formartedOpt}, "${photoUrl}")`);
    // imgclipの後にinsertモードになってしまうので、stopinsertしておく
    await denops.cmd("stopinsert");
    await denops.cmd("normal 0");
  }
};
