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
    local status = os.execute('colony-compiler ' .. file .. ' > /tmp/colonyunique')
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
  local Readable = colony.run('stream').Readable
  local Writable = colony.run('stream').Writable

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
