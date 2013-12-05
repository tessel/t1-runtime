return function (colony)

local bit = require('bit32')
local tm = require('tm')
local http_parser = require('http_parser')

-- locals

local js_arr = colony.js_arr
local js_obj = colony.js_obj
local js_new = colony.js_new
local js_tostring = colony.js_tostring
local js_instanceof = colony.js_instanceof
local js_typeof = colony.js_typeof
local js_truthy = colony.js_truthy
local js_arguments = colony.js_arguments
local js_break = colony.js_break
local js_cont = colony.js_cont
local js_seq = colony.js_seq
local js_in = colony.js_in
local js_setter_index = colony.js_setter_index
local js_getter_index = colony.js_getter_index
local js_proto_get = colony.js_proto_get
local js_func_proxy = colony.js_func_proxy

local obj_proto = colony.obj_proto
local num_proto = colony.num_proto
local func_proto = colony.func_proto
local str_proto = colony.str_proto
local arr_proto = colony.arr_proto
local regex_proto = colony.regex_proto

local global = colony.global


--[[
--|| Lua Event Loop
--]]

local _eventQueue = {}

colony.runEventLoop = function ()
  while #_eventQueue > 0 do
    local queue = _eventQueue
    _eventQueue = {}
    for i=1,#queue do
      local val = queue[i]()
      if val ~= 0 then
        table.insert(_eventQueue, queue[i])
      end
    end
  end
end


--[[
--|| Lua Timers
--]]

global.setTimeout = function (this, fn, timeout)
  local start = tm.uptime_micro()
  table.insert(_eventQueue, function ()
    local now = tm.uptime_micro()
    if now - start < (timeout*1000) then
      return 1
    end
    fn()
    return 0
  end)
end

global.setInterval = function (this, fn, timeout)
  local start = tm.uptime_micro()
  table.insert(_eventQueue, function ()
    local now = tm.uptime_micro()
    if now - start < (timeout*1000) then
      return 1
    end
    fn()
    start = tm.uptime_micro() -- fixed time delay *between* calls
    return 1
  end)
end

global.setImmediate = function (this, fn, timeout)
  table.insert(_eventQueue, function ()
    fn()
    return 0
  end)
end


--[[
--|| Buffer
--]]

local buffer_proto = js_obj({
  fill = function (this, value, offset, endoffset)
    local sourceBuffer = getmetatable(this).buffer
    local sourceBufferLength = getmetatable(this).bufferlen
    offset = tonumber(offset)
    endoffset = tonumber(endoffset)
    if not offset or offset > sourceBufferLength then
      offset = 0
    end
    if (not endoffset and endoffset ~= 0) or endoffset > sourceBufferLength then
      endoffset = sourceBufferLength
    end
    tm.buffer_fill(sourceBuffer, tonumber(value), offset, endoffset)
  end,
  copy = function (this, target, targetStart, sourceStart, sourceEnd)
    local sourceBuffer = getmetatable(this).buffer
    local sourceBufferLength = getmetatable(this).bufferlen
    local targetBuffer = getmetatable(target).buffer
    local targetBufferLength = getmetatable(target).bufferlen
    if not sourceBuffer or not targetBuffer then
      error('Buffer::copy requires a buffer source and buffer target')
    end
    targetStart = tonumber(targetStart)
    sourceStart = tonumber(sourceStart)
    sourceEnd = tonumber(sourceEnd)
    if not targetStart or targetStart > targetBufferLength or targetStart < 0 then
      targetStart = 0
    end
    if not sourceStart or sourceStart > sourceBufferLength or sourceStart < 0 then
      sourceStart = 0
    end
    if (not sourceEnd and sourceEnd ~= 0) or sourceEnd > sourceBufferLength or sourceEnd < 0 then
      sourceEnd = sourceBufferLength
    end
    if sourceEnd - sourceStart > targetBufferLength - targetStart then
      sourceEnd = sourceStart + (targetBufferLength - targetStart)
    end
    tm.buffer_copy(sourceBuffer, targetBuffer, targetStart, sourceStart, sourceEnd)
  end,
  toString = function (this)
    local sourceBuffer = getmetatable(this).buffer
    local sourceBufferLength = getmetatable(this).bufferlen
    local out = {'<Buffer'}
    for i=0,math.min(sourceBufferLength, 51)-1 do
      table.insert(out, string.format("%02x", this[i]))
    end
    if sourceBufferLength > 51 then
      table.insert(out, '...')
    end
    return table.concat(out, ' ') + '>'
  end
})

local function Buffer (this, length)
  length = tonumber(length)
  this = {}
  local buf = tm.buffer_create(length)
  setmetatable(this, {
    buffer = buf,
    bufferlen = length,
    getters = {
      length = function ()
        return length
      end
    },
    setters = {},
    values = {},
    __newindex = function (self, key, value)
      local n = tonumber(key)
      if n == key then
        if n < length and n >= 0 then
          tm.buffer_set(buf, n, tonumber(value))
        end
        return
      end

      -- js_setter_index ...
      local mt = getmetatable(self)
      local setter = mt.setters[key]
      if setter then
        return setter(self, value)
      end
      rawset(mt.values, key, value)
    end,
    __index = function (self, key, _self)
      local n = tonumber(key)
      if n == key then
        if n < length and n >= 0 then
          return tm.buffer_get(buf, n)
        end
        return nil
      end

      -- js_getter_index ...
      local mt = getmetatable(_self or self)
      local getter = mt.getters[key]
      if getter then
        return getter(self)
      end
      return mt.values[key] or js_proto_get(self, buffer_proto, key)
    end,
    __tostring = js_tostring,
    proto = buffer_proto
  })
  return this
end

Buffer.byteLength = function (this, msg)
  return type(msg) == 'string' and string.len(msg) or msg.length
end

global.Buffer = Buffer


--[[
--|| process
--]]

global.process = js_obj({
  memoryUsage = function (ths)
    return js_obj({
      heapUsed=collectgarbage('count')*1024
    });
  end,
  platform = "colony",
  versions = js_obj({
    node = "0.10.0"
  }),
  env = js_obj({}),
  stdin = js_obj({
    resume = function () end,
    setEncoding = function () end
  }),
  stdout = js_obj({})
})


--[[
--|| global variables
--]]

global:__defineGetter__('____dirname', function (this)
  return string.gsub(string.sub(debug.getinfo(2).source, 2), "/?[^/]+$", "")
end)

global:__defineGetter__('____filename', function (this)
  return string.sub(debug.getinfo(2).source, 2)
end)


--[[
--|| bindings
--]]

function js_wrap_module (module)
  local m = {}
  setmetatable(m, {
    __index = function (this, key)
      if type(module[key]) == 'function' then
        local fn = function (this, ...)
          return module[key](...)
        end
        this[key] = fn
        return fn
      else
        this[key] = module[key]
        return module[key]
      end
    end
  })
  return m
end

global.process.binding = function (self, key)
  return js_wrap_module(require(key))
end


--[[
--|| resolve and lookup
--]]

-- Returns directory name component of path
-- Copied and adapted from http://dev.alpinelinux.org/alpine/acf/core/acf-core-0.4.20.tar.bz2/acf-core-0.4.20/lib/fs.lua

function fs_readfile (name)
  local prefix = ''
  fd, err = tm.fs_open(prefix..name, tm.RDWR + tm.OPEN_EXISTING)
  assert(fd and err == 0)
  local s = ''
  while true do
    local chunk = tm.fs_read(fd, 1024)
    s = s .. chunk
    if #chunk < 1024 then
      break
    end
  end
  tm.fs_close(fd)
  return s
  -- local fp = assert(io.open(prefix..name))
  -- local s = fp:read("*a")
  -- assert(fp:close())
end

local function fs_exists (path)
  fd, err = tm.fs_open(path, tm.OPEN_EXISTING + tm.RDONLY)
  if fd and err == 0 then
    tm.fs_close(fd)
    return true
  end
  return false
  -- local file = io.open(path)
  -- if file then
  --   return file:close() and true
  -- end
end
 

local LUA_DIRSEP = '/'

-- https://github.com/leafo/lapis/blob/master/lapis/cmd/path.lua
local function path_normalize (path)
  while string.find(path, "%w+/%.%./") or string.find(path, "/%./") do
    path = string.gsub(path, "%w+/%.%./", "/")
    path = string.gsub(path, "/%./", "/")
  end
  return path
end

-- Returns string with any leading directory components removed. If specified, also remove a trailing suffix. 
-- Copied and adapted from http://dev.alpinelinux.org/alpine/acf/core/acf-core-0.4.20.tar.bz2/acf-core-0.4.20/lib/fs.lua
local function path_basename (string_, suffix)
  string_ = string_ or ''
  local basename = string.gsub (string_, '[^'.. LUA_DIRSEP ..']*'.. LUA_DIRSEP ..'', '')
  if suffix then
    basename = string.gsub (basename, suffix, '')
  end
  return basename
end

local function path_dirname (string_)
  string_ = string_ or ''
  -- strip trailing / first
  string_ = string.gsub (string_, LUA_DIRSEP ..'$', '')
  local basename = path_basename(string_)
  string_ = string.sub(string_, 1, #string_ - #basename - 1)
  return(string_)  
end

-- lookup and execution

colony.cache = {}

local function require_resolve (name, root)
  root = root or './'
  -- print('<-', root, name)
  if string.sub(name, -3) == '.js' then
    name = string.sub(name, 1, -4)
  end 

  if string.sub(name, 1, 1) ~= '.' then
    if colony.precache[name] or colony.cache[name] then
      root = ''
    else
      -- TODO climb hierarchy for node_modules
      local fullname = name
      while string.find(name, '/') do
        name = path_dirname(name)
      end
      while not fs_exists(root .. 'node_modules/' .. name) and not fs_exists(root .. 'node_modules/' .. name .. '/package.json') and string.find(path_dirname(root), "/") do
        root = path_dirname(root) .. '/'
      end
      if not root then
        -- no node_modules folder found
        return root .. name, false
      end
      root = root .. 'node_modules/'
      if string.find(fullname, '/') then
        name = fullname
      else
        local pkgjson = root .. name .. '/package.json'
        if not fs_exists(pkgjson) then
          -- no package.json file found
          return root .. name, false
        end
        _, _, label = string.find(fs_readfile(pkgjson), '"main"%s-:%s-"([^"]+)"')
        name = name .. '/' .. (label or 'index.js')
      end
    end
  end
  if root ~= '' and string.sub(name, -3) ~= '.js' then
    name = name .. '.js'
  end
  local p = path_normalize(root .. name)
  p = colony._normalize(p, path_normalize)
  return p, true
end

local function require_load (p)
  -- Load the script.
  local res = nil
  if colony.precache[p] then
    res = colony.precache[p]()
  end
  if not res then
    if fs_exists(p) then
      res = assert(loadstring(colony._load(p), "@"..p))()
    end
  end
  return res
end

colony._normalize = function (p, path_normalize)
  return p
end

colony._load = function (p)
  return fs_readfile(p)
end

colony.run = function (name, root)
  local p, pfound = require_resolve(name, root)

  -- Load the script.
  if colony.cache[p] then
    return colony.cache[p]
  end
  local res = pfound and require_load(p)
  if not pfound or not res then
    error('Could not find module "' .. p .. '"')
  end

  -- Run the script and return its value.
  setfenv(res, colony.global)
  colony.global.require = function (ths, value)
    -- require() is dependent on the script calling it.
    -- TODO: tail-call elimination makes this invalid,
    -- requiring us to eventually remove them.
    local n = 2
    while debug.getinfo(n).namewhat == 'metamethod' do
      n = n + 1
    end
    local scriptpath = string.sub(debug.getinfo(n).source, 2)

    -- Return the new script.
    return colony.run(value, path_dirname(scriptpath) .. '/')
  end
  
  colony.cache[p] = {} --dummy
  colony.cache[p] = res()
  return colony.cache[p]
end

-- node-tm
end
