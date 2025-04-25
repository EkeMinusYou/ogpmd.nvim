# ogpmd.nvim

(ここにプラグインの簡単な説明を記述)

## Installation

### [lazy.nvim](https://github.com/folke/lazy.nvim)

**Using `lazy.nvim`:**

```lua
{
  'EkeMinusYou/ogpmd.nvim',
  opts = {
    -- configuration options
  },
  config = function(_, opts)
    require('ogpmd').setup(opts)
  end,
}
```

**Local Installation (for testing):**

If you want to test the plugin locally without publishing it, you can specify the local path using the `dev` option:

```lua
-- Example for local development:
{
  dir = '/Users/mineo/src/github.com/EkeMinusYou/ogpmd.nvim', -- Path to your local plugin
  dev = true,
  opts = {
    -- configuration options
  },
  config = function(_, opts)
    require('ogpmd').setup(opts)
  end,
}
```

```lua
{
  'EkeMinusYou/ogpmd.nvim',
  opts = {
    -- configuration options
  },
  config = function(_, opts)
    require('ogpmd').setup(opts)
  end,
}
```

## Usage

After installing and setting up the plugin, you can run the following command in Neovim:

```vim
:OgpmdHello
```

This will print "Hello World from ogpmd!".
You can also provide an argument to the `Ogpmd` command:

```vim
:Ogpmd your_text_here
```

This will print "Ogpmd received: your_text_here".

## Configuration

(ここに設定オプションの詳細を記述)

## Contributing

(貢献方法などがあれば記述)

## License

(ライセンス情報を記述)