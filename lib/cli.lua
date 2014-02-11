local colony = require('colony')

-- Command line invocation
if #arg < 2 then
  print('Usage: colony script.js')
  return 1
end
local p = arg[2]
if string.sub(p, 1, 1) ~= '.' then
  p = './' .. p
end

-- Run event Loop
colony.run(p)
colony.runEventLoop();
