-- Get script source
if #arg < 2 then
  print('Usage: colony script.js')
  return 1
end
local p = arg[2]
if string.sub(p, 1, 1) ~= '.' then
  p = './' .. p
end

-- preprocess yay
-- os.execute("node preprocessor 2> /dev/null");

-- print('Run mem:', collectgarbage('count'))
local status,err = pcall(function ()
  local colony = require('lib/colony')
  colony.precache = {}
  for k, v in pairs(_builtin) do
    (function (k, v)
      colony.precache[k] = function ()
        return _builtin_load(k, v)()
      end
      colony.precache[string.sub(k, 2)] = function ()
        return _builtin_load(k, v)()
      end
    end)(k, v)
  end
  collectgarbage()
  colony.run(p)
  colony.runEventLoop();
  -- print('End mem:', collectgarbage('count'))
end)

if not status then
  print(err)
end
