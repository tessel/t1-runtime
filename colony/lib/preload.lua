--
-- preload.lua
-- Called to initialize colony in a new runtime environment.
--

local colony = require('colony')
-- This is temporary until we can do global._arr in C extension methods
_G._colony = colony

-- "Precache" builtin library code as functions. 
-- This gets moved into colony.cache when run, as do all modules.
colony.precache = {}
for k, v in pairs(_builtin) do
  (function (k, v)
    colony.precache[k] = function ()
      ret = _builtin_load(k, v)()
      setfenv(ret, colony.global)
      return ret;
    end
    colony.precache[string.sub(k, 2)] = function ()
      ret = _builtin_load(k, v)()
      setfenv(ret, colony.global)
      return ret;
    end
  end)(k, v)
end
if _colony_preload_on_init then
  for k, v in pairs(_builtin) do
    -- preload all the things
    colony.run(k)
  end
end
collectgarbage()

if _G.COLONY_EMBED then
  -- This is temporary until we have tm_pwd() working
  colony._normalize = function (p, path_normalize)
    if string.sub(p, 1, 1) == '.' then
      p = path_normalize('/' .. p)
    end
    return p
  end
end

if not _G.COLONY_EMBED then
  -- This is temporary until we have proper compilation in C.
  colony._load = function (file)
    -- Compile JS script before running.
    os.execute('colony -m ' .. file .. ' > /tmp/colonyunique')
    local file = io.open('/tmp/colonyunique', 'r')
    local output = file:read('*all')
    file:close()
    return output
  end
end

-- Set up builtin dependencies
do 
  local Stream = colony.run('stream').Stream
  colony.global.process.stdin = colony.js_new(Stream)
  colony.global.process.stdout = colony.js_new(Stream)
end