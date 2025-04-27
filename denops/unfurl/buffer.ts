import type { Denops } from "./deps.ts";

export async function write(denops: Denops, data: string[]): Promise<void> {
  if (data.length === 0) {
    return;
  }
  const currentLine = await denops.call("line", ".") as number;
  await denops.call("append", currentLine, data);
  const lastLine = currentLine + data.length;
  await denops.call("cursor", lastLine, 1);
}
