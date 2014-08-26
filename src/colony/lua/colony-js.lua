-- Copyright 2014 Technical Machine, Inc. See the COPYRIGHT
-- file at the top-level directory of this distribution.
--
-- Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
-- http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
-- <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
-- option. This file may not be copied, modified, or distributed
-- except according to those terms.

--
-- colony-js.lua
-- Initializes JavaScript's globals and API for built-in types.
--

local bit = require('bit32')
local yajl = require('yajl')
local _, hs = pcall(require, 'hsregex')
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
local js_func_proxy = colony.js_func_proxy
local js_with = colony.js_with

local obj_proto = colony.obj_proto
local bool_proto = colony.bool_proto
local num_proto = colony.num_proto
local func_proto = colony.func_proto
local str_proto = colony.str_proto
local arr_proto = colony.arr_proto
local regex_proto = colony.regex_proto
local date_proto = colony.date_proto

-- Shorthand for helper functions in compiled code.

global = js_obj({})

global._obj = js_obj
global._arr = js_arr
global._void = js_void
global._null = js_null
global._void = js_void
global._pairs = js_pairs
global._typeof = js_typeof
global._instanceof = js_instanceof
global._new = js_new
--TODO remove this _truthy function
global._truthy = function (arg) return not (not arg); end
global._arguments = js_arguments
global._seq = js_seq
global._in = js_in
global._break = js_break
global._cont = js_cont
global._with = js_with
global._G = {}

-- Hack for exposed _G object until it can be removed.
setmetatable(global._G, {
  __index = function (this, key)
    if type(_G[key]) ~= 'userdata' then
      return _G[key]
    end
    return nil
  end,
  __newindex = function (this, key, value)
    _G[key] = value
  end
})

-- in-code modules

global._debug = debug
global._xpcall = xpcall
global._error = error
global._bit = bit

-- global globals

global.this = global
global.global = global
global._global = global

--[[
Standard Library
]]--

-- number prototype

num_proto.toString = function (this, radix)
  if radix == nil then
    radix = 10
  end
  if not (type(radix) == 'number' and radix >= 2 and radix <= 36) then
    error(js_new(global.RangeError, 'toString() radix argument must be between 2 and 36'))
  end
  return tm.itoa(this, radix)
end

num_proto.toFixed = function (num, n)
  return string.format("%." .. tonumber(n) .. "f", num)
end

-- string prototype

str_proto.charCodeAt = function (str, i, a)
  return string.byte(str, i+1)
end

str_proto.charAt = function (str, i)
  return string.sub(str, i+1, i+1)
end

str_proto.substr = function (str, i, len)
  if i < 0 then
    i = i - 1
  end
  if len ~= nil then
    return string.sub(str, i+1, i + len)
  else
    return string.sub(str, i+1)
  end
end

str_proto.substring = function (str, i, j)
  if i < 0 then
    i = i - 1
  end
  if j < 0 then
    j = j - 1
  end
  if j ~= nil then
    return string.sub(str, i+1, j)
  else
    return string.sub(str, i+1)
  end
end

str_proto.slice = function (str, i, len)
  len = tonumber(len)
  if len < 0 then
    len = str.length + len
  end
  if len < 0 then
    len = 0
  end
  return string.sub(str, i+1, len)
end

str_proto.toLowerCase = function (str)
  return string.lower(str)
end

str_proto.toUpperCase = function (str)
  return string.upper(str)
end

str_proto.indexOf = function (str, needle, fromIndex)

  if needle == '' then
    if fromIndex < str.length then return fromIndex; else return str.length; end
  end

  if fromIndex == nil or fromIndex < 0 then
    fromIndex = 1
  elseif fromIndex > str.length then return -1;
  end

  local ret = string.find(str, tostring(needle), fromIndex, true)
  if ret == null then return -1; else return ret - 1; end
end

str_proto.lastIndexOf = function (str, needle, fromIndex)
  local len = string.len(str)

  if fromIndex ~= nil then
    if fromIndex < 0 or fromIndex >= len then return -1; end
    fromIndex = -fromIndex - 1
  else
    fromIndex = 1
  end

  local ret = string.find(string.reverse(str), tostring(needle), fromIndex, true)

  if ret == null then return -1; else return len - ret; end
end

str_proto.toString = function (this)
  -- not called as __tostring metatable to prevent recursion
  if type(this) == 'string' then
    return tostring(this)
  else
    return '[object Object]'
  end
end

str_proto.trim = function (s)
  return string.match(s, '^()%s*$') and '' or string.match(s, '^%s*(.*%S)')
end

local str_regex_replace, str_regex_split = nil, nil

str_proto.split = function (str, sep, max)
  if sep == '' then
    local ret, len = {}, str.length-1
    for i = 0, len do
      ret[i] = str:charAt(i)
    end
    return js_arr(ret, len + 1)
  end

  local ret = {}

  local i = 0
  if str_regex_split and js_instanceof(sep, global.RegExp) then
    return str_regex_split(str, sep, max)
  elseif type(sep) == 'string' and string.len(str) > 0 then
    max = max or -1

    local start=1
    local first, last = string.find(str, sep, start, true)
    while first and max ~= 0 do
      ret[i] = string.sub(str, start, first-1)
      i, start = i+1, last+1
      first, last = string.find(str, sep, start, true)
      max = max-1
    end
    ret[i] = string.sub(str, start)
    i = i + 1
  end
  return js_arr(ret, i)
end

str_proto.replace = function (this, match, out)
  if type(match) == 'string' then
    return string.gsub(this, string.gsub(match, "(%W)","%%%1"), out)
  elseif str_regex_replace and js_instanceof(match, global.RegExp) then
    return str_regex_replace(this, match, out)
  else
    error(js_new(global.TypeError, 'Unknown regex invocation object: ' .. type(match)))
  end
end

str_proto.concat = function (this, ...)
  local args1 = table.pack(...)
  local ret = tostring(this)
  for i=1,args1.length do
    ret = ret .. args1[i]
  end
  return ret
end

-- object prototype

-- https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring
obj_proto.toString = function (this)
  if this == nil then
    return '[object Undefined]'
  -- TODO null
  elseif getmetatable(this) and getmetatable(this).proto == arr_proto then
    return '[object Array]'
  elseif type(this) == 'string' then
    return '[object String]'
  elseif getmetatable(this) and getmetatable(this).arguments then
    return '[object Arguments]'
  elseif type(this) == 'function' then
    return '[object Function]'

  elseif getmetatable(this) and getmetatable(this).error_stack ~= nil then
    return '[object Error]'
  elseif type(this) == 'boolean' then
    return '[object Boolean]'
    elseif type(this) == 'number' then
    return '[object Number]'
  -- TODO date_proto
  elseif getmetatable(this) and getmetatable(this).proto == date_proto then
    return '[object Date]'
  elseif getmetatable(this) and getmetatable(this).cre then
    return '[object RegExp]'
  else
    return '[object Object]'
  end
end

obj_proto.valueOf = function (this)
  return this.__primitive
end

obj_proto.hasInstance = function (ths, p)
  return toboolean(rawget(ths, p))
end

obj_proto.hasOwnProperty = function (ths, p)
  if type(ths) == 'string' then
    return p == 'length'
  end

  if type(ths) == 'number' then
    return false
  end

  if type(ths) == 'boolean' then
    return false
  end

  if type(ths) == 'function' then
    ths = js_func_proxy(ths)
  end

  if getmetatable(ths) and getmetatable(ths).buffer then
    -- TODO remove this buffer exception
    return ths[p] ~= nil
  else
    return rawget(ths, p) ~= nil
  end
end

obj_proto.__defineGetter__ = js_define_getter
obj_proto.__defineSetter__ = js_define_setter

-- function prototype

js_define_getter(func_proto, 'length', function (this)
  return debug.getinfo(this, 'u').nparams - 1
end)

func_proto.call = function (func, ths, ...)
  return func(ths, ...)
end

function augmentargs (t1, offn, t2)
  for i=1,t2.length do
    t1[offn+i] = t2[i]
  end
  return t1
end

func_proto.bind = function (func, ths1, ...)
  local args1 = table.pack(...)
  return function (ths2, ...)
    local argset, args2 = {}, table.pack(...)
    augmentargs(argset, 0, args1)
    augmentargs(argset, args1.length, args2)
    return func(ths1, unpack(argset, 1, args1.length + args2.length))
  end
end

func_proto.apply = function (func, this, args)
  -- copy args to new args array
  local luargs = {}
  if args then
    for i=0,(args.length or 0)-1 do luargs[i+1] = args[i] end
  end
  return func(this, unpack(luargs, 1, args and args.length or 0))
end

func_proto.toString = function (this)
  return 'function ' .. (this.name or '') .. '() { }'
end

-- array prototype

arr_proto.toString = function (this)
  return arr_proto.join(this, ',')
end

arr_proto.push = function (this, ...)
  local args = table.pack(...)
  local len = tonumber(rawget(this, 'length'))
  for i=1,args.length do
    rawset(this, len, args[i])
    len = len + 1
  end
  rawset(this, 'length', len)
  return len
end

arr_proto.pop = function (this)
  local length = tonumber(rawget(this, 'length'))
  if length == 0 then
    return nil
  end
  local _val = rawget(this, length - 1)
  rawset(this, 'length', length - 1)
  return _val
end

arr_proto.shift = function (this)
  local len = tonumber(rawget(this, 'length'))
  local ret = rawget(this, 0)
  if len > 0 then
    rawset(this, 0, table.remove(this, 1) or nil)
    rawset(this, 'length', len - 1)
  end
  return ret
end

arr_proto.unshift = function (this, elem)
  local len = rawget(this, 'length')
  table.insert(this, 1, rawget(this, 0))
  rawset(this, 0, elem)
  rawset(this, 'length', len + 1)
  return len + 1
end

arr_proto.splice = function (this, i, del, ...)
  local del_len = (tonumber(del) or 0)
  local original_len = tonumber(rawget(this, 'length'))
  local ret = {}
  for j=1,del_len do
    ret[j-1] = rawget(this, i)
    if i == 0 then
      rawset(this, 0, rawget(this, i))
    end
    if i == 0 then
      arr_proto.shift(this)
    else
      table.remove(this, i)
    end
  end

  local args = table.pack(...)
  for j=1,args.length do
    if i == 0 then
      arr_proto.unshift(this, args[j])
    else
      table.insert(this, i, args[j])
    end
    i = i + 1
  end
  rawset(this, 'length', original_len - del_len + args.length)
  return js_arr(ret, del_len)
end

arr_proto.reverse = function (this)
  local n = this.length
  for i=0,math.floor(n/2)-1 do
    local tmp = this[i]
    this[i] = this[n - 1 - i]
    this[n - 1 - i] = tmp
  end
  return this
end

arr_proto.slice = function (this, start, len)
  local a = {}
  if not this then
    return js_arr(a, 0)
  end
  if len == nil then
    len = this.length or 0
  end
  local j = 0
  for i=start or 0,len-1 do
    a[j] = this[i]
    j = j + 1
  end
  return js_arr(a, j)
end

arr_proto.concat = function (this, ...)
  local arr = js_arr({}, 0)
  for i=0,(this.length or 0)-1 do
    arr:push(this[i])
  end
  local args1 = table.pack(...)
  for i=1,args1.length do
    if global.Array:isArray(args1[i]) then
      for j=0,(args1[i].length or 0)-1 do
        arr:push(args1[i][j])
      end
    else
      arr:push(args1[i])
    end
  end
  return arr
end

arr_proto.sort = function (this, fn)
  local len = this.length
  table.insert(this, 1, this[0])
  rawset(this, 0, nil)
  table.sort(this, function (a, b)
    if not b then
      return 0
    end
    local ret
    if not fn then
      ret = a < b
    else
      ret = fn(this, a, b)
    end
    return ret
  end)
  local zero = rawget(this, 1)
  table.remove(this, 1)
  rawset(this, 0, zero)
  rawset(this, 'length', len)
  return this
end

arr_proto.join = function (this, ...)
  local args = table.pack(...)
  local str = ','
  if args.length >= 1 then
    if args[1] == nil then
      str = 'null'
    else
      str = tostring(args[1])
    end
  end

  local _r = ''
  for i=0,this.length-1 do
    if this[i] == nil or this[i] == _null then
      _r = _r .. str
    else
      _r = _r .. tostring(this[i]) .. str
      end
  end
  return string.sub(_r, 1, string.len(_r) - string.len(str))
end

arr_proto.indexOf = function (this, searchElement, fromIndex)
  local len = this.length
  local start

  if len == 0 then
    return -1
  end

  if fromIndex ~= nil then
    fromIndex = tonumber(fromIndex)
  else
    fromIndex = 0
  end

  if fromIndex >= len then
    return -1
  end

  if fromIndex >= 0 then
    start = fromIndex
  else
    start = len + fromIndex

    if start < 0 then
      start = 0
    end
  end

  for i=start, len - 1 do
    if this[i] == searchElement then
      return i
    end
  end

  return -1
end

arr_proto.map = function (this, fn, ...)
  local a = js_arr({}, 0)
  local args = table.pack(...)
  -- t _should_ be set to undefined, per spec.
  -- Since there is no notion of strict mode,
  -- setting to global has the same observable semantics.
  local t = global

  if args.length > 0 then
    t = args[1]
  end

  for i=0,this.length-1 do
    a:push(fn(t, this[i], i, this))
  end
  return a
end

arr_proto.filter = function (this, fn, ...)
  local a = js_arr({}, 0)
  local args = table.pack(...)
  -- t _should_ be set to undefined, per spec.
  -- Since there is no notion of strict mode,
  -- setting to global has the same observable semantics.
  local t = global

  if args.length > 0 then
    t = args[1]
  end

  for i=0,this.length-1 do
    if fn(t, this[i], i, this) then
      a:push(this[i])
    end
  end
  return a
end

arr_proto.reduce = function (this, callback, ...)
  if this == nil then
    error(js_new(global.TypeError, 'Array.prototype.reduce called on null or undefined'))
  end
  if type(callback) ~= 'function' then
    error(js_new(global.TypeError, callback + ' is not a function'))
  end
  local index = 0
  local value = nil
  local length = math.floor(this.length)
  local isValueSet = false

  local args = table.pack(...)
  if args.length > 0 then
    value = args[1]
    isValueSet = true
  end

  while length > index do
    if this:hasOwnProperty(index) then
      if isValueSet then
        value = callback(global, value, this[index], index, this)
      else
        value = this[index]
        isValueSet = true
      end
    end
    index = index + 1
  end
  if not isValueSet then
    error(js_new(global.TypeError, 'Reduce of empty array with no initial value'))
  end
  return value
end

-- http://es5.github.io/#x15.4.4.18
arr_proto.forEach = function (this, fn, ...)
  if this == nil then
    error(js_new(global.TypeError, "Array.prototype.forEach called on null or undefined"))
  end

  local args = table.pack(...)
  -- t _should_ be set to undefined, per spec.
  -- Since there is no notion of strict mode,
  -- setting to global has the same observable semantics.
  local t = global

  if args.length > 0 then
    t = args[1]
  end

  local len = this.length-1
  if type(this) == 'table' then
    for i=0, len do
      local value = rawget(this, i)
      if value == nil then
        value = this[i] -- getters
      end
      -- TODO: existence check for sparse arrays
      -- if value ~= nil then
        fn(t, value, i, this)
      -- end
    end
  else
    for i=0, len do
      fn(t, this[i], i, this)
    end
  end
end

arr_proto.some = function (this, fn, ...)
  local args = table.pack(...)
  -- t _should_ be set to undefined, per spec.
  -- Since there is no notion of strict mode,
  -- setting to global has the same observable semantics.
  local t = global

  if args.length > 0 then
    t = args[1]
  end

  for i=0,this.length-1 do
    if fn(t, this[i], i, this) then
      return true
    end
  end
  return false
end

arr_proto.every = function (this, callbackfn, ...)
  if this == nil then
    error(js_new(global.TypeError, 'Array.prototype.every called on null or undefined'))
  end
  if type(callbackfn) ~= 'function' then
    error(js_new(global.TypeError, callbackfn + ' is not a function'))
  end

  local args = table.pack(...)
  local index = 0
  local len = this.length
  -- t _should_ be set to undefined, per spec.
  -- Since there is no notion of strict mode,
  -- setting to global has the same observable semantics.
  local t = global

  if args.length > 0 then
    t = args[1]
  end

  while index < len do
    if this:hasOwnProperty(index) then
      if not callbackfn(t, this[index], index, this) then
        return false
      end
    end
    index = index + 1
  end
  return true
end

arr_proto.filter = function (this, fn, ...)
  local a = js_arr({}, 0)
  local args = table.pack(...)
  -- t _should_ be set to undefined, per spec.
  -- Since there is no notion of strict mode,
  -- setting to global has the same observable semantics.
  local t = global

  if args.length > 0 then
    t = args[1]
  end

  for i=0,this.length-1 do
    if fn(t, this[i], i, this) then
      a:push(this[i])
    end
  end
  return a
end

--[[
Globals
]]--

-- Boolean

global.Boolean = function (ths, n)
  if type(n) == 'boolean' then
    ths.__primitive = n;
  end
  return not not n
end
global.Boolean.prototype = bool_proto
bool_proto.constructor = global.Boolean

-- toString

-- Number

global.NaN = 0/0

 -- How do you know when a 'new' function is called?
global.Number = function (ths, n)
  -- Wrap the number up in an object
  if type(n) == 'number' then
    ths.__primitive = n;
  end
  return tonumbervalue(n)
end

global.Number.prototype = num_proto
num_proto.constructor = global.Number

global.Number.isFinite = function(this, arg)
  if type(arg) == 'number' then
    return arg ~= math.huge and arg ~= -math.huge and not global.isNaN(this, arg)
  else
    return false
  end
end

global.Number.isNaN = function (this, arg)
  if type(arg) == 'number' then
    return global.isNaN(this, arg)
  else
    return false
  end
end

global.Number.isSafeInteger = function (this, arg)
  if type(arg) == 'number' then
    if global.Number.isFinite(this, arg) then
      if math.floor(arg) == arg then
        return math.abs(arg) <= 9007199254740991
      else
        return false
      end
    else
      return false
    end
  else
    return false
  end
end

global.Number.parseInt = function (this, str, radix)
  return global.parseInt(this, str, radix)
end

global.Number.parseFloat = function (this, str)
  return global.parseFloat(this, str)
end

-- Object

global.Object = function (this, obj)
  return obj or js_obj({})
end
global.Object.prototype = obj_proto
obj_proto.constructor = global.Object

global.Object.create = function (this, proto, props)
  local o = {}
  local mt = {}
  setmetatable(o, mt)
  if proto then
    mt.__index = function (self, key)
      return js_proto_get(self, proto, key)
    end
    mt.proto = proto
  end
  if props then
    global.Object:defineProperties(o, props)
  end
  return o
end

global.Object.defineProperty = function (this, obj, prop, config)
  if type(obj) == 'function' then
    obj = js_func_proxy(obj)
  end
  if type(obj) ~= 'table' then
    error(js_new(global.TypeError, 'Object.defineProperty called on non-object'))
  end
  if config.value ~= nil then
    rawset(obj, prop, config.value)
  end
  if config.get then
    js_define_getter(obj, prop, config.get)
  end
  if config.set then
    js_define_setter(obj, prop, config.set)
  end
  -- todo configurable, writable, enumerable
  return obj
end

global.Object.defineProperties = function (this, obj, props)
  if props then
    for k, v in pairs(props) do
      global.Object:defineProperty(obj, k, v)
    end
  end
  return obj
end

global.Object.freeze = function (this, obj)
  return obj
end

-- http://es5.github.io/#x15.2.3.14
global.Object.keys = function (this, obj)
  local a = {}

  -- Use function proxy for object variables.
  if type(obj) == 'function' then
    obj = js_func_proxy(obj)
  end

  if type(obj) ~= 'table' then
    error(js_new(global.TypeError, 'Object.keys called on non-object'))
  end

  -- Iterate objects using internal representation (in js_pairs).
  local i = 0
  for k,v in js_pairs(obj) do
    a[i] = tostring(k) or ''
    i = i + 1
  end
  return js_arr(a, i)
end

global.Object.getPrototypeOf = function (this, obj)
  local mt = getmetatable(obj)
  if mt then
    return mt.proto
  end
  return nil
end

global.Object.getOwnPropertyNames = function (this, obj)
  local a = js_arr({}, 0)
  -- TODO debug this one:
  if type(obj) == 'function' then
    obj = js_func_proxy(obj)
  end
  for k,v in js_pairs(obj) do
    a:push(k)
  end
  local mt = getmetatable(obj)
  if mt and mt.getters then
    for k,v in pairs(mt.getters) do
      a:push(k)
    end
  end
  if mt and mt.setters then
    for k,v in pairs(mt.setters) do
      a:push(k)
    end
  end
  return a
end

global.Object.getOwnPropertyDescriptor = function (this, obj, key)
  local mt = getmetatable(obj)
  if mt then
    return js_obj({
      value = rawget(obj, key),
      get = mt and mt.getters and mt.getters[key],
      set = mt and mt.setters and mt.setters[key],
      writable = true,
      configurable = true,
      enumerable = true
    })
  end
end

-- Function

global.Function = function (this, arg)
  if arg then
    error(js_new(global.Error, 'Function() constructor not supported'))
  end
  return function () end
end

global.Function.prototype = func_proto
func_proto.constructor = global.Function

-- Array

global.Array = function (ths, ...)
  local a = table.pack(...)
  local len = a.length
  a.length = nil
  if len == 1 and type(a[1]) == 'number' then
    local len = tonumber(a[1])
    return js_arr({}, len)
  elseif len > 0 then
    a[0] = a[1]
    table.remove(a, 1)
    return js_arr(a, len)
  end
  return js_arr({}, 0)
end

global.Array.prototype = arr_proto
arr_proto.constructor = global.Array

global.Array.isArray = function (ths, a)
  return (getmetatable(a) or {}).proto == arr_proto
end

-- String

global.String = function (ths, str)
  if type(str) == 'table' and type(str.toString) == 'function' then
    return str:toString()
  end
  if type(str) == 'string' then
    ths.__primitive = str;
  end
  return tostring(str)
end
global.String.prototype = str_proto
str_proto.constructor = global.String
global.String.fromCharCode = function (this, ...)
  -- http://es5.github.io/x15.5.html#x15.5.3.2
  local args = table.pack(...)
  local str = ''
  for i=1,args.length do
    local uint16 = math.floor(math.abs(tonumbervalue(args[i]))) % (2^16)
    str = str .. string.char(uint16)
  end
  return str
end

-- Math


local luafunctor = function (f)
  if not f then
    error('Lua function is nil', 2)
  end
  return (function (this, ...) return f(...) end)
end

global.Math = js_obj({
  abs = luafunctor(math.abs),
  acos = luafunctor(math.acos),
  acosh = function (this, x)
    -- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/acosh
    x = tonumber(x) or 0
    return math.log(x + math.sqrt((x * x) - 1))
  end,
  asin = luafunctor(math.asin),
  asinh = function (this, x)
    -- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/asinh
    x = tonumber(x) or 0
    return math.log(x + math.sqrt((x * x) + 1))
  end,
  atan = luafunctor(math.atan),
  atanh = function (this, x)
    -- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atanh
    x = tonumber(x) or 0
    return math.log((1+x)/(1-x)) / 2
  end,
  atan2 = luafunctor(math.atan2),
  cbrt = function (this, x)
    -- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/cbrt
    x = tonumber(x) or 0
    local y = math.pow(math.abs(x), 1/3)
    if x < 0 then
      return -y
    else
      return y
    end
  end,
  ceil = luafunctor(math.ceil),
  clz32 = function (this, x)
    -- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32
    x = tonumber(x) or 0
    local value = bit.tobit(math.floor(x))
    if value then
      return 32 - #(tm.itoa(value, 2) or '')
    else
      return 32
    end
  end,
  cos = luafunctor(math.cos),
  cosh = luafunctor(math.cosh),
  exp = luafunctor(math.exp),
  expm1 = function (this, x)
    -- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/expm1
    return math.exp(x) - 1
  end,
  floor = luafunctor(math.floor),
  fround = function (this, x)
    local n = tonumber(x)
    if n ~= n or type(n) ~= 'number' then
      return (0/0) -- NaN
    end

    -- convert to single-precision float
    local b = global.Buffer(nil, 4)
    b:writeFloatLE(n, 0)
    return b:readFloatLE(0)
  end,
  hypot = function (this, ...)
    -- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/hypot
    local y, args = 0, table.pack(...)
    for i=1,args.length do
      local arg = tonumber(args[i])
      if type(arg) ~= 'number' then
        return 0/0 -- NaN
      end
      y = y + (arg * arg)
    end
    return math.sqrt(y)
  end,
  imul = function (this, a, b)
    local function signify (value)
      if bit.band(value, 0x80000000) then
        return -(bit.bnot(value) + 1)
      end
      return bit.tobit(value)
    end

    -- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul
    local ah  = bit.band(bit.rshift(a, 16), 0xffff);
    local al = bit.band(a, 0xffff);
    local bh  = bit.band(bit.rshift(b, 16), 0xffff);
    local bl = bit.band(b, 0xffff);
    return signify((al * bl) + signify(bit.lshift(((ah * bl) + (al * bh)), 16)));
  end,
  log = luafunctor(math.log),
  log1p = function (this, x)
    -- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/log1p
    x = tonumber(x) or 0
    return math.log(1 + x)
  end,
  log10 = luafunctor(math.log10),
  log2 = function (this, x)
    return math.log(x) / math.log(2)
  end,
  max = luafunctor(math.max),
  min = luafunctor(math.min),
  pow = luafunctor(math.pow),
  random = function ()
    -- lua's math.random can take additional arguments
    return math.random()
  end,
  round = function (this, x)
    local i, d = math.modf(x)
    if d >= .5 then
      i = i + 1
    elseif d < -.5 then
      i = i - 1
    end
    return i
  end,
  sign = function (this, x)
    -- http://tc39wiki.calculist.org/es6/math/
    local n = tonumber(x)
    if n ~= n or type(n) ~= 'number' then
      return (0/0) -- NaN
    end

    if n == 0 then
      return n -- Keep the sign of the zero.
    end

    if n < 0 then
      return -1
    else
      return 1
    end
  end,
  sin = luafunctor(math.sin),
  sqrt = luafunctor(math.sqrt),
  tan = luafunctor(math.tan),
  tanh = function (this, x)
    -- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/tanh
    if x == math.huge then
      return 1
    end
    x = tonumber(x) or 0
    local y = math.exp(2 * x)
    return (y - 1) / (y + 1)
  end,
  trunc = function (this, x)
    -- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc
    x = tonumber(x)
    if x ~= x or type(x) ~= 'number' then
      return (0/0) -- NaN
    end

    if x < 0 then
      x = math.ceil(x)
    else
      x = math.floor(x)
    end
    return x
  end,

  E = math.exp(1),
  LN2 = math.log(2),
  LN10 = math.log(10),
  LOG2E = 1/math.log(2),
  LOG10E = math.log10(math.exp(1)),
  PI = math.pi,
  SQRT1_2 = math.sqrt(1/2),
  SQRT2 = math.sqrt(2),
})

-- Error

local function error_constructor (this, str)
  local stack = tostring(debug.traceback())
  if not global.process.debug then
    stack = string.gsub(stack, "\t%[[TC]%].-\n", '')
  end

  getmetatable(this).__tostring = function (this)
    return this.message
  end
  getmetatable(this).error_stack = stack

  this.name = 'Error'
  this.type = 'Error'
  this.message = str
  this.stack = stack
end

error_constructor.prototype.captureStackTrace = function ()
  return {}
end

error_constructor.prototype.toString = function (this)
  if not this then
    return '(undefined)'
  end
  return this.name .. ": " .. this.message
end

local function error_class (name)
  local constructor
  constructor = function (this, str)
    if not js_instanceof(this, constructor) then
      return js_new(constructor, str)
    end

    error_constructor(this, str)
    this.name = name
    this.type = name
  end
  constructor.name = name

  constructor.prototype = error_constructor.prototype
  return constructor
end

global.Error = error_class('Error')
global.EvalError = error_class('EvalError')
global.RangeError = error_class('RangeError')
global.ReferenceError = error_class('ReferenceError')
global.SyntaxError = error_class('SyntaxError')
global.TypeError = error_class('TypeError')
global.URIError = error_class('URIError')

-- Console

local function objtostring (obj, sset)
  -- Special function for buffers
  if getmetatable(obj) and getmetatable(obj).buffer then
    local sourceBuffer = getmetatable(obj).buffer
    local sourceBufferLength = getmetatable(obj).bufferlen

    if type(strtype) == 'string' and string.lower(strtype) == 'utf8' then
      local str = ''
      for i=0,sourceBufferLength-1 do
        str = str .. string.char(obj[i])
      end
      return str
    end

    local out = {'<Buffer'}
    for i=0,math.min(sourceBufferLength or 0, 51)-1 do
      table.insert(out, string.format("%02x", obj[i]))
    end
    if sourceBufferLength > 51 then
      table.insert(out, '...')
    end
    return table.concat(out, ' ') + '>'
  end

  if getmetatable(obj) and getmetatable(obj).date then
    return obj:toString()
  end

  local vals = {}
  rawset(sset, obj, true)
  for k in js_pairs(obj) do
    local v = obj[k]
    if rawget(sset, v) ~= true then
      if type(v) == 'table' then
        rawset(sset, v, true)
      end
      if type(v) == 'string' then
        v = '\'' + v + '\''
      elseif type(v) == 'table' then
        v = objtostring(v, sset)
      elseif type(v) == 'function' then
        v = '[Function]'
      elseif global.Array:isArray(obj) and v == nil then
        v = ''
      else
        v = tostring(v)
      end
    else
      v = '[Circular]'
    end
    if global.Array:isArray(obj) then
      table.insert(vals, v)
    else
      table.insert(vals, k + ": " + v)
    end
  end
  if global.Array:isArray(obj) then
    if #vals == 0 then
      return "[]"
    end
    -- table.insert(vals, 1, table.remove(vals))
    return "[ " + table.concat(vals, ", ") + " ]"
  else
    if #vals == 0 then
      return "{}"
    end
    return "{ " + table.concat(vals, ", ") + " }"
  end
end

local function logger (level, ...)
  local parts = {}
  for i=1,select('#',...) do
    local x = select(i,...)
    if js_typeof(x) == 'object' and x ~= nil then
      parts[#parts+1] = objtostring(x, {})
    else
      parts[#parts+1] = tostring(x)
    end
  end
  tm.log(level, table.concat(parts, ' '))
end

global.console = js_obj({
  log = function (self, ...)
    logger(10, ...)
  end,
  info = function (self, ...)
    logger(11, ...)
  end,
  warn = function (self, ...)
    logger(12, ...)
  end,
  error = function (self, ...)
    logger(13, ...)
  end
});

-- parseFloat, parseInt, isNan, Infinity

global.Infinity = math.huge

global.isFinite = function(this, arg)
  arg = tonumber(arg)
  return type(arg) == 'number' and arg ~= math.huge and arg ~= -math.huge and not global.isNaN(this, arg)
end

global.isNaN = function (this, arg)
  return arg ~= arg -- nan != nan
end

global.parseFloat = function (ths, str)
  v = tonumber(tostring(str), 10)
  if v == nil then
    return (0/0)
  else
    return v
  end
end

global.parseInt = function (ths, str, radix)
  if not radix then
    radix = 10
  end
  if not (type(radix) == 'number' and radix >= 2 and radix <= 36) then
   return 0/0
  end
  if type(str) ~= 'number' then
    str = tostring(str or 'null')
  end
  v = tonumber(str, radix)
  if v == nil then
    return (0/0)
  else
    return math.floor(v)
  end
end

-- Date

global.Date = function (this, time)
  if not js_instanceof(this, global.Date) then
    return os.date('!%a %h %d %Y %H:%M:%S GMT%z (%Z)')
  end
  if type(time) == 'number' then
    getmetatable(this).date = time*1000

  -- temporary hardcode for ntp-client
  elseif time == 'Jan 01 1900 GMT' then
    getmetatable(this).date = -2208988800000000

  elseif type(time) == 'string' then
    getmetatable(this).date = tm.approxidate_milli(time)*1000

  else
    getmetatable(this).date = tm.timestamp()
  end
  return this
end

global.Date.prototype = date_proto

date_proto.toString = function (this)
  -- e.g. Mon Sep 28 1998 14:36:22 GMT-0700 (Pacific Daylight Time)
  return os.date('!%a %h %d %Y %H:%M:%S GMT%z (%Z)', getmetatable(this).date/1e6)
end

date_proto.getDate = function (this)
  return os.date('*t', getmetatable(this).date/1e6).day
end

date_proto.getDay = function (this)
  return os.date('*t', getmetatable(this).date/1e6).wday - 1
end

date_proto.getFullYear = function (this)
  return os.date('*t', getmetatable(this).date/1e6).year
end

date_proto.getHours = function (this)
  return os.date('*t', getmetatable(this).date/1e6).hour
end

date_proto.getMilliseconds = function (this)
  return math.floor((getmetatable(this).date/1e3)%1e3)
end

date_proto.getMinutes = function (this)
  return os.date('*t', getmetatable(this).date/1e6).min
end

date_proto.getMonth = function (this)
  return os.date('*t', getmetatable(this).date/1e6).month - 1
end

date_proto.getSeconds = function (this)
  return os.date('*t', getmetatable(this).date/1e6).sec
end

date_proto.getTime = function (this)
  return math.floor(tonumber(getmetatable(this).date/1e3)) or 0
end

date_proto.getTimezoneOffset = function ()
  return 0
end

date_proto.getUTCDate = date_proto.getDate
date_proto.getUTCDay = date_proto.getDay
date_proto.getUTCFullYear = date_proto.getFullYear
date_proto.getUTCHours = date_proto.getHours
date_proto.getUTCMilliseconds = date_proto.getMilliseconds
date_proto.getUTCMinutes = date_proto.getMinutes
date_proto.getUTCSeconds = date_proto.getSeconds

date_proto.getYear = function (this)
  return os.date('*t', getmetatable(this).date/1e6).year - 1900
end

date_proto.toISOString = function (this)
  -- TODO don't hardcode microseconds
  return os.date('!%Y-%m-%dT%H:%M:%S.', getmetatable(this).date/1e6) .. string.format('%03dZ', (getmetatable(this).date/1e3)%1e3)
end
date_proto.toJSON = date_proto.toISOString
date_proto.valueOf = date_proto.getTime

date_proto.setDate = function () end
date_proto.setFullYear = function () end
date_proto.setHours = function () end
date_proto.setMilliseconds = function () end
date_proto.setMinutes = function () end
date_proto.setMonth = function () end
date_proto.setSeconds = function () end
date_proto.setTime = function () end
date_proto.setUTCDate = function () end
date_proto.setUTCFullYear = function () end
date_proto.setUTCHours = function () end
date_proto.setUTCMinutes = function () end
date_proto.setUTCMonth = function () end
date_proto.setUTCSeconds = function () end
date_proto.setYear = function () end

date_proto.setUTCMilliseconds = function (this, sec)
  getmetatable(this).date = getmetatable(this).date + (sec*1000)
end

date_proto.toDateString = function () return ''; end
date_proto.toGMTString = function () return ''; end
date_proto.toLocaleDateString = function () return ''; end
date_proto.toLocaleString = function () return ''; end
date_proto.toLocaleTimeString = function () return ''; end
date_proto.toTimeString = function () return ''; end
date_proto.toUTCString = function () return ''; end

global.Date.now = function ()
  return math.floor(tonumber(tm.timestamp()/1e3)) or 0
end

global.Date.parse = function (this, date)
  return math.floor((tm.approxidate_milli(tostring(date)) or 0))
end

global.Date.UTC = function ()
  return tonumber(tm.timestamp()/1e3) or 0
end

-- regexp library

if type(hs) == 'table' then
  local hsmatchc = 100
  local hsmatch = hs.regmatch_create(hsmatchc)

  _G._HSMATCH = hsmatch

  global.RegExp = function (this, source, flags)
    -- hsregex requires special flags handling
    local patt = source
    if flags and string.find(flags, "i") then
      patt = '(?i)' .. patt
    end

    local cre = hs.regex_create()
    local crestr, rc = hs.re_comp(cre, patt, hs.ADVANCED)
    if rc ~= 0 then
      error(js_new(global.SyntaxError, 'Invalid regex "' .. patt .. '" (error ' + tostring(rc or 0) + ')'))
    end
    if hs.regex_nsub(cre) > hsmatchc then
      error(js_new(global.Error, 'Too many capturing subgroups (max ' .. hsmatchc .. ', compiled ' .. hs.regex_nsub(cre) .. ')'))
    end

    local o = {source=source}
    o.global = (flags and string.find(flags, "g") and true)
    o.ignoreCase = (flags and string.find(flags, "i") and true)
    o.multiline = (flags and string.find(flags, "m") and true)
    o.unicode = (flags and string.find(flags, "u") and true)
    o.sticky = (flags and string.find(flags, "y") and true)

    setmetatable(o, {
      __index=global.RegExp.prototype,
      __tostring=js_tostring,
      cre=cre,
      crestr=crestr,
      proto=global.RegExp.prototype
    })
    return o
  end

  global._regexp = function (pat, flags)
    return js_new(global.RegExp, pat, flags)
  end

  str_regex_split = function (this, input)
    if not js_instanceof(input, global.RegExp) then
      error(js_new(global.Error, 'Cannot call String.prototype.split on non-regex'))
    end
    local arr, len = hs.regex_split(this, input)
    return js_arr(arr, len)
  end

  str_regex_replace = function (this, regex, out)
    if not js_instanceof(regex, global.RegExp) then
      error(js_new(global.Error, 'Cannot call String.prototype.replace on non-regex'))
    end
    return hs.regex_replace(this, regex, out)
  end

  global.String.prototype.match = function (this, regex)
    -- Match using hsregex
    local cre = getmetatable(regex).cre
    local crestr = getmetatable(regex).crestr
    if type(cre) ~= 'userdata' then
      error(js_new(global.TypeError, 'Cannot call RegExp.prototype.match on non-regex'))
    end

    if rawget(regex, 'global') then
      local data = tostring(this)
      local ret, count, idx = {}, 0, 1
      while true do
        local rc = hs.re_exec(cre, string.sub(data, idx), nil, hsmatchc, hsmatch, 0)
        if rc ~= 0 then
          break
        end

        local so, eo = hs.regmatch_so(hsmatch, i), hs.regmatch_eo(hsmatch, i)
        if so == -1 or eo == -1 then
          break
        end

        rawset(ret, count, string.sub(data, idx + so, idx + eo - 1))
        count = count + 1
        idx = idx + eo
      end
      return js_arr(ret, count)
    end

    local data = tostring(this)
    local rc = hs.re_exec(cre, data, nil, hsmatchc, hsmatch, 0)
    if rc ~= 0 then
      return nil
    end
    local ret, pos = {}, 0
    for i=0,hs.regex_nsub(cre) do
      local so, eo = hs.regmatch_so(hsmatch, i), hs.regmatch_eo(hsmatch, i)
      if so == -1 or eo == -1 then
        table.insert(ret, pos, nil)
      else
        table.insert(ret, pos, string.sub(data, so + 1, eo))
      end
      pos = pos + 1
    end
    return js_arr(ret, pos)
  end

  global.RegExp.prototype.exec = function (regex, subj)
    -- TODO wrong
    local cre = getmetatable(regex).cre
    local crestr = getmetatable(regex).crestr
    if type(cre) ~= 'userdata' then
      error(js_new(global.TypeError, 'Cannot call RegExp.prototype.match on non-regex'))
    end

    local data = tostring(subj)
    local rc = hs.re_exec(cre, data, nil, hsmatchc, hsmatch, 0)
    if rc ~= 0 then
      return nil
    end
    local ret, len = {}, 0
    for i=0,hs.regex_nsub(cre) do
      local so, eo = hs.regmatch_so(hsmatch, i), hs.regmatch_eo(hsmatch, i)
      if so == -1 or eo == -1 then
        table.insert(ret, len, nil)
      else
        table.insert(ret, len, string.sub(data, so + 1, eo))
      end
      len = len + 1
    end
    return js_arr(ret, len)
  end

  global.RegExp.prototype.test = function (this, subj)
    local cre = getmetatable(this).cre
    if type(cre) ~= 'userdata' then
      error(js_new(global.TypeError, 'Cannot call RegExp.prototype.match on non-regex'))
    end

    -- TODO optimize by capturing no subgroups?
    local rc = hs.re_exec(cre, tostring(subj), nil, hsmatchc, hsmatch, 0)
    return rc == 0
  end

  -- https://people.mozilla.org/~jorendorff/es6-draft.html#sec-regexp.prototype.tostring
  global.RegExp.prototype.toString = function (this)
    if type(this) ~= 'table' or not getmetatable(this).cre then
      error(js_new(global.TypeError, 'Cannot call Regex.prototype.toString on non-regex'))
    end

    local flags = ''
    if rawget(this, 'global') then flags = flags .. 'g' end
    if rawget(this, 'ignoreCase') then flags = flags .. 'i' end
    if rawget(this, 'multiline') then flags = flags .. 'm' end
    if rawget(this, 'unicode') then flags = flags .. 'u' end
    if rawget(this, 'sticky') then flags = flags .. 'y' end

    return '/' .. tostring(this.source) .. '/' .. flags
  end
end


--[[
--|| json library
--]]

global.JSON = js_obj({
  parse = function (ths, arg)
    return yajl.to_value(tostring(arg))
  end,
  stringify = function (ths, arg, replacer, space)
    return yajl.to_string(arg, {
      replacer = replacer or nil,
      indent = space or nil
    })
  end,
})


--[[
--|| encode
--]]

function encodeURIComponent (this, str)
  str = tostring(str)
  str = string.gsub (str, "\n", "\r\n")
  str = string.gsub (str, "([^%w %-%_%.%~])", function (c)
    return string.format ("%%%02X", string.byte(c))
  end)
  str = string.gsub (str, " ", "%%20")
  return str
end

function decodeURIComponent (this, str)
  str = tostring(str)
  str = string.gsub (str, "+", " ")
  str = string.gsub (str, "%%(%x%x)", function(h)
    return string.char(tonumber(h,16))
  end)
  str = string.gsub (str, "\r\n", "\n")
  return str
end

global.encodeURIComponent = encodeURIComponent
global.decodeURIComponent = decodeURIComponent


--[[
--|| return namespace
--]]

-- eval stub

global.eval = function () end

-- colony API

colony.global = global
