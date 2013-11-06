-- Get script source
if #arg < 1 then
  print('Usage: colony script.js')
  return 1
end
local p = arg[1]
if string.sub(p, 1, 1) ~= '.' then
  p = './' .. p
end

-- preprocess yay
os.execute("node preprocessor 2> /dev/null");

print('Run mem:', collectgarbage('count'))
local colony = require('lib/colony')
collectgarbage()
colony.run(p)
colony.runEventLoop();
print('End mem:', collectgarbage('count'))