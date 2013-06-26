-- print('[[start colony mem: ' .. collectgarbage('count') .. 'kb]]');

-- requires
-- luarocks install bit32
-- luarocks install json
-- luarocks install lrexlib-pcre
local bit = require('bit32')
--local _, rex = pcall(require, 'lrexlib')
local rex = nil

-- namespace

local _JS = {}

-- built-in prototypes

local obj_proto, func_proto, bool_proto, num_proto, str_proto, arr_proto, regex_proto = {}, {}, {}, {}, {}, {}, {}

-- introduce metatables to built-in types using debug library:
-- this can cause conflicts with other modules if they utilize the string prototype
-- (or expect number/booleans to have metatables)

local func_mt, str_mt, nil_mt = {}, {}, {}
debug.setmetatable((function () end), func_mt)
debug.setmetatable(true, {__index=bool_proto})
debug.setmetatable(0, {__index=num_proto})
debug.setmetatable("", str_mt)
debug.setmetatable(nil, nil_mt)

-- nil metatable

nil_mt.__eq = function (op1, op2)
  return op2 == nil
end

nil_mt.__gt = function (op1, op2)
  return op2 == nil
end

nil_mt.__lt = function (op1, op2)
  return op2 == nil
end

-- object prototype and constructor

_JS._obj = function (o)
  local mt = getmetatable(o) or {}
  mt.__index = obj_proto
  setmetatable(o, mt)
  return o
end

-- all prototypes inherit from object

_JS._obj(func_proto)
_JS._obj(num_proto)
_JS._obj(bool_proto)
_JS._obj(str_proto)
_JS._obj(arr_proto)

-- function constructor

_JS._func = function (f)
  return f
end
local luafunctor = function (f)
  return (function (this, ...) return f(...) end)
end

funccache = {}
setmetatable(funccache, {__mode = 'k'})

func_mt.__index=function (t, p)
  local fobj = funccache[t]
  if p == 'prototype' then
    if fobj == nil then
      funccache[t] = {}
      fobj = funccache[t]
    end
    if fobj[p] == nil then
      fobj[p] = _JS._obj({})
    end
  end
  if fobj and fobj[p] ~= nil then
    return fobj[p]
  end
  return func_proto[p]
end
func_mt.__newindex=function (t, p, v)
  local pt = funccache[t] or {}
  pt[p] = v
  funccache[t] = pt
end
func_mt.__tojson=function ()
  return "{}"
end

-- string metatable

str_mt.__index = function (str, p)
  if (p == "length") then
    return string.len(str)
  elseif (tonumber(p) == p) then
    return string.sub(str, p+1, p+1)
  else
    return str_proto[p]
  end
end

str_mt.__add = function (op1, op2)
  return op1 .. tostring(op2)
end

-- array prototype and constructor

local arr_mt = {
  __index = function (arr, p)
    if (p == "length") then
      if arr[0] then return #arr + 1 end
      return #arr
    else
      return arr_proto[p]
    end
  end,
  __tojson = function (arg)
    local arr = {};
    for i=0,arg.length do
      table.insert(arr, arg[i])
    end
    return dkjson.encode(arr, {indent = true})
  end
}
_JS._arr = function (a)
  setmetatable(a, arr_mt)
  return a
end

-- void function for expression statements (which lua disallows)

_JS._void = function () end

-- null object (nil is "undefined")

_JS._null = {}

-- pairs

_JS._pairs = pairs;

-- typeof operator

_JS._typeof = function (arg)
  if arg == nil then
    return 'undefined'
  elseif type(arg) == 'table' then
    return 'object'
  end
  return type(arg)
end

-- instanceof

_JS._instanceof = function (self, arg)
  return getmetatable(self).__index == arg.prototype
end

-- "new" invocation

_JS._new = function (f, ...)
  local o = {}
  setmetatable(o, {__index=f.prototype})
  local r = f(o, ...)
  if r then return r end
  return o
end

--[[
Standard Library
]]--

-- number prototype

num_proto.toFixed = function (num, n)
  return string.format("%." .. n .. "f", num)
end

-- string prototype

str_proto.charCodeAt = function (str, i, a)
  return string.byte(str, i+1)
end
str_proto.charAt = function (str, i)
  return string.sub(str, i+1, i+1)
end
str_proto.substr = function (str, i, len)
  if len then
    return string.sub(str, i+1, i + len)
  else
    return string.sub(str, i+1)
  end
end
str_proto.slice = function (str, i, len)
  return string.sub(str, i+1, len or -1)
end
str_proto.toLowerCase = function (str)
  return string.lower(str)
end
str_proto.toUpperCase = function (str)
  return string.upper(str)
end
str_proto.indexOf = function (str, needle)
  local ret = string.find(str, tostring(needle), 1, true) 
  if ret == null then return -1; else return ret - 1; end
end
str_proto.split = function (str, sep, max)
  if sep == '' then
    local ret = _JS._arr({})
    for i=0,str.length-1 do
      ret:push(str:charAt(i));
    end
    return ret
  end

  local ret = {}
  if string.len(str) > 0 then
    max = max or -1

    local i, start=1, 1
    local first, last = string.find(str, sep, start, true)
    while first and max ~= 0 do
      ret[i] = string.sub(str, start, first-1)
      i, start = i+1, last+1
      first, last = string.find(str, sep, start, true)
      max = max-1
    end
    ret[i] = string.sub(str, start)
  end
  return _JS._arr(ret)
end
str_proto.replace = function (str, match, out)
  if type(match) == 'string' then
    return string.gsub(str, string.gsub(match, "(%W)","%%%1"), out)
  elseif _JS._instanceof(match, _JS.RegExp) then
    if type(out) == 'function' then 
      print('REGEX REPLACE NOT SUPPORTED')
    end
    local count = 1
    if string.find(match.flags, 'g') ~= nil then
      count = nil
    end
    return rex.gsub(str, match.pattern, out, count)
  else
    error('Unknown regex invocation object: ' .. type(match))
  end
end

-- object prototype

obj_proto.hasInstance = function (ths, p)
  return toboolean(rawget(ths, p))
end
obj_proto.hasOwnProperty = function (ths, p)
  return rawget(ths, p) ~= nil
end

-- function prototype

func_proto.call = function (func, ths, ...)
  return func(ths, ...)
end
func_proto.apply = function (func, ths, args)
  -- copy args to new args array
  local luargs = {}
  for i=0,args.length-1 do luargs[i+1] = args[i] end
  return func(ths, unpack(luargs))
end

-- array prototype

arr_proto.push = function (ths, elem)
  if ths.length == 0 then
    ths[0] = elem
  else
    table.insert(ths, ths.length, elem)
  end
  return ths.length
end
arr_proto.pop = function (ths)
  if ths.length == 1 then
    local _val = ths[0]
    ths[0] = nil
    return _val
  end
  return table.remove(ths, ths.length-1)
end
arr_proto.shift = function (ths)
  local ret = ths[0]
  ths[0] = table.remove(ths, 1)
  return ret
end
arr_proto.unshift = function (ths, elem)
  local _val = nil
  if ths.length > 0 then
    _val = table.insert(ths, 1, elem[0])
  end
  ths[0] = elem
  return _val
end
arr_proto.reverse = function (ths)
  local arr = _JS._arr({})
  for i=0,ths.length-1 do
    arr[ths.length - 1 - i] = ths[i]
  end
  return arr
end
arr_proto.slice = function (ths, start, len)
  local a = _JS._arr({})
  if not len then
    len = ths.length - (start or 0)
  end
  for i=start or 0,len - 1 do
    a:push(ths[i])
  end
  return a
end
arr_proto.concat = function (src1, src2)
  local a = _JS._arr({})
  for i=0,src1.length-1 do
    a:push(src1[i])
  end
  for i=0,src2.length-1 do
    a:push(src2[i])
  end
  return a
end
arr_proto.join = function (ths, str)
  local _r = ""
  for i=0,ths.length-1 do
    if not ths[i] or ths[i] == _null then _r = _r .. str
    else _r = _r .. ths[i] .. str end
  end
  return string.sub(_r, 1, string.len(_r) - string.len(str))
end
arr_proto.indexOf = function (ths, val)
  for i=0,ths.length-1 do
    if ths[i] == val then
      return i
    end
  end
  return -1
end
arr_proto.map = function (ths, fn)
  local a = _JS._arr({})
  for i=0,ths.length-1 do
    a:push(fn(ths, ths[i], i))
  end
  return a
end
arr_proto.forEach = function (ths, fn)
  for i=0,ths.length-1 do
    fn(ths, ths[i], i)
  end
  return ths
end
arr_proto.filter = function (ths, fn)
  local a = _JS._arr({})
  for i=0,ths.length-1 do
    if _JS._truthy(fn(ths, ths[i], i)) then
      a:push(ths[i])
    end
  end
  return a
end

--[[
Globals
]]--

_JS.this, _JS.global = _G, _G

-- Object

_JS.Object = {}
_JS.Object.prototype = obj_proto
_JS.Object.keys = function (ths, obj)
  local a = _JS._arr({})
  -- TODO debug this one:
  if type(obj) == 'function' then
    return a
  end
  for k,v in pairs(obj) do
    a:push(k)
  end
  return a
end

-- Array

function table.pack(...)
  return { length = select("#", ...), ... }
end

_JS.Array = luafunctor(function (one, ...)
  local a = table.pack(...)
  if a.length > 0 or type(one) ~= 'number' then
    a[0] = one
    return _JS._arr(a)
  elseif one ~= nil then
    local a = {}
    for i=0,tonumber(one)-1 do a[i]=null end
    return _JS._arr(a)
  end
  return _JS._arr({})
end)
_JS.Array.prototype = arr_proto
_JS.Array.isArray = luafunctor(function (a)
  return (getmetatable(a) or {}) == arr_mt
end)

-- String

_JS.String = luafunctor(function (str)
  if type(str) == 'table' and type(str.toString) == 'function' then
    return str:toString()
  end
  return tostring(str)
end)
_JS.String.prototype = str_proto
_JS.String.fromCharCode = luafunctor(function (ord)
  if ord == nil then return nil end
  if ord < 32 then return string.format('\\x%02x', ord) end
  if ord < 126 then return string.char(ord) end
  if ord < 65539 then return string.format("\\u%04x", ord) end
  if ord < 1114111 then return string.format("\\u%08x", ord) end
end)

-- Math

_JS.Math = _JS._obj({
  max = luafunctor(math.max),
  sqrt = luafunctor(math.sqrt),
  floor = luafunctor(math.floor)
})

-- Error

_JS.Error = _JS._func(function (self, str)
  getmetatable(self).__tostring = function (self)
    return self.message
  end
  self.message = str
  self.stack = ""
end)

-- Console

local function logger (out, ...)
  for i=1,select('#',...) do
    local x = select(i,...)
    if x == nil then 
      out:write("undefined")
    elseif x == null then
      out:write("null")
    elseif type(x) == 'function' then
      out:write("function () { ... }")
    elseif type(x) == 'string' then
      out:write(x)
    else 
      out:write(tostring(x))
      --out:write(_JS.JSON:stringify(x))
    end
    out:write(' ')
  end
  out:write('\n')
end

_JS.console = _JS._obj({
  log = function (self, ...)
    logger(io.stdout, ...)
  end,
  error = function (self, ...)
    logger(io.stderr, ...)
  end
});

-- break/cont flags

_JS._break = {}; _JS._cont = {}

-- truthy values

_JS._truthy = function (o)
  return o and o ~= 0 and o ~= ""
end

-- require function

_JS.require = luafunctor(require)

-- bitop library

_JS._bit = bit

-- parseFloat, parseInt

_JS.parseFloat = luafunctor(function (str)
  return tonumber(str)
end)

_JS.parseInt = luafunctor(function (str)
  return math.floor(tonumber(str))
end)

-- regexp library

if rex then
  _JS.RegExp = function (pat, flags)
    local o = {pattern=pat, flags=flags}
    setmetatable(o, {__index=_JS.RegExp.prototype})
    return o
  end
end

-- json library

-- _JS.JSON = _JS._obj({
--  parse = function (ths, arg)
--    return json.decode(arg)
--  end,
--  stringify = function (ths, arg)
--    return json.encode(arg, { indent = true })
--  end,
-- })

-- return namespace

-- eval stub

_JS.eval = _JS._func(function () end)

-- NODE JS
-- Emulation

-- process

_JS.process = _JS._obj({
  memoryUsage = function (ths)
    return _JS._obj({
      heapUsed=collectgarbage('count')*1024
    });
  end
})

-- buffer

local buf_proto = {
  
}

local buffer_mt = {
  __index = function (self, p)
    if (p == "length") then
      if self[0] then return #self + 1 end
      return #self
    else
      return buf_proto[p]
    end
  end
}

_JS.Buffer = _JS._func(function (self, size)
  setmetatable(self, buffer_mt)
  return self
end)
_JS.Buffer.prototype = buf_proto

-- poor man's eval

_JS.luaeval = _JS._func(function (self, str) 
  local context = {}
  setmetatable(context, { __index = _JS })
  local condition = assert(loadstring('return ' .. str))
  setfenv(condition, context)
  return condition()
end)

-- print('[[end colony mem: ' .. collectgarbage('count') .. 'kb]]');

return _JS