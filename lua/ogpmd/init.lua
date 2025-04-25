-- ogpmd.nvim Lua module entry point

local M = {}

-- Function to print a greeting message
function M.hello()
  print("Hello World from ogpmd!")
end

-- Function to echo the provided argument
function M.echo_arg(args)
  if args.fargs[1] then
    print("Ogpmd received: " .. args.fargs[1])
  else
    print("Usage: Ogpmd <text>")
  end
end

function M.setup(opts)
  -- TODO: Implement more setup logic based on opts if needed

  -- Register OgpmdHello command
  vim.api.nvim_create_user_command(
    'OgpmdHello',
    M.hello,
    { desc = 'Prints a greeting message from ogpmd' }
  )

  -- Register Ogpmd command with arguments
  vim.api.nvim_create_user_command(
    'Ogpmd',
    M.echo_arg,
    {
      nargs = '+', -- Requires one or more arguments
      complete = 'file', -- Example completion, can be customized
      desc = 'Prints the provided argument'
    }
  )
end

return M