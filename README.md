# ogpmd.nvim (Denops version)

(ここにプラグインの簡単な説明を記述)

## Requirements

- [Neovim](https://neovim.io/) 0.9+ or [Vim](https://www.vim.org/) 8.2+
- [denops.vim](https://github.com/vim-denops/denops.vim)

## Installation

Use your favorite plugin manager.

### [lazy.nvim](https://github.com/folke/lazy.nvim)

```lua
{
  'EkeMinusYou/ogpmd.nvim',
  dependencies = { 'vim-denops/denops.vim' },
  -- No config function needed for basic Denops plugins unless specific setup is required
}
```

### [vim-plug](https://github.com/junegunn/vim-plug)

```vim
Plug 'vim-denops/denops.vim'
Plug 'EkeMinusYou/ogpmd.nvim'
```

### [dein.vim](https://github.com/Shougo/dein.vim)

```vim
call dein#add('vim-denops/denops.vim')
call dein#add('EkeMinusYou/ogpmd.nvim')
```

## Usage

After installing the plugin, you can run the following commands in Neovim/Vim:

```vim
:OgpmdHello
```

This will print "Hello World from ogpmd (denops)!".

You can also provide an argument to the `Ogpmd` command:

```vim
:Ogpmd your_text_here
```

This will print "Ogpmd received: your_text_here".

## Configuration

(Currently, no specific configuration options are available.)

## Contributing

(貢献方法などがあれば記述)

## License

(ライセンス情報を記述)