import { Denops, variable } from "./deps.ts";

const defaultOpt = {
  "img-clip": {
    use_absolute_path: false,
    download_images: false,
    template: "![]($FILE_PATH)",
  },
} as const;

export const getOpt = async (denops: Denops) => {
  const userConfig = await variable.g.get(denops, "unfurl_option", {});
  return { ...defaultOpt, ...userConfig };
};
