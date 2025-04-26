# unfurl.nvim

`unfurl.nvim` is a Neovim plugin that fetches the title and meta information (like image, type) from a given URL and inserts it into the current buffer in Markdown format. It's useful for quickly recording information about web pages when taking notes.

## Requirements

- [Neovim](https://neovim.io/) 0.9+
- [denops.vim](https://github.com/vim-denops/denops.vim)

## Installation

Use [lazy.nvim](https://github.com/folke/lazy.nvim) to install:

```lua
{
  'EkeMinusYou/unfurl.nvim',
  dependencies = { 'vim-denops/denops.vim' },
  -- No config function needed for basic Denops plugins unless specific setup is required
}
```

## Usage

After installing the plugin, you can use the `unfurl` command:

```vim
:Unfurl https://example.com
```

This will fetch the HTML title, meta image, and meta type (if available) from the specified URL. It will then insert the meta type as `(Type: type)`, the title as a Markdown link (`[title](url)`), and the meta image URL directly after the current cursor line in the buffer.

## Configuration

(Currently, no specific configuration options are available.)

## Contributing

(貢献方法などがあれば記述)

## License

(ライセンス情報を記述)