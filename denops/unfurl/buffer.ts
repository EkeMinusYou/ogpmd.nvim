import { Denops } from "./deps.ts";

export async function write(denops: Denops, data: string[]): Promise<void> {
  if (data.length > 0) {
    await denops.call("append", ".", data);
    console.log(`Inserted metadata`);
  } else {
    console.log(`No metadata (title or image URL) found to insert.`);
  }
}
