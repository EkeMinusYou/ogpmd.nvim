import type { Denops } from "./deps.ts";

export async function write(denops: Denops, data: string[]): Promise<void> {
  if (data.length === 0) {
    console.log("No lines to insert.");
    return;
  }
  await denops.call("append", ".", data);
  console.log("Inserted data into buffer.");
}
