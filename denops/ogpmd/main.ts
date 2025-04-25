import type { Denops } from "jsr:@denops/core@^7.0.0";
import * as batch from "jsr:@denops/std@^7.0.0/batch";
import * as helper from "jsr:@denops/std@^7.0.0/helper";

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async hello(): Promise<void> {
      await helper.echo(denops, "Hello World from ogpmd (denops)!");
    },
    async echo(args: unknown): Promise<void> {
      // args from -nargs=+ command is typically a single string
      const message = args as string;
      if (message) {
        await helper.echo(denops, `Ogpmd received: ${message}`);
      } else {
        // This case should not happen with -nargs=+ but added for safety
        await helper.echo(denops, "Usage: Ogpmd <text>");
      }
    },
  };

  await batch.batch(denops, async (denops) => {
    await denops.cmd(
      `command! OgpmdHello call denops#request('${denops.name}', 'hello', [])`,
    );
    await denops.cmd(
      `command! -nargs=+ Ogpmd call denops#request('${denops.name}', 'echo', [<f-args>])`,
    );
  });

  console.log("ogpmd.nvim (denops) loaded");
}