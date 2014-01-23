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

-- event queue, and temporary (processing) queue
local _eventQueue, queue = {}, {}

_G._colony_ipc = {}

colony.runEventLoop = function ()
  while #_eventQueue > 0 or #_colony_ipc > 0 do
    queue = _eventQueue
    _eventQueue = {}
    for i=1,#queue do
      local val = queue[i]()
      if val ~= 0 then
        -- make sure to reference queue[i] here so 
        -- clear____ can clear from inside callback
        table.insert(_eventQueue, queue[i])
      end
    end

    local ipc = _G._colony_ipc
    _G._colony_ipc = {}
    for i=1,#ipc do
      if ipc[i][1] == 'M' then
        local jsondata = nil
        if pcall(function ()
          jsondata = colony.global.JSON:parse(ipc[i][2])
        end) then
          colony.global.process:emit('message', jsondata);
        end
      end
    end
  end

  colony.global.process:exit(0)
  -- once more for the gipper
  -- TODO actually exit
end


--[[
--|| Lua Timers
--]]

local timeouttable = {}
setmetatable(timeouttable, {
  __mode = "v"
})

global.setTimeout = function (this, fn, timeout)
  timeout = timeout or 0 
  local start = tm.uptime_micro()
  local timefn = function ()
    local now = tm.uptime_micro()
    if now - start < (timeout*1000) then
      return 1
    end
    fn(global)
    return 0
  end
  table.insert(_eventQueue, timefn)
  table.insert(timeouttable, timefn)
  return #timeouttable
end

global.setInterval = function (this, fn, timeout)
  timeout = timeout or 0 
  local start = tm.uptime_micro()
  local timefn = function ()
    local now = tm.uptime_micro()
    if now - start < (timeout*1000) then
      return 1
    end
    fn(global)
    start = tm.uptime_micro() -- fixed time delay *between* calls
    return 1
  end
  table.insert(_eventQueue, timefn)
  table.insert(timeouttable, timefn)
  return #timeouttable
end

global.setImmediate = function (this, fn)
  local timefn = function ()
    fn(global)
    return 0
  end
  table.insert(_eventQueue, timefn)
  table.insert(timeouttable, timefn)
  return #timeouttable
end

global.clearTimeout = function (this, id)
  if timeouttable[id] ~= nil then
    for i=1,#_eventQueue do
      if _eventQueue[i] == timeouttable[id] then
        _eventQueue[i] = function () return 0 end
      end
    end
    for i=1,#queue do
      if queue[i] == timeouttable[id] then
        queue[i] = function () return 0 end
      end
    end
    timeouttable[id] = nil
  end
end

global.clearInterval = global.clearTimeout
global.clearImmediate = global.clearTimeout


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
  slice = function (this, sourceStart, len)
    if len == nil then
      len = this.length - (sourceStart or 0)
    end
    sourceStart = tonumber(sourceStart or 0)
    len = tonumber(len)
    if len < 0 or sourceStart > this.length then
      len = 0
    end

    local target = global:Buffer(len - sourceStart)

    local sourceBuffer = getmetatable(this).buffer
    local sourceBufferLength = getmetatable(this).bufferlen
    local targetBuffer = getmetatable(target).buffer
    local targetBufferLength = getmetatable(target).bufferlen
    tm.buffer_copy(sourceBuffer, targetBuffer, 0, sourceStart, sourceStart + len)
    return target
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
  toString = function (this, strtype)
    local sourceBuffer = getmetatable(this).buffer
    local sourceBufferLength = getmetatable(this).bufferlen

    if type(strtype) == 'string' and string.lower(strtype) == 'utf8' then
      local str = ''
      for i=0,sourceBufferLength-1 do
        str = str .. string.char(this[i])
      end
      return str
    end

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

function read_buf (this, pos, opts, size, fn, le)
  local sourceBuffer = getmetatable(this).buffer
  local sourceBufferLength = getmetatable(this).bufferlen
  pos = tonumber(pos)

  if not (pos >= 0 and pos <= sourceBufferLength - size) then
    if opts and (opts.noAssert or type(opts.assert) == 'boolean' and opts.assert == false) then
      return nil
    end
    error('RangeError: Trying to access beyond buffer length')
  end

  return fn(sourceBuffer, pos, le)
end

buffer_proto.readUInt8 = function (this, pos, opts) return read_buf(this, pos, opts, 1, tm.buffer_read_uint8); end
buffer_proto.readUInt16LE = function (this, pos, opts) return read_buf(this, pos, opts, 2, tm.buffer_read_uint16le); end
buffer_proto.readUInt16BE = function (this, pos, opts) return read_buf(this, pos, opts, 2, tm.buffer_read_uint16be); end
buffer_proto.readUInt32LE = function (this, pos, opts) return read_buf(this, pos, opts, 4, tm.buffer_read_uint32le); end
buffer_proto.readUInt32BE = function (this, pos, opts) return read_buf(this, pos, opts, 4, tm.buffer_read_uint32be); end
buffer_proto.readInt8 = function (this, pos, opts) return read_buf(this, pos, opts, 1, tm.buffer_read_int8); end
buffer_proto.readInt16LE = function (this, pos, opts) return read_buf(this, pos, opts, 2, tm.buffer_read_int16le); end
buffer_proto.readInt16BE = function (this, pos, opts) return read_buf(this, pos, opts, 2, tm.buffer_read_int16be); end
buffer_proto.readInt32LE = function (this, pos, opts) return read_buf(this, pos, opts, 4, tm.buffer_read_int32le); end
buffer_proto.readInt32BE = function (this, pos, opts) return read_buf(this, pos, opts, 4, tm.buffer_read_int32be); end

buffer_proto.readFloatLE = function (this, pos, opts) return read_buf(this, pos, opts, 4, tm.buffer_read_float, 1); end
buffer_proto.readFloatBE = function (this, pos, opts) return read_buf(this, pos, opts, 4, tm.buffer_read_float, 0); end
buffer_proto.readDoubleLE = function (this, pos, opts) return read_buf(this, pos, opts, 8, tm.buffer_read_double, 1); end
buffer_proto.readDoubleBE = function (this, pos, opts) return read_buf(this, pos, opts, 8, tm.buffer_read_double, 0); end

function write_buf (this, value, pos, opts, size, fn, le)
  local sourceBuffer = getmetatable(this).buffer
  local sourceBufferLength = getmetatable(this).bufferlen
  pos = tonumber(pos)

  if not (pos >= 0 and (pos) <= sourceBufferLength - size) then
    if opts and (opts.noAssert or type(opts.assert) == 'boolean' and opts.assert == false) then
      return nil
    end
    error('RangeError: Trying to access beyond buffer length')
  end

  return fn(sourceBuffer, pos, value, le)
end

buffer_proto.writeUInt8 = function (this, value, pos, opts) return write_buf(this, value, pos, opts, 1, tm.buffer_write_uint8); end
buffer_proto.writeUInt16LE = function (this, value, pos, opts) return write_buf(this, value, pos, opts, 2, tm.buffer_write_uint16le); end
buffer_proto.writeUInt16BE = function (this, value, pos, opts) return write_buf(this, value, pos, opts, 2, tm.buffer_write_uint16be); end
buffer_proto.writeUInt32LE = function (this, value, pos, opts) return write_buf(this, value, pos, opts, 4, tm.buffer_write_uint32le); end
buffer_proto.writeUInt32BE = function (this, value, pos, opts) return write_buf(this, value, pos, opts, 4, tm.buffer_write_uint32be); end
buffer_proto.writeInt8 = function (this, value, pos, opts) return write_buf(this, value, pos, opts, 1, tm.buffer_write_int8); end
buffer_proto.writeInt16LE = function (this, value, pos, opts) return write_buf(this, value, pos, opts, 2, tm.buffer_write_int16le); end
buffer_proto.writeInt16BE = function (this, value, pos, opts) return write_buf(this, value, pos, opts, 2, tm.buffer_write_int16be); end
buffer_proto.writeInt32LE = function (this, value, pos, opts) return write_buf(this, value, pos, opts, 4, tm.buffer_write_int32le); end
buffer_proto.writeInt32BE = function (this, value, pos, opts) return write_buf(this, value, pos, opts, 4, tm.buffer_write_int32be); end

buffer_proto.writeFloatLE = function (this, value, pos, opts) return write_buf(this, value, pos, opts, 4, tm.buffer_write_float, 1); end
buffer_proto.writeFloatBE = function (this, value, pos, opts) return write_buf(this, value, pos, opts, 4, tm.buffer_write_float, 0); end
buffer_proto.writeDoubleLE = function (this, value, pos, opts) return write_buf(this, value, pos, opts, 8, tm.buffer_write_double, 1); end
buffer_proto.writeDoubleBE = function (this, value, pos, opts) return write_buf(this, value, pos, opts, 8, tm.buffer_write_double, 0); end

local function Buffer (this, length)
  -- args
  local str = ''
  if type(length) == 'number' then
    length = tonumber(length)
  else
    str = length
    length = str.length
  end

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

  for i = 1, str.length do
    if type(str) == 'string' then
      -- string
      this[i - 1] = string.byte(str, i)
    else
      -- array
      this[i - 1] = str[i - 1]
    end
  end

  return this
end

Buffer.byteLength = function (this, msg)
  return type(msg) == 'string' and string.len(msg) or msg.length
end

global.Buffer = Buffer


--[[
--|| EventEmitter
--]]

local EventEmitter = function (this) end

((EventEmitter).prototype).listeners = (function (this, type)
  if true then return (js_truthy((this).hasOwnProperty:call((this)._events or (function () local _r = js_obj({}); (this)._events = _r; return _r; end)(), type)) and {((this)._events)[type]} or {(function () local _r = js_arr({}); ((this)._events)[type] = _r; return _r; end)()})[1]; end;
end);

((EventEmitter).prototype).on = (function () local _r = (function (this, type, f)
  if js_truthy(((this)._maxListeners ~= (0)) and (this:listeners(type):push(f) > ((this)._maxListeners or (10)))) then
  if console and console:warn(((("Possible EventEmitter memory leak detected. ") + (((this)._events)[type]).length) + (" listeners added. Use emitter.setMaxListeners() to increase limit."))) then end;
  end;
  if this:emit(("newListener"), type, f) then end;
  if true then return this; end;
end); ((EventEmitter).prototype).addListener = _r; return _r; end)();

((EventEmitter).prototype).once = (function (this, type, f)
  local g = g;
  if this:on(type, (function (this, ...)
  local g = debug.getinfo(1, 'f').func;
  local arguments = js_arguments(...);
  if f:call(this, (arguments)[(0)], (arguments)[(1)], (arguments)[(2)]) then end;
  if this:removeListener(type, g)
       then end;
  end)) then end;
end);

((EventEmitter).prototype).removeListener = (function (this, type, f)
  local i = i;
  i = nil;
  if ((function () local _r = this:listeners(type):indexOf(f); i = _r; return _r; end)() ~= (-(1))) and this:listeners(type):splice(i, (1)) then end;
  if true then return this; end;
end);

((EventEmitter).prototype).removeAllListeners = (function (this, type)
  local k = k;
  for k in js_pairs((this)._events) do
  if (not js_truthy(type)) or (type == k) and ((this)._events)[k]:splice((0), (((this)._events)[k]).length) then end;
  end;
  if true then return this; end;
end);

((EventEmitter).prototype).emit = (function (this, type, ...)
  local args, i, fns = args, i, fns;
  fns = this:listeners(type):slice();
  i = 0;
  while (i < (fns).length) do

  if (fns)[i]:call(this, ...) then end;

  (function () local _r = i; i = _r + 1; return _r end)()
  end;
  if true then return (fns).length; end;
end);

((EventEmitter).prototype).setMaxListeners = (function (this, maxListeners)
  (this)._maxListeners = maxListeners;
end);


--[[
--|| process
--]]

global.process = js_new(EventEmitter)
global.process.memoryUsage = function (ths)
  return js_obj({
    heapUsed=collectgarbage('count')*1024
  });
end
global.process.platform = "colony"
global.process.versions = js_obj({
  node = "0.10.0",
  colony = "0.10.0",
  tessel_board = _G._tessel_version or -1
})
global.process.EventEmitter = EventEmitter
global.process.argv = js_arr({})
global.process.env = js_obj({})
global.process.stdin = js_obj({
  resume = function () end,
  setEncoding = function () end
})
global.process.stdout = js_obj({})
global.process.exit = function (this, code)
  if not global.process._exited then
    global.process._exited = true
    global.process:emit('exit', code)
  end

  local exitfn = _G._exit or os.exit
  exitfn(tonumber(code))
end


--[[
--|| global variables
--]]

global:__defineGetter__('____dirname', function (this)
  return string.gsub(string.sub(debug.getinfo(3).source, 2), "/?[^/]+$", "")
end)

global:__defineGetter__('____filename', function (this)
  return string.sub(debug.getinfo(3).source, 2)
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
  if key == 'lua' then
    return js_wrap_module(_G)
  end
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
    if chunk ~= nil then
      s = s .. chunk
    end
    if chunk == nil or #chunk < 1024 then
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
  else
    -- todo not do "module/index.js" from "module.js"
    local p = path_normalize(root .. name)
    if not fs_exists(p .. '.js') and fs_exists(p .. '/index.js') then
      name = name .. '/index'
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
  return string.gsub(p, "//", "/")
end

colony._load = function (p)
  return fs_readfile(p)
end

colony.run = function (name, root, parent)
  local p, pfound = require_resolve(name, root)

  -- Load the script.
  if colony.cache[p] then
    return colony.cache[p].exports
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
    return colony.run(value, path_dirname(scriptpath) .. '/', colony.cache[scriptpath])
  end
  
  colony.cache[p] = js_obj({exports=js_obj({}),parent=parent}) --dummy
  res(colony.global, colony.cache[p])
  return colony.cache[p].exports
end

-- node-tm
end
