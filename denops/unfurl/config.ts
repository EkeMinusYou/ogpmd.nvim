import { Denops, variable } from "./deps.ts";

export type Opt = typeof defaultOpt & Record<string, unknown>;

const defaultOpt = {
  "img-clip": {
    use_absolute_path: false,
    download_images: false,
    template: "![]($FILE_PATH)",
  },
};

export const getOpt = async (denops: Denops): Promise<Opt> => {
  const userConfig = await variable.g.get(denops, "unfurl_option", {});
  return { ...defaultOpt, ...userConfig };
};
