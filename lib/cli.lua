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
  local colony = require('colony')
  -- This is temporary until we can do global._arr in extension methods
  _G._colony = colony

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

  if _G.COLONY_EMBED then
    -- This is temporary until _builtin takes pointer arugments
    colony.precache['tessel'] = _tessel_lib

    -- This is temporary until we have tm_pwd() working
    colony._normalize = function (p, path_normalize)
      if string.sub(p, 1, 1) == '.' then
        p = path_normalize('/' .. p)
      end
      return p
    end
  else
    -- This is temporary until we have proper compilation in C.
    -- Compile JS script before running.
    colony._load = function (file)
      os.execute('colony -c ' .. file .. ' > /tmp/colonyunique')
      local file = io.open('/tmp/colonyunique', 'r')
      local output = file:read('*all')
      file:close()
      return output
    end
  end

  colony.run(p)
  colony.runEventLoop();
  -- print('End mem:', collectgarbage('count'))
end)

if not status then
  print(err)
end
