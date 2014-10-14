-- Copyright 2014 Technical Machine, Inc. See the COPYRIGHT
-- file at the top-level directory of this distribution.
--
-- Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
-- http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
-- <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
-- option. This file may not be copied, modified, or distributed
-- except according to those terms.

--
-- preload.lua
-- Called to initialize colony in a new runtime environment.
--

local tm = require('tm')
local colony = require('colony')
-- This is temporary until we can do global._arr in C extension methods
_G._colony = colony

-- polyfills

if not table.pack then
  function table.pack(...)
    return { n = select("#", ...), ... }
  end
end

if not setfenv then -- Lua 5.2
  -- based on http://lua-users.org/lists/lua-l/2010-06/msg00314.html
  -- this assumes f is a function
  local function findenv(f)
    local level = 1
    repeat
      local name, value = debug.getupvalue(f, level)
      if name == '_ENV' then return level, value end
      level = level + 1
    until name == nil
    return nil end
  getfenv = function (f) return(select(2, findenv(f)) or _G) end
  setfenv = function (f, t)
    local level = findenv(f)
    if level then debug.setupvalue(f, level, t) end
    return f end
end

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
    local status = os.execute(_G.COLONY_COMPILER_PATH .. ' ' .. file .. ' > /tmp/colonyunique')
    if status ~= 0 then
      os.exit(status)
    end
    local file = io.open('/tmp/colonyunique', 'r')
    local output = file:read('*all')
    file:close()
    return output
  end
end

-- Set up builtin dependencies
do
  local EventEmitter = colony.run('events').EventEmitter

  global.process = js_new(EventEmitter)
  global.process.memoryUsage = function (ths)
    return js_obj({
      heapUsed=collectgarbage('count')*1024
    });
  end
  global.process.platform = "tessel"
  global.process.arch = "armv7-m"
  global.process.versions = js_obj({
    node = "0.10.0",
    colony = "0.10.0"
  })
  global.process.EventEmitter = EventEmitter
  global.process.argv = js_arr({}, 0)
  global.process.env = js_obj({})
  global.process.exit = function (this, code)
    tm.exit(code)
  end
  global.process.cwd = function ()
    return tm.cwd()
  end
  global.process.hrtime = function (this, prev)
    -- This number exceeds the 53-bit limit on integer representation, but with
    -- microsecond resolution, there are only ~50 bits of actual data
    local nanos = tm.timestamp() * 1e3;
    if prev ~= nil then
      nanos = nanos - prev[0]*1e9 + prev[1]
    end
    return js_arr({[0]=math.floor(nanos / 1e9), nanos % 1e9}, 2)
  end
  global.process.nextTick = global.setImmediate
  global.process.version = global.process.versions.node

  -- DEPLOY_TIME workaround for setting environmental time

  global.Object:defineProperty(global.process.env, 'DEPLOY_TIMESTAMP', {
    set = function (this, value)
      tm.timestamp_update((tonumber(value or 0) or 0)*1e3)
      rawset(this, 'DEPLOY_TIMESTAMP', value)
    end
  });

  -- simple process.ref() and process.unref() options

  global.process.ref = function ()
    if global.process.refid == nil then
      global.process.refid = global:setInterval(function () end, 1e8)
    end
  end

  global.process.unref = function ()
    if global.process.refid ~= nil then
      global:clearInterval(global.process.refid)
      global.process.refid = nil
    end
  end

  global.process.umask = function(ths, value)
    -- Return standard octal 0022
    return 18;
  end

  global.process.binding = function (self, key)
    if key == 'lua' then
      return js_wrap_module(_G)
    end
    return js_wrap_module(require(key))
  end


  local Readable = colony.run('stream').Readable
  local Writable = colony.run('stream').Writable

  colony.global.console = colony.run('console')

  colony.global.process.stdout = colony.js_new(Writable)
  colony.global.process.stdout._write = function (this, chunk, encoding, callback)
    tm.log(10, chunk)
    callback()
  end
  colony.global.process.stderr = colony.js_new(Writable)
  colony.global.process.stderr._write = function (this, chunk, encoding, callback)
    tm.log(13, chunk)
    callback()
  end

  -- setup stdin
  colony.global.process.stdin = colony.js_new(Readable)
  colony.global.process.stdin._read = function ()
  end
  colony.global.process.stdin:pause()
  local stdinkeepalive = nil
  colony.global.process.stdin:on('resume', function (this)
    if stdinkeepalive == nil then
      stdinkeepalive = colony.global:setInterval(function () end, 1e6)
    end
  end)
  colony.global.process.stdin:on('pause', function (this)
    if stdinkeepalive ~= nil then
      colony.global:clearInterval(stdinkeepalive)
    end
  end)
  -- hook into builtin ipc command
  colony.global.process:on('stdin', function (this, buf)
    colony.global.process.stdin:push(buf)
  end)
end
