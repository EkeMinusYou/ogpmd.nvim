import type { Denops } from "./deps.ts";

export async function write(denops: Denops, data: string[]): Promise<void> {
  if (data.length === 0) {
    return;
  }
  await denops.call("append", ".", data);
}
