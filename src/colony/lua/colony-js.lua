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
local _, hs = pcall(require, 'hsregex')
local tm = require('tm')
local rapidjson = require('rapidjson')

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

-- https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.prototype.tofixed
num_proto.toFixed = function (num, n)
  return string.format("%." .. (tonumber(n or 0) or 0) .. "f", num)
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
  elseif type(sep) == 'string' then
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
  for i=1,args1.n do
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

  elseif getmetatable(this) and getmetatable(this).error then
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
  local primitive = getmetatable(this).__primitive;
  if primitive == nil then
    return this;
  else
    return primitive
  end

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
  for i=1,t2.n do
    t1[offn+i] = t2[i]
  end
  return t1
end

func_proto.bind = function (func, ths1, ...)
  local args1 = table.pack(...)
  return function (ths2, ...)
    local argset, args2 = {}, table.pack(...)
    augmentargs(argset, 0, args1)
    augmentargs(argset, args1.n, args2)
    return func(ths1, unpack(argset, 1, args1.n + args2.n))
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
  for i=1,args.n do
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
    if len > 1 then
      rawset(this, 0, table.remove(this, 1))
    else
      rawset(this, 0, nil)
    end
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
  for j=1,args.n do
    if i == 0 then
      arr_proto.unshift(this, args[j])
    else
      table.insert(this, i, args[j])
    end
    i = i + 1
  end
  rawset(this, 'length', original_len - del_len + args.n)
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
  for i=tonumber(start) or 0,len-1 do
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
  for i=1,args1.n do
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
  -- shift from 0-based to 1-based index
  table.insert(this, 1, this[0])
  rawset(this, 0, nil)

  -- sort
  table.sort(this, function (a, b)
    -- handle nil values
    if b == nil and a ~= nil then
      return true
    end
    if a == nil and b ~= nil then
      return false
    end

    if not fn then
      return (tostring(a) < tostring(b))
    else
      local comp = fn(this, a, b)
      local tcomp = type(comp)
      if tcomp == "number" then
        return comp < 0
      elseif tcomp == "boolean" then
        if a == b then
          return false
        end
        return not comp
      end
    end
  end)

  --  unshift
  local tmp = rawget(this, 1)
  table.remove(this, 1)
  rawset(this, 0, tmp)

  return this
end

arr_proto.join = function (this, ...)
  local args = table.pack(...)
  local str = ','
  if args.n >= 1 then
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

  if args.n > 0 then
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

  if args.n > 0 then
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
  if args.n > 0 then
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

  if args.n > 0 then
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

  if args.n > 0 then
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

  if args.n > 0 then
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

  if args.n > 0 then
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

global.Boolean = function (this, n)
  -- If this is an object construction
  if js_instanceof(this, global.Boolean) == true then
    -- save the primitive
    getmetatable(this).__primitive = not not n;
    -- return the object
    return this;
  -- this is just a function
  else
    -- return the number value
    return not not n
  end
end
global.Boolean.prototype = bool_proto
bool_proto.constructor = global.Boolean

-- toString

-- Number

global.NaN = 0/0


global.Number = function (this, n)
  -- If this is an object construction
  if js_instanceof(this, global.Number) == true then
    -- save the primitive
    getmetatable(this).__primitive = tonumbervalue(n);
    -- return the object
    return this;
  -- this is just a function
  else
    -- return the number value
    return tonumbervalue(n)
  end
end

global.Number.prototype = num_proto
num_proto.constructor = global.Number

-- https://people.mozilla.org/~jorendorff/es6-draft.html#sec-properties-of-the-number-constructor
-- note that isNaN: arg ~= arg

global.Number.EPSILON = 2.220446049250313e-16

global.Number.isFinite = function (this, arg)
  return type(arg) == 'number' and arg == arg and math.abs(arg) ~= math.huge
end

global.Number.isInteger = function (this, arg)
  return type(arg) == 'number' and arg == arg and math.abs(arg) ~= math.huge and math.floor(arg) == arg
end

global.Number.isNaN = function (this, arg)
  return type(arg) == 'number' and arg ~= arg
end

global.Number.isSafeInteger = function (this, arg)
  return type(arg) == 'number' and arg == arg and math.abs(arg) ~= math.huge and math.floor(arg) == arg and math.abs(arg) <= 9007199254740991
end

global.Number.MAX_SAFE_INTEGER = 9007199254740991

global.Number.MAX_VALUE = 1.7976931348623157e+308

global.Number.NaN = 0/0

global.Number.NEGATIVE_INFINITY = -math.huge

global.Number.MIN_SAFE_INTEGER = -9007199254740991

global.Number.MIN_VALUE = 5e-322

global.Number.parseFloat = function (this, str)
  return global.parseFloat(this, str)
end

global.Number.parseInt = function (this, str, radix)
  return global.parseInt(this, str, radix)
end

global.Number.POSITIVE_INFINITY = -math.huge

-- Object

global.Object = function (this, obj)
  if type(obj) == 'number' then
    return js_new(global.Number, obj)
  elseif type(obj) == 'string' then
    return js_new(global.String, obj)
  elseif type(obj) == 'boolean' then
    return js_new(global.Boolean, obj);
  else
    return obj or js_obj({})
  end
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
  if type(obj) ~= 'table' and type(obj) ~= 'function' then
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

  if type(obj) ~= 'table' and type(obj) ~= 'function' then
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
  local len = a.n
  a.n = nil
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

_G.colony_isarray = global.Array.isArray

-- String

global.String = function (ths, str)
  if type(str) == 'table' and type(str.toString) == 'function' then
    return str:toString()
  end
  -- If this is an object construction
  if js_instanceof(ths, global.String) == true then

    -- conver to a string
    str = tostring(str)
    -- save the primitive
    getmetatable(ths).__primitive = str;

    -- set the length getter for the boxed value
    js_define_getter(ths, 'length', function()
      return str.length
    end)

    -- set the boxed object properties
    for i = 0, #str-1 do
      ths[i] = str.charAt(str, i);
    end

    -- return the object
    return ths;
  -- this is just a function
  else
    -- return the number value
    return tostring(str)
  end
end
global.String.prototype = str_proto
str_proto.constructor = global.String
global.String.fromCharCode = function (this, ...)
  -- http://es5.github.io/x15.5.html#x15.5.3.2
  local args = table.pack(...)
  local str = ''
  for i=1,args.n do
    local uint16 = math.floor(math.abs(tonumbervalue(args[i]))) % (2^16)
    -- TODO not this
    if uint16 > 255 then
      uint16 = 255
    end
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
    local value = bit.rshift(tointegervalue(x) or 0, 0)
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
    for i=1,args.n do
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

local function error_constructor (this, str, ctor)
  getmetatable(this).__tostring = js_tostring
  getmetatable(this).error = true
  if str ~= nil then
    this.message = str
  end
  global.Error.captureStackTrace(global.Error, this, ctor)
end

error_constructor.prototype.name = "Error"
error_constructor.prototype.message = ""

error_constructor.prototype.toString = function (this)
  if not this then
    return '(undefined)'
  elseif this.message then
    return this.name .. ": " .. this.message
  else
     return this.name
  end
end

local function error_class (name)
  local constructor
  constructor = function (this, str)
    if not js_instanceof(this, constructor) then
      return js_new(constructor, str)
    end

    error_constructor(this, str, constructor)
    this.name = name
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
global.NotImplementedError = error_class('NotImplementedError')

-- NOTE: this constructor mimics v8's undocumented parameters/properties
local function CallSite (this, rcvr, fun, pos)
  this.receiver = rcvr
  this.fun = fun
  this.pos = pos            -- (nvw) I think in v8 this is actually character/byte offset, not line number
end

local function make_callsite (frame, ctx)
  local callsite = js_new(CallSite, ctx, frame.func, frame.currentline)
  getmetatable(callsite).frame = frame
  return callsite
end

CallSite.name = 'CallSite'    -- (nvw) not sure why this is needed?

CallSite.prototype.toString = function (this)
  local frame = getmetatable(this).frame
  local name = frame.name or "<anonymous>"
  local file = string.gsub(frame.short_src, "%[[TC]%]. ", '')
  return name .. " (" .. file .. ":" .. frame.currentline .. ")"
end

CallSite.prototype.getThis = function (this)
  return this.receiver
end

CallSite.prototype.getTypeName = function (this)
  return this.receiver and this.receiver.constructor.name
end

CallSite.prototype.getFunction = function (this)
  return this.fun
end

CallSite.prototype.getFunctionName = function (this)
  return this.fun.name
end

CallSite.prototype.getFileName = function (this)
  return getmetatable(callsite).short_src
end

CallSite.prototype.getLineNumber = function (this)
  return getmetatable(callsite).currentline
end

-- (nvw) I'm not sure if/how we can fully implement these
local function callsite_tbd () end
CallSite.prototype.getMethodName = callsite_tbd
CallSite.prototype.getColumnNumber = callsite_tbd
CallSite.prototype.getEvalOrigin = callsite_tbd
CallSite.prototype.isToplevel = callsite_tbd
CallSite.prototype.isEval = callsite_tbd
CallSite.prototype.isNative = callsite_tbd
CallSite.prototype.isConstructor = callsite_tbd


global.Error.stackTraceLimit = 10

global.Error.captureStackTrace = function (this, err, ctor)
  local frames = {}
  local frame_idx
  if ctor then
    frame_idx = 0
  else
    frame_idx = 1
  end

  local info_idx = 2     -- skip ourselves for starters
  while true do
    local frame = nil
    if frame_idx <= global.Error.stackTraceLimit then
      frame = debug.getinfo(info_idx)
    end
    if not frame then
      break
    end
    if frame_idx > 0 then
      local k, v = debug.getlocal(info_idx, 1)
      frames[frame_idx] = make_callsite(frame, v)
      frame_idx = frame_idx + 1
    elseif frame.func == ctor then
      frame_idx = 1
    end
    info_idx = info_idx + 1
  end

  js_define_getter(err, 'stack', function (this)
    if (global.Error.prepareStackTrace) then
      -- NOTE: https://code.google.com/p/v8/wiki/JavaScriptStackTraceApi states that this will
      --       actually be called when error is *created*. node seems to match this claim, however,
      --       in Chrome 37.0.2062.94 console you have to call .stack to trigger. This seems simpler.
      local arr = global:Array(unpack(frames))
      return global.Error.prepareStackTrace(global.Error, this, arr)
    end

    local s = this:toString()
    for i, frame in ipairs(frames) do
      s = s .. "\n    at " .. frame:toString()
    end
    return s
  end)
end

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
    local regex_nsub = hs.regex_nsub(cre) + 1

    local o = {}
    o.source = source
    o.lastIndex = 0
    o.global = (flags and string.find(flags, "g") and true)
    o.ignoreCase = (flags and string.find(flags, "i") and true)
    o.multiline = (flags and string.find(flags, "m") and true)
    o.unicode = (flags and string.find(flags, "u") and true)
    o.sticky = (flags and string.find(flags, "y") and true)

    -- Set a metatable on the created regex.
    -- This way we can add a handler when the regex obj gets GC'ed
    -- and then in turn force hsregex to free the created regex.
    -- If we free this before hand, we're not guaranteed that the
    -- regex won't get used later.
    -- Had to add a `debug` here in order to set the metatable on userdata.
    debug.setmetatable(cre, {
      __gc = function(self)
        -- force regex to free after it goes out of context
        hs.regfree(self)
      end
    })

    setmetatable(o, {
      __index=global.RegExp.prototype,
      __tostring=js_tostring,
      cre=cre,
      crestr=crestr,
      regex_nsub=regex_nsub,
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

    if not js_instanceof(regex, global.RegExp) then
      regex = js_new(global.RegExp, regex)
    end

    -- Match using hsregex
    local cre = getmetatable(regex).cre
    local crestr = getmetatable(regex).crestr
    local regex_nsub = getmetatable(regex).regex_nsub
    local hsmatch = hs.regmatch_create(regex_nsub)

    if rawget(regex, 'global') then
      local data = tostring(this)
      local ret, count, idx = {}, 0, 1
      while true do
        local rc = hs.re_exec(cre, string.sub(data, idx), nil, regex_nsub, hsmatch, 0)
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
    else
      -- Call regex.exec(str) if the global flag is not true
      return global.RegExp.prototype.exec(regex, this)
    end
  end

  global.RegExp.prototype.exec = function (this, subj)
    local cre = getmetatable(this).cre
    local crestr = getmetatable(this).crestr
    if type(cre) ~= 'userdata' then
      error(js_new(global.TypeError, 'Cannot call RegExp.prototype.exec on non-regex'))
    end
    local regex_nsub = getmetatable(this).regex_nsub
    local hsmatch = hs.regmatch_create(regex_nsub)

    local input = tostring(subj)
    local data = string.sub(input, this.lastIndex + 1)
    local rc = hs.re_exec(cre, data, nil, regex_nsub, hsmatch, 0)
    if rc ~= 0 then
      -- Reset .lastIndex when no match found
      this.lastIndex = 0
      return nil
    end
    local ret, len = {}, 0
    for i=0,regex_nsub-1 do
      local so, eo = hs.regmatch_so(hsmatch, i), hs.regmatch_eo(hsmatch, i)
      if so == -1 or eo == -1 then
        table.insert(ret, len, nil)
      else
        table.insert(ret, len, string.sub(data, so + 1, eo))
      end
      len = len + 1
    end

    ret.index = this.lastIndex + hs.regmatch_so(hsmatch, 0)
    ret.input = input

    if this.global then
      this.lastIndex = this.lastIndex + hs.regmatch_eo(hsmatch, 0)
    end

    return js_arr(ret, len)
  end

  global.RegExp.prototype.test = function (this, subj)
    local cre = getmetatable(this).cre
    if type(cre) ~= 'userdata' then
      error(js_new(global.TypeError, 'Cannot call RegExp.prototype.match on non-regex'))
    end
    local regex_nsub = getmetatable(this).regex_nsub
    local hsmatch = hs.regmatch_create(regex_nsub)

    -- TODO optimize by capturing no subgroups?
    local rc = hs.re_exec(cre, tostring(subj), nil, regex_nsub, hsmatch, 0)
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

global.JSON = js_obj({})

-- Called by parsing code when a parsing error occurs.
local function json_error (val,code,offset)
  -- error message starting string
  -- TODO: replicate node messages more closely
  error_msg = {
    'end of input',
    'token ',
    'token ',
    'token ',
    'token ',
    'token ',
    'token ',
    'token ',
    'end of input ',
    'token ',
    'token after ',
    'token ',
    'token ',
    'token ',
    'token ',
    'token ',
  }

  -- format the offset of the value that's failing
  local token = ''
  if val[offset] then
    token = val[offset]
  elseif val[#val-1] then
    token = val[#val-1]
  end

  -- throw a new error
  error(js_new(global.SyntaxError,'Unexpected '..error_msg[code]..token))

end

-- Parse JSON into an object.
global.JSON.parse = function (this, value)
  -- Non-object primitives require this wrapper.
  return rapidjson.parse('{"value":\n' .. tostring(value) .. '\n}', json_error).value
end

-- Stringify an object.
global.JSON.stringify = function (this, value, replacer, spacer)
  -- Fix spacer argument
  if type(spacer) == 'number' then
    spacer = string.rep(' ', spacer)
  else
    spacer = tostring(spacer or '')
  end
  spacer = string.sub(spacer, 1, 10)

  -- Call writer.
  local wh = rapidjson.create_writer(spacer)
  local status, err = pcall(rapidjson.write_value, wh, value, replacer, nil, {[""] = value})
  if not status then
    rapidjson.destroy(wh)
    error(err)
  end
  local str = rapidjson.result(wh)
  rapidjson.destroy(wh)

  -- Return code.
  return tostring(str)
end

--[[
--|| encode
--]]

function encodeURIComponent (this, str)
  str = tostring(str)
  str = string.gsub (str, "([^%w%-%_%.%~%*%(%)'])", function (c)
    return string.format ("%%%02X", string.byte(c))
  end)
  return str
end

function decodeURIComponent (this, str)
  str = tostring(str)
  str = string.gsub (str, "+", " ")
  return string.gsub (str, "%%(%x%x)", function(h)
    return string.char(tonumber(h,16))
  end)
end


function encodeURI(this, str)
  -- TODO: Check for high/low surrogate pairs
  return string.gsub (tostring(str), "([^%w,;/:@&='_~#%+%$!%.%?%%-%*%(%)])",
    function (c) return string.format ("%%%02X", string.byte(c)) end)
end

function decodeURI(this, str)
  return string.gsub(tostring(str), "%%(%x%x)",
     function(c) return string.char(tonumber(c, 16)) end)
end

function escape(this, str)
  return string.gsub(tostring(str), "([^%w@%*_%+%-%./])",
    function(c)
      return string.format ("%%%02X", string.byte(c))
    end);
end



global.encodeURIComponent = encodeURIComponent
global.decodeURIComponent = decodeURIComponent
global.encodeURI = encodeURI;
global.decodeURI = decodeURI;
global.escape = escape;


--[[
--|| return namespace
--]]

-- eval stub

global.eval = function () end

-- colony API

colony.global = global
