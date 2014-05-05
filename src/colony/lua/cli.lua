--
-- cli.lua
-- A colony script to act as a command-line invocation tool.
--

local colony = require('colony')

-- This is temporary until we can add files to builtin array easily.
if _tessel_lib then
	colony.precache['tessel'] = _tessel_lib
	colony.run('tessel')
end

-- Command line invocation
if #arg < 2 then
  print('Usage: colony script.js')
  return 1
end
local p = arg[2]
if string.sub(p, 1, 1) ~= '.' then
  p = './' .. p
end

colony.run(p)
