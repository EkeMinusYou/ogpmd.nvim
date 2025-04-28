# unfurl.nvim

`unfurl.nvim` is a Neovim plugin that fetches the title and meta information (like image, type) from a given URL and inserts it into the current buffer in Markdown format. It's useful for quickly recording information about web pages when taking notes.

## Requirements

- [Neovim](https://neovim.io/) 0.9+
- [denops.vim](https://github.com/vim-denops/denops.vim)
- [img-clip.nvim](https://github.com/HakonHarnes/img-clip.nvim)

## Installation

Use [lazy.nvim](https://github.com/folke/lazy.nvim) to install:

```lua
{
  'EkeMinusYou/unfurl.nvim',
  dependencies = { 'vim-denops/denops.vim', 'HakonHarnes/img-clip.nvim' },
  -- No config function needed for basic Denops plugins unless specific setup is required
}
```

## Usage

After installing the plugin, you can use the `unfurl` command:

```
:Unfurl https://example.com
```

This will fetch the HTML title, meta image, and meta type (if available) from the specified URL. It will then insert the meta type as `(Type: type)`, the title as a Markdown link (`[title](url)`), and the meta image URL directly after the current cursor line in the buffer.

## Configuration

You can configure the behavior of `img-clip.nvim` when pasting images. The plugin uses the global variable `g:unfurl_img_clip_options` to pass options to `img-clip`.

Example configuration in Lua:

```lua
vim.g.unfurl_img_clip_options = {
  use_absolute_path = false,
  download_images = true,
  template = "![]($FILE_PATH)",
  -- Add other img-clip options here as needed
}
```

Refer to the [img-clip.nvim documentation](https://github.com/HakonHarnes/img-clip.nvim) for available options. If `g:unfurl_img_clip_options` is not set, the plugin will use the default options of `img-clip.nvim`.

## License

MIT License