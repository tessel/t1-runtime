-- Copyright 2014 Technical Machine, Inc. See the COPYRIGHT
-- file at the top-level directory of this distribution.
--
-- Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
-- http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
-- <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
-- option. This file may not be copied, modified, or distributed
-- except according to those terms.
--
-- colony-node.lua
-- Initializes Node-specific global APIs, and the event loop.
--

local bit = require('bit32')
local tm = require('tm')

-- locals

local js_arr = colony.js_arr
local js_obj = colony.js_obj
local js_new = colony.js_new
local js_tostring = colony.js_tostring
local js_instanceof = colony.js_instanceof
local js_void = colony.js_void
local js_pairs = colony.js_pairs
local js_typeof = colony.js_typeof
local js_arguments = colony.js_arguments
local js_break = colony.js_break
local js_cont = colony.js_cont
local js_seq = colony.js_seq
local js_in = colony.js_in
local js_setter_index = colony.js_setter_index
local js_getter_index = colony.js_getter_index
local js_define_getter = colony.js_define_getter
local js_define_setter = colony.js_define_setter
local js_proto_get = colony.js_proto_get

local obj_proto = colony.obj_proto
local num_proto = colony.num_proto
local func_proto = colony.func_proto
local str_proto = colony.str_proto
local arr_proto = colony.arr_proto
local regex_proto = colony.regex_proto
local date_proto = colony.date_proto

local global = colony.global

--[[
--|| Events
--]]

_G._colony_emit = function (type, ...)
  colony.global.process:emit(type, ...)
end

--[[
--|| Exceptions
--]]

_G._colony_unhandled_exception = function (e)
  if e ~= nil and e.stack then
    -- runtime errors
    tm.log(22, e.stack)
  elseif e ~= nil and type(e.toString) == 'function' then
    tm.log(22, e:toString())
  else
    -- internal errors
    tm.log(22, debug.traceback(e, 2))
  end

  global.process:exit(8)
end

--[[
--|| Lua Timers
--]]

function wrap_timer_cb(timerfn, ...)
  -- Swallow errors if non function
  if type(timerfn) ~= 'function' then
    return function () end
  end

  -- If extra args were passed, encapsulate them in a closure
  if select("#", ...) then
    local timerfn_call = timerfn
    local args = table.pack(...)
    timerfn = function()
      timerfn_call(global, unpack(args))
    end
  end
  return timerfn
end

global.setTimeout = function (this, fn, timeout, ...)
  return tm.set_raw_timeout(timeout, false, wrap_timer_cb(fn, ...))
end

global.setInterval = function (this, fn, timeout, ...)
  if timeout < 1 then
    -- Clamp minimum repeat interval, as the C repeat field cannot be 0
    timeout = 1
  end
  return tm.set_raw_timeout(timeout, true, wrap_timer_cb(fn, ...))
end

global.setImmediate = function (this, fn, ...)
  return tm.set_raw_timeout(0, false, wrap_timer_cb(fn, ...))
end

global.clearTimeout = function (this, id)
  tm.clear_raw_timeout(id)
end

global.clearInterval = global.clearTimeout
global.clearImmediate = global.clearTimeout


--[[
--|| Buffer
--]]

--------------BASE64
-- some unoptimized base64 functions
-- Sourced from http://en.wikipedia.org/wiki/Base64
-- https://raw.github.com/toastdriven/lua-base64/master/base64.lua

local index_table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

function to_binary(integer)
    local remaining = tonumber(integer)
    local bin_bits = ''

    for i = 7, 0, -1 do
        local current_power = math.pow(2, i)

        if remaining >= current_power then
            bin_bits = bin_bits .. '1'
            remaining = remaining - current_power
        else
            bin_bits = bin_bits .. '0'
        end
    end

    return bin_bits
end

function from_binary(bin_bits)
    return tonumber(bin_bits, 2)
end

function to_base64(to_encode)
    local bit_pattern = ''
    local encoded = ''
    local trailing = ''

    for i = 1, string.len(to_encode) do
        bit_pattern = bit_pattern .. to_binary(string.byte(string.sub(to_encode, i, i)))
    end

    -- Check the number of bytes. If it's not evenly divisible by three,
    -- zero-pad the ending & append on the correct number of ``=``s.
    if math.mod(string.len(bit_pattern), 3) == 2 then
        trailing = '=='
        bit_pattern = bit_pattern .. '0000000000000000'
    elseif math.mod(string.len(bit_pattern), 3) == 1 then
        trailing = '='
        bit_pattern = bit_pattern .. '00000000'
    end

    for i = 1, string.len(bit_pattern), 6 do
        local byte = string.sub(bit_pattern, i, i+5)
        local offset = tonumber(from_binary(byte))
        encoded = encoded .. string.sub(index_table, offset+1, offset+1)
    end

    return string.sub(encoded, 1, -1 - string.len(trailing)) .. trailing
end

function from_base64(to_decode)
  local padded = string.gsub(to_decode, "%s", "")
  local unpadded = string.gsub(padded, "=", "")
  local bit_pattern = ''
  local decoded = ''

  for i = 1, string.len(unpadded) do
    local char = string.sub(to_decode, i, i)
    local offset, _ = string.find(index_table, char)
    if offset == nil then
      error(js_new(global.Error, "Invalid character '" .. char .. "' found."))
    end

    bit_pattern = bit_pattern .. string.sub(to_binary(offset-1), 3)
  end

  -- trim off unused bits
  bit_pattern = string.sub(bit_pattern, 1, string.len(bit_pattern) - ((string.len(bit_pattern) % (4*8)) - ((string.len(unpadded) % 4) * 8)))

  for i = 1, string.len(bit_pattern), 8 do
    local byte = string.sub(bit_pattern, i, i+7)
    decoded = decoded .. string.char(from_binary(byte))
  end

  return decoded
end
-------------/BASE64

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
    sourceStart = tonumber(sourceStart or 0) or 0

    if len == nil then
      len = this.length
    end
    len = tonumber(len)
    if len < 0 then
      -- Negative indices are allowed
      len = len + this.length
    end
    if len < 0 or len > this.length then
      len = this.length
    end

    local sourceBuffer = getmetatable(this).buffer
    local sourceBufferLength = getmetatable(this).bufferlen
    return _of_buffer({}, tm.buffer_index(sourceBuffer, sourceStart), len - sourceStart)
  end,
  copy = function (this, target, targetStart, sourceStart, sourceEnd)
    local sourceBuffer = getmetatable(this).buffer
    local sourceBufferLength = getmetatable(this).bufferlen
    local targetBuffer = getmetatable(target).buffer
    local targetBufferLength = getmetatable(target).bufferlen
    if not sourceBuffer or not targetBuffer then
      error(js_new(global.TypeError, 'Buffer::copy requires a buffer source and buffer target'))
    end
    targetStart = tonumber(targetStart)
    sourceStart = tonumber(sourceStart)
    sourceEnd = tonumber(sourceEnd)

    -- abort early on 0
    if sourceEnd == 0 then
      return
    end

    if targetStart > targetBufferLength then
      error(js_new(global.RangeError, 'targetStart out of bounds'))
    end

    if not targetStart or targetStart < 0 then
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
  write = function (this, string, offset, length, encoding)
    local buf = js_new(global.Buffer, string)
    length = tonumber(length) or math.min(this.length, buf.length)
    buf:copy(this, offset, 0, length)
    return length
  end,
  toString = function (this, encoding, offset, endOffset)

    local sourceBuffer = getmetatable(this).buffer
    local sourceBufferLength = getmetatable(this).bufferlen;

    if offset == nil or offset < 0 then
      offset = 0
    end

    if endOffset == nil or endOffset > sourceBufferLength then
      endOffset = sourceBufferLength;
    end

    if endOffset < offset then
      return '';
    end

    if encoding == nil then
      encoding = 'utf8'
    end
    encoding = string.lower(encoding);
    
    local buf = tm.buffer_tobytestring(getmetatable(this).buffer, offset, endOffset);

    if encoding == 'binary' then
      return string.gsub(buf, '[\128-\255]', function (c)
        -- original value must be converted to internal encoding
        return global.String.fromCharCode(nil, string.byte(c))
      end)
    elseif encoding == 'ascii' then
      -- simply strips high bit from original value
      return string.gsub(buf, '[\128-\255]', function (c)
        return string.char(string.byte(c) - 128)
      end)
    elseif encoding == 'utf8' or encoding == 'utf-8' then
      return tm.str_from_utf8(buf);
    elseif encoding == 'base64' then
      return to_base64(buf);
    elseif encoding == 'hex' then
      local str = string.gsub(buf, '(.)', function (c)
        return string.format('%02x', string.byte(c));
      end)
      return str;
    elseif  encoding == 'ucs2' or encoding == 'ucs-2' 
      or encoding == 'utf16le' or encoding == 'utf-16le' then
      return error(js_new(global.NotImplementedError, 'Encoding not implemented yet: ' + encoding));
    else
      error(js_new(global.TypeError, 'Unknown encoding: ' + encoding));
    end
  end,
  toJSON = function (this)
    local arr = {}
    local len = this.length
    local lenmax = len - 1
    for i=0,lenmax do
      arr[i] = this[i]
    end
    return js_arr(arr, len)
  end,
  inspect = function (this)
    local sourceBuffer = getmetatable(this).buffer
    local sourceBufferLength = getmetatable(this).bufferlen

    local out = {'<Buffer'}
    local maxbytes = colony.run('buffer').INSPECT_MAX_BYTES    -- HACK: need *module* object
    -- NOTE: we differ from current node.js, see https://github.com/joyent/node/issues/7995
    for i=0,math.min(sourceBufferLength or 0, maxbytes)-1 do
      table.insert(out, string.format("%02x", this[i]))
    end
    if sourceBufferLength > maxbytes then
      table.insert(out, '...')
    end
    return table.concat(out, ' ') + '>'
  end,

  -- Internal use only
  _random = function (this)
    local sourceBuffer = getmetatable(this).buffer
    local sourceBufferLength = getmetatable(this).bufferlen

    return tm.random_bytes(sourceBuffer, 0, tonumber(sourceBufferLength));
  end
})

function read_buf (this, pos, no_assert, size, fn, le)
  local sourceBuffer = getmetatable(this).buffer
  local sourceBufferLength = getmetatable(this).bufferlen
  pos = tonumber(pos)

  if not (pos >= 0 and pos <= sourceBufferLength - size) then
    if not no_assert then
      error(js_new(global.RangeError, 'Trying to access beyond buffer length'))
    end

    if pos >= sourceBufferLength then
      if size == 1 then
        return nil
      else
        return 0
      end
    end
    local tmp = tm.buffer_create(4)
    tm.buffer_fill(tmp, 0, 0, 4)
    tm.buffer_copy(sourceBuffer, tmp, 0, pos, sourceBufferLength)
    return fn(tmp, 0, le)
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

function write_buf (this, value, pos, no_assert, size, fn, le)
  local sourceBuffer = getmetatable(this).buffer
  local sourceBufferLength = getmetatable(this).bufferlen
  pos = tonumber(pos)

  if not (pos >= 0 and pos <= sourceBufferLength - size) then
    if not no_assert then
      error(js_new(global.RangeError, 'Trying to access beyond buffer length'))
    end

    local tmp = tm.buffer_create(4)
    tm.buffer_fill(tmp, 0, 0, 4)
    fn(tmp, 0, value, le)
    tm.buffer_copy(tmp, sourceBuffer, pos, 0, sourceBufferLength - pos)
    return
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


function _of_buffer (this, buf, length)
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

local function Buffer (this, arg, encoding)
  -- args
  local str, length = '', 0
  if type(arg) == 'number' then
    length = tonumber(arg)
  elseif type(arg) == 'string' then
    str = arg
    length = #arg
  else
    str = arg or ''
    length = arg and arg.length or 0
  end

  -- encoding first check
  if type(str) == 'string' and encoding == 'base64' then
    -- "base64" string
    str = from_base64(str)
    length = string.len(str)
  elseif type(str) == 'string' and encoding == 'hex' then
    if string.len(str) % 2 ~= 0 or string.gsub(str, '[a-fA-F0-9]', '') ~= '' then
      error(js_new(global.TypeError, 'Invalid hex string.'))
    end
    str = string.lower(str)
    length = string.len(str) / 2
  end

  this = {}
  local buf = tm.buffer_create(length)
  _of_buffer(this, buf, length)

  -- Lua internally uses a "binary" encoding, that is,
  -- operates on (1-indexable) 8-bit values.

  if type(str) == 'string' and encoding == 'hex' then
    -- "hex" string
    for i = 1, #str, 2 do
      this[(i - 1)/2] = tonumber(string.sub(str, i, i+1), 16)
    end
  elseif type(str) == 'string' then
    -- "binary" string
    for i = 1, #str do
      this[i - 1] = string.byte(str, i)
    end
  else
    -- array
    for i = 1, str.length do
      this[i - 1] = str[i - 1]
    end
  end

  return this
end

Buffer.prototype = buffer_proto

Buffer.isEncoding = function ()
  -- TODO port this properly
  return true
end

Buffer.isBuffer = function (this, arg)
  return js_instanceof(arg, Buffer)
end

Buffer.concat = function (this, args, len)
  -- Proper usage
  if not global.Array.isArray(nil, args) then
    error(js_new(global.TypeError, 'Usage: Buffer.concat(list, [length])'))
  end

  -- For one argument, identity function
  if args.length == 1 then
    return args[0]
  end

  -- If "length" argument isn't supplied, calculate it
  if not len then
    len = 0
    for i=0,args.length-1 do
      len = len + args[i].length
    end
  end

  -- Concatenate buffers.
  local buf = Buffer(nil, len)
  local s = 0
  for i=0,args.length-1 do
    local arg = args[i]
    arg:copy(buf, s, 0, arg.length)
    s = s + args[i].length
  end
  return buf
end

Buffer.byteLength = function (this, msg)
  return type(msg) == 'string' and string.len(msg) or msg.length
end

global.Buffer = Buffer


--[[
--|| EventEmitter
--]]

local EventEmitter = function (this) end

EventEmitter.prototype.listeners = function (this, type)
  if not this._events then
    this._events = js_obj({})
  end
  if not this.hasOwnProperty:call(this._events, type) then
    this._events[type] = js_arr({}, 0)
  end
  return this._events[type]
end

EventEmitter.prototype.addListener = function (this, eventName, f)
  if (type(f) ~= "function") then
    error(js_new(global.TypeError, 'Supplied listener is not a function.'));
  end
  if (f.listener) then
    this:emit("newListener", eventName, f.listener);
  else
    this:emit("newListener", eventName, f);
  end
  if this._maxListeners ~= 0 and this:listeners(eventName):push(f) > (this._maxListeners or 10) then
    global.console:warn("Possible EventEmitter memory leak detected. Added " + this._events[eventName].length + " listeners on " +eventName+". Use emitter.setMaxListeners() to increase limit.")
  end
  return this
end

EventEmitter.prototype.on = EventEmitter.prototype.addListener

EventEmitter.prototype.once = function (this, eventName, f)
  local g = nil
  if (type(f) ~= "function") then
      error(js_new(global.TypeError, 'Supplied listener is not a function.'));
  end
  g = function (this, ...)
    this:removeListener(eventName, g);
    f(this, ...)
  end
  g.listener = f;
  this:on(eventName, g)
end

EventEmitter.prototype.removeListener = function (this, type, f)

  type = tostring(type) or ''
  if not f then
    error(js_new(global.TypeError, 'Supplied listener is not a function.'))
  end

  local i = this:listeners(type):indexOf(f);
  local callback = f;

  if (f.listener) then
    callback = f.listener;
  end

  -- If the listener wasn't found
  if i ~= -1 then
    -- the index is the index of the callback listener
    this:listeners(type):splice(i, 1);
    this:emit("removeListener", type, callback);
  end

  return this
end

EventEmitter.prototype.removeAllListeners = function (this, type)

  -- If no events, just return
  if (not this._events) then
    return;
  end

  -- If no args were passed in, delete all possible listeners
  if (not type or type.length == 0) then
    for k in js_pairs(this._events) do
      if (k ~= "removeListener") then
        this:removeAllListeners(k);
      end
    end
    this:removeAllListeners('removeListener');
    this._events = js_obj({});
    return this;
  else
    -- grab listeners for this event
    local listeners = this:listeners(type);

    -- Remove each of them
    for k in pairs(listeners) do
      if listeners[k] then
        this:removeListener(type, listeners[k]);
      end
    end
    return this;
  end
end

EventEmitter.prototype.emit = function (this, type, ...)
  local count = 0
  if this._events and this._events[type] then
    local fns, listeners = {}, this._events[type]
    for i=0,listeners.length-1 do
      table.insert(fns, listeners[i])
    end
    count = #fns
    for i=1,#fns do
      fns[i](this, ...)
    end
  end
  if type == 'error' and count == 0 then
    local args = table.pack(...)
    if js_instanceof(args[1], global.Error) then
      error(args[1])
    else
      error(js_new(global.TypeError, 'Uncaught, unspecified "error" event.'))
    end
  end
  return count
end

EventEmitter.prototype.setMaxListeners = function (this, maxListeners)
  this._maxListeners = maxListeners;
  return this;
end


EventEmitter.listenerCount = function(this, emitter, event)
  local ret;

  if not emitter._events or not emitter._events[event] then
    ret = 0;

  elseif (type(emitter._events[event]) == "function") then
    ret = 1;

  else
    return emitter._events[event].length;
  end

  return ret;
end


--[[
--|| process
--]]

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


--[[
--|| global variables
--]]

function abssource (ret)
  if string.sub(ret, 1, 2) == './' then
    ret = os.getenv('PWD') + string.sub(ret, 2)
  end
  return ret
end

global:__defineGetter__('____dirname', function (this)
  return abssource(string.gsub(string.sub(debug.getinfo(3).source, 2), "/?[^/]+$", ""))
end)

global:__defineGetter__('____filename', function (this)
  return abssource(string.sub(debug.getinfo(3).source, 2))
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
          local args = table.pack(module[key](...))

          -- single-arg returns, return single arg
          if args.n < 2 then
            return args[1]
          end

          -- multiple arg returns return array to JS
          local len = args.n
          args.n = nil
          args[0] = table.remove(args, 1)
          return js_arr(args, len);
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
    local chunk = tm.fs_read(fd, 16*1024)
    if chunk ~= nil then
      s = s .. tostring(chunk)
    end
    if chunk == nil then
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
    path = string.gsub(path, "/[%w-_]+/%.%./", "/")
    path = string.gsub(path, "[%w-_]+/%.%./", "")
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

local function require_resolve (origname, root)
  root = root or './'
  local name = origname
  if string.sub(name, 1, 1) == '.' then
    if string.sub(name, -3) == '.js' then
      name = string.sub(name, 1, -4)
    elseif string.sub(name, -5) == '.json' then
      name = string.sub(name, 1, -6)
    end
  end

  -- module
  if string.sub(name, 1, 1) ~= '.' then
    if colony.precache[name] or colony.cache[name] then
      root = ''
    else
      -- climb hierarchy for node_modules
      local fullname = name
      while string.find(name, '/') do
        name = path_dirname(name)
      end
      
      -- On PC, we want to support node_modules from any folder. (Crudely.)
      if not COLONY_EMBED and string.sub(root, 1, 1) == '.' then
        root = path_normalize(path_normalize(os.getenv("PWD")) .. '/' .. root)
      end

      while not fs_exists(root .. 'node_modules/' .. name .. '/package.json') do
        local next_root = path_dirname(root) .. '/'
        if next_root == root then
          -- we've searched all the way up through available path
          root = nil
          break
        else
          root = next_root
        end
      end
      if not root then
        -- no node_modules folder found
        return name, false
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

  -- local file
  else
    -- TODO: not do "module/index.js" from "module.js"
    local p = path_normalize(root .. name)
    if not fs_exists(p .. '.js') and not fs_exists(p .. '.js') and fs_exists(p .. '/index.js') then
      name = name .. '/index'
    end
  end
  if root ~= '' and string.sub(name, -3) ~= '.js' then
    local p = path_normalize(root .. name)
    if string.sub(origname, -5) == '.json' or fs_exists(p .. '.json') then
      name = name .. '.json'
    else
      name = name .. '.js'
    end
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
      if string.sub(p, -5) == '.json' then
        local parsed = global.JSON:parse(fs_readfile(p))
        res = function (global, module)
          module.exports = parsed
        end
      else
        res = assert(loadstring(colony._load(p), "@"..p))()
      end
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

  -- If we can't find the file, they may have passed in a folder
  -- eg. lib may need to resolve to lib/index.js, not lib.js
  if not res then
    local extensionIndex = string.find(p, '.js');
    p = string.sub(p, 1, extensionIndex-1) + "/index.js";
    res = require_load(p)
  end
  if not pfound or not res then
    error(js_new(global.Error, 'Could not find module "' .. p .. '"'))
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
  colony.global.require.cache = colony.cache

  colony.cache[p] = js_obj({exports=js_obj({}),parent=parent}) --dummy
  res(colony.global, colony.cache[p])
  return colony.cache[p].exports
end

package.preload.http_parser = function ()
  local http_parser = require('http_parser_lua')

  local mod = js_obj({
    HTTPParser = function (type)
      local obj, parser
      local proxyobj = {
        onHeaderField = function (field)
          if obj.onHeaderField then
            obj.onHeaderField(parser, field, 0, #field)
          end
        end,
        onHeaderValue = function (field)
          if obj.onHeaderValue then
            obj.onHeaderValue(parser, field, 0, #field)
          end
        end,
        onHeadersComplete = function (info)
          if obj.onHeadersComplete then
            obj.onHeadersComplete(parser, js_obj({
              statusCode = info.status_code,
              method = info.method,
              url = info.url,
            }))
          end
        end,
        onMessageComplete = function ()
          if obj.onMessageComplete then
            obj.onMessageComplete(parser)
          end
        end
      }
      if type == 'request' or type == 0 then
        obj = {}
        parser = http_parser.new('request', proxyobj)
      else
        obj = {}
        parser = http_parser.new('response', proxyobj)
      end
      obj.execute = function (this, data, start, len)
        return parser:execute(data:toString(), start, len)
      end
      return obj
    end
  })
  return mod
end
