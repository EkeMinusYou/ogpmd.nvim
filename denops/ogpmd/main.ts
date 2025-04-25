import type { Denops } from "jsr:@denops/core@^7.0.0";
import * as batch from "jsr:@denops/std@^7.0.0/batch";
import * as helper from "jsr:@denops/std@^7.0.0/helper";
// import * as fn from "jsr:@denops/std@^7.0.0/function"; // fn は setline に不要でした

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async hello(): Promise<void> {
      await helper.echo(denops, "Hello World from ogpmd (denops)!");
    },
    async fetchUrl(args: unknown): Promise<void> {
      // -nargs=1 なので、argsは単一の文字列のはず
      const url = args as string;
      if (!url || !isValidUrl(url)) {
        await helper.echo(denops, `Invalid URL: ${url}. Usage: Ogpmd <url>`);
        console.error(`Invalid URL received: ${url}`);
        return;
      }

      try {
        await helper.echo(denops, `Fetching ${url}...`); // 取得中メッセージ
        const response = await fetch(url);
        if (!response.ok) {
          const errorText = await response.text(); // エラー内容も取得試行
          await helper.echo(denops, `Failed to fetch ${url}: ${response.status} ${response.statusText}`);
          console.error(`Failed to fetch ${url}: ${response.status} ${response.statusText}\n${errorText}`);
          return;
        }
        const html = await response.text();

        // 新しいバッファにHTMLを表示
        await batch.batch(denops, async (denops) => {
          await denops.cmd('new'); // 新しいバッファを開く
          // denops.call('setline', ...) は Vim script の setline() と異なり、文字列配列を受け取る
          await denops.call('setline', 1, html.split('\n')); // 内容を書き込む
          await denops.cmd('setlocal buftype=nofile bufhidden=wipe noswapfile readonly'); // バッファの設定
          await denops.cmd('setlocal filetype=html'); // filetypeをhtmlに設定
        });
        await helper.echo(denops, `Successfully fetched and displayed content from ${url}`);

      } catch (error) {
        await helper.echo(denops, `Error fetching ${url}: ${error}`);
        console.error(`Error fetching ${url}:`, error);
      }
    },
  };

  await batch.batch(denops, async (denops) => {
    await denops.cmd(
      `command! OgpmdHello call denops#request('${denops.name}', 'hello', [])`,
    );
    await denops.cmd(
      // コマンド名を Ogpmd のまま、呼び出す関数を fetchUrl に変更
      // nargsを + から 1 に変更 (URLは通常スペースを含まないため)
      `command! -nargs=1 Ogpmd call denops#request('${denops.name}', 'fetchUrl', [<f-args>])`,
    );
  });

  console.log("ogpmd.nvim (denops) loaded");
}

// 簡単なURL形式チェック関数
function isValidUrl(urlString: string): boolean {
  if (!urlString) return false;
  try {
    // URLコンストラクタは相対URLも受け付けてしまう場合があるので、http/httpsで始まるかどうかもチェック
    const parsedUrl = new URL(urlString);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch (_) {
    return false;
  }
}