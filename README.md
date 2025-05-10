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

After installing the plugin, you can use the following commands:

### `:Unfurl <url>`

```
:Unfurl https://example.com
```

This command fetches the HTML title, meta image, and meta type (if available) from the specified URL. It then inserts the meta type as `(Type: type)`, the title as a Markdown link (`[title](url)`), and the meta image URL (or path if downloaded, based on configuration) directly after the current cursor line in the buffer. Whether the image is downloaded depends on the `download_images` option in your configuration.

### `:Unfurld <url>`

```
:Unfurld https://example.com
```

This command works similarly to `:Unfurl`, but it **always downloads** the meta image to your local machine, regardless of the `download_images` setting in your configuration. This is useful when you specifically want to save the image locally for a particular URL.

## Configuration

You can configure the behavior of the plugin, including options passed to `img-clip.nvim`. The plugin uses the global variable `g:unfurl_option` for configuration.

Example configuration in Lua:

```lua
vim.g.unfurl_option = {
  ["img-clip"] = {
    use_absolute_path = false,
    download_images = false, -- Set to true to download images by default with :Unfurl
    template: "![$FILE_NAME]($FILE_PATH)",
    -- Add other img-clip options here as needed
  },
  -- Add other plugin-specific options here in the future
}
```

The options under the `"img-clip"` key are passed directly to `img-clip.nvim`. Refer to the [img-clip.nvim documentation](https://github.com/HakonHarnes/img-clip.nvim) for available options.

- `download_images`: Controls whether `:Unfurl` downloads images by default. Defaults to `false`. Note that `:Unfurld` always downloads images.

If `g:unfurl_option` or `g:unfurl_option["img-clip"]` is not set, the plugin will use default values (including `download_images = false`).

## License

MIT License