return function (colony)

local bit = require('bit32')
local yajl = require('yajl')
local _, hs = pcall(require, 'hsregex')

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
global._G = _G

-- in-code modules

global._debug = debug
global._xpcall = xpcall
global._error = error
global._bit = bit

-- global globals

global.this, global.global = global, global

--[[
Standard Library
]]--

-- number prototype

num_proto.toString = function (num, n)
  if n == 16 then
    return string.format("%x", num)
  else
    return tostring(num)
  end
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

str_proto.lastIndexOf = function (str, needle)
  local ret = string.find(string.reverse(str), tostring(needle), 1, true) 
  if ret == null then return -1; else return str.length - ret; end
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

str_proto.split = function (str, sep, max)
  if sep == '' then
    local ret = js_arr({})
    for i=0,str.length-1 do
      ret:push(str:charAt(i));
    end
    return ret
  end

  local ret = {}
  if type(sep) == 'string' and string.len(str) > 0 then
    max = max or -1

    local i, start=1, 1
    local first, last = string.find(str, sep, start, true)
    while first and max ~= 0 do
      ret[i-1] = string.sub(str, start, first-1)
      i, start = i+1, last+1
      first, last = string.find(str, sep, start, true)
      max = max-1
    end
    ret[i-1] = string.sub(str, start)
  end
  -- TODO regex
  return js_arr(ret)
end

local str_regex_replace = nil

str_proto.replace = function (this, match, out)
  if type(match) == 'string' then
    return string.gsub(this, string.gsub(match, "(%W)","%%%1"), out)
  elseif str_regex_replace and js_instanceof(match, global.RegExp) then
    return str_regex_replace(this, match, out)
  else
    print(match)
    error('Unknown regex invocation object: ' .. type(match))
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

obj_proto.toString = function (this)
  if getmetatable(this) and getmetatable(this).proto == arr_proto then
    return '[object Array]'
  elseif type(this) == 'function' then
    return '[object Function]'
  else
    return '[object Object]'
  end
end

obj_proto.hasInstance = function (ths, p)
  return toboolean(rawget(ths, p))
end

obj_proto.hasOwnProperty = function (ths, p)
  return rawget(ths, p) ~= nil
end

function js_define_setter (self, key, fn)
  if type(self) == 'function' then
    self = js_func_proxy(self)
  end

  local mt = getmetatable(self)
  if not mt.values then
    mt.values = {}
    mt.values[key] = rawget(self, key)
    rawset(self, key, nil)
  end
  if not mt.getters then
    mt.getters = {}
    mt.__index = js_getter_index(mt.proto)
  end
  if not mt.setters then
    mt.setters = {}
    mt.__newindex = js_setter_index(mt.proto)
  end

  mt.setters[key] = fn
end

function js_define_getter (self, key, fn)
  if type(self) == 'function' then
    self = js_func_proxy(self)
  end
  
  local mt = getmetatable(self)
  if not mt.values then
    mt.values = {}
    mt.values[key] = rawget(self, key)
    rawset(self, key, nil)
  end
  if not mt.getters then
    mt.getters = {}
    mt.__index = js_getter_index(mt.proto)
  end
  if not mt.setters then
    mt.setters = {}
    mt.__newindex = js_setter_index(mt.proto)
  end

  mt.getters[key] = fn
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

func_proto.apply = function (func, ths, args)
  -- copy args to new args array
  local luargs = {}
  if args then
    for i=0,(args.length or 0)-1 do luargs[i+1] = args[i] end
  end
  return func(ths, unpack(luargs, 1, args.length or 0))
end

func_proto.toString = function ()
  return "function () { ... }"
end

-- array prototype

arr_proto.toString = function (ths)
  local str = ''
  for i=0,(ths.length or 0)-1 do
    str = str .. tostring(ths[i]) .. (i == ths.length-1 and '' or ',')
  end
  return str
end

arr_proto.push = function (ths, ...)
  local args = table.pack(...)
  for i, elem in ipairs(args) do
    if ths.length == 0 then
      ths[0] = elem
    else
      table.insert(ths, ths.length, elem)
    end
  end
  return ths.length
end

arr_proto.pop = function (this)
  local _val = nil
  if this.length == 1 then
    local _val = this[0]
    this[0] = nil
  else
    _val = table.remove(this, this.length-1)
  end
  local mt = getmetatable(this)
  if mt and type(mt.length) == 'number' and mt.length > 0 then
    mt.length = mt.length - 1
  end
  return _val
end

arr_proto.shift = function (this)
  local ret = this[0]
  this[0] = table.remove(this, 1)
  local mt = getmetatable(this)
  if mt and type(mt.length) == 'number' and mt.length > 0 then
    mt.length = mt.length - 1
  end
  return ret
end

arr_proto.unshift = function (ths, elem)
  local _val = nil
  if ths.length > 0 then
    _val = table.insert(ths, 0, elem[0])
  end
  ths[0] = elem
  return ths.length
end

arr_proto.splice = function (ths, i, del, ...)
  local ret = js_arr({})
  for j=1,(tonumber(del) or 0) do
    ret:push(ths[i])
    table.remove(ths, i)
    if i == 0 then
      ths[0] = table.remove(ths, 1)
    end
  end
  local args = table.pack(...)
  for j=1,args.length do
    table.insert(ths, i, args[j])
    i = i + 1
  end
  getmetatable(ths).length = getmetatable(ths).length - (tonumber(del) or 0)
  return ret
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

arr_proto.slice = function (ths, start, len)
  local a = js_arr({})
  if not len then
    len = ths.length
  end
  for i=start or 0,len-1 do
    a:push(ths[i])
  end
  return a
end

arr_proto.concat = function (src1, src2)
  local a = js_arr({})
  for i=0,(src1.length or 0)-1 do
    a:push(src1[i])
  end
  for i=0,(src2.length or 0)-1 do
    a:push(src2[i])
  end
  return a
end

arr_proto.sort = function (ths)
  return ths
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
  local a = js_arr({})
  for i=0,ths.length-1 do
    a:push(fn(ths, ths[i], i))
  end
  return a
end

arr_proto.filter = function (this, fn)
  local a = js_arr({})
  for i=0,this.length-1 do
    if fn(this, this[i], i) then
      a:push(this[i])
    end
  end
  return a
end

arr_proto.reduce = function (this, callback, opt_initialValue)
  if this == nil then
    error('Array.prototype.reduce called on null or undefined')
  end
  if type(callback) ~= 'function' then
    error(callback + ' is not a function')
  end
  local index = 0
  local value = nil
  local length = bit.bor(this.length, 0)
  local isValueSet = false

  if opt_initialValue ~= nil then
    value = opt_initialValue
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
    error('Reduce of empty array with no initial value')
  end
  return value
end

arr_proto.forEach = function (ths, fn)
  for i=0,ths.length-1 do
    fn(ths, ths[i], i)
  end
  return ths
end

arr_proto.some = function (ths, fn)
  for i=0,ths.length-1 do
    if fn(ths, ths[i], i) then
      return true
    end
  end
  return false
end

arr_proto.filter = function (ths, fn)
  local a = js_arr({})
  for i=0,ths.length-1 do
    if global._truthy(fn(ths, ths[i], i)) then
      a:push(ths[i])
    end
  end
  return a
end

--[[
Globals
]]--

-- Boolean

global.Boolean = function (ths, n) 
  return not not n
end
global.Boolean.prototype = bool_proto
bool_proto.constructor = global.Boolean

-- toString

-- Number

global.Number = function (ths, n) 
  return tonumber(n)
end
global.Number.prototype = num_proto
num_proto.constructor = global.Number

-- Object

global.Object = function (this, obj)
  return obj or js_obj({})
end
global.Object.prototype = obj_proto
obj_proto.constructor = global.Object

global.Object.create = function (proto)
  local o = {}
  local mt = {}
  setmetatable(o, mt)
  if proto then
    mt.__index = function (self, key)
      return js_proto_get(self, proto, key)
    end
    mt.proto = proto
  end
  return o
end

global.Object.defineProperty = function (this, obj, prop, config)
  if config.value then
    rawset(obj, prop, config.value)
  end
  if config.get then
    js_define_getter(obj, prop, config.get)
  end
  if config.set then
    js_define_setter(obj, prop, config.set)
  end
  -- todo configurable, writeable, enumerable
  return obj
end

global.Object.defineProperties = function (this, obj, props)
  for k, v in pairs(props) do
    global.Object:defineProperty(obj, k, v)
  end
  return obj
end

global.Object.freeze = function (this, obj)
  return obj
end

global.Object.keys = function (this, obj)
  local a = js_arr({})
  -- TODO debug this one:
  if type(obj) == 'function' then
    obj = js_func_proxy(obj)
  end
  for k,v in js_pairs(obj) do
    a:push(k)
  end
  return a
end

global.Object.getOwnPropertyNames = function (this, obj)
  local a = js_arr({})
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
  if mt and mt.values then
    for k,v in pairs(mt.values) do
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
      value = (mt and {mt.values and mt.values[key]} or {obj[key]})[1],
      get = mt and mt.getters and mt.getters[key],
      set = mt and mt.setters and mt.setters[key],
      writeable = true,
      configurable = true,
      enumerable = true
    })
  end
end

-- Function

global.Function = function (this)
  -- TODO
  return function () end
end

global.Function.prototype = func_proto
func_proto.constructor = global.Function

-- Array

global.Array = function (ths, one, ...)
  local a = table.pack(...)
  if a.length > 0 or type(one) ~= 'number' then
    a[0] = one
    return js_arr(a)
  elseif one ~= nil then
    local arr = js_arr({})
    arr[tonumber(one)-1] = nil
    return arr
  end
  return js_arr({})
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
  return tostring(str)
end
global.String.prototype = str_proto
str_proto.constructor = global.String
global.String.fromCharCode = function (ths, ord)
  if ord == nil then return nil end
  if ord < 32 then return string.format('\\x%02x', ord) end
  if ord < 126 then return string.char(ord) end
  if ord < 65539 then return string.format("\\u%04x", ord) end
  if ord < 1114111 then return string.format("\\u%08x", ord) end
end

-- Math


local luafunctor = function (f)
  return (function (this, ...) return f(...) end)
end

global.Math = js_obj({
  abs = luafunctor(math.abs),
  max = luafunctor(math.max),
  min = luafunctor(math.min),
  sqrt = luafunctor(math.sqrt),
  ceil = luafunctor(math.ceil),
  floor = luafunctor(math.floor),
  log = luafunctor(math.log),
  cos = luafunctor(math.cos),
  sin = luafunctor(math.sin),
  random = function ()
    return math.random()
  end,
  PI = math.pi
})

-- Error

global.Error = function (self, str)
  getmetatable(self).__tostring = function (self)
    return self.message
  end
  self.message = str
  self.stack = tostring(debug.traceback())
end

global.Error.captureStackTrace = function ()
  return {}
end

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

  local vals = {}
  sset[obj] = true
  for k in js_pairs(obj) do
    local v = obj[k]
    if sset[v] ~= true then
      if type(v) == 'table' then
        sset[v] = true
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

local function logger (out, ...)
  for i=1,select('#',...) do
    local x = select(i,...)
    if js_typeof(x) == 'object' and x ~= nil then 
      out:write(objtostring(x, {}))
    else
      out:write(tostring(x))
      --out:write(global.JSON:stringify(x))
    end
    out:write(' ')
  end
  out:write('\n')
end

global.console = js_obj({
  log = function (self, ...)
    logger(io.stdout, ...)
  end,
  error = function (self, ...)
    logger(io.stderr, ...)
  end
});

-- parseFloat, parseInt, isNan

global.isNaN = function (this, arg)
  return arg ~= arg -- nan != nan
end

global.parseFloat = function (ths, str)
  return tonumber(tostring(str)) or 0
end

global.parseInt = function (ths, str)
  return math.floor(tonumber(str) or 0)
end

-- Date

global.Date = function (this, time)
  if not js_instanceof(this, global.Date) then
    return os.date('!%a %h %d %Y %H:%M:%S GMT%z (%Z)')
  end
  if type(time) == 'number' then
    getmetatable(this).date = time
  else
    getmetatable(this).date = os.time()
  end
  return this
end

global.Date.prototype.toString = function (this)
  -- e.g. Mon Sep 28 1998 14:36:22 GMT-0700 (Pacific Daylight Time)
  return os.date('!%a %h %d %Y %H:%M:%S GMT%z (%Z)', getmetatable(this).date)
end

global.Date.prototype.getDate = function (this)
  return os.date('*t', getmetatable(this).date).day
end

global.Date.prototype.getDay = function (this)
  return os.date('*t', getmetatable(this).date).wday - 1
end

global.Date.prototype.getFullYear = function (this)
  return os.date('*t', getmetatable(this).date).year
end

global.Date.prototype.getHours = function (this)
  return os.date('*t', getmetatable(this).date).hour
end

global.Date.prototype.getMilliseconds = function (this)
  return 0 -- TODO
end

global.Date.prototype.getMinutes = function (this)
  return os.date('*t', getmetatable(this).date).min
end

global.Date.prototype.getMonth = function (this)
  return os.date('*t', getmetatable(this).date).month - 1
end

global.Date.prototype.getSeconds = function (this)
  return os.date('*t', getmetatable(this).date).sec
end

global.Date.prototype.getTime = function (this)
  return tonumber(getmetatable(this).date) or 0
end

global.Date.prototype.getTimezoneOffset = function ()
  return 0
end

global.Date.prototype.getUTCDate = global.Date.prototype.getDate
global.Date.prototype.getUTCDay = global.Date.prototype.getDay
global.Date.prototype.getUTCFullYear = global.Date.prototype.getFullYear
global.Date.prototype.getUTCHours = global.Date.prototype.getHours
global.Date.prototype.getUTCMilliseconds = global.Date.prototype.getMilliseconds
global.Date.prototype.getUTCMinutes = global.Date.prototype.getMinutes
global.Date.prototype.getUTCSeconds = global.Date.prototype.getSeconds

global.Date.prototype.getYear = function (this)
  return os.date('*t', getmetatable(this).date).year - 1900
end

global.Date.prototype.toISOString = function (this)
  -- TODO don't hardcode microseconds
  return os.date('!%Y-%m-%dT%H:%M:%S.000Z', getmetatable(this).date)
end
global.Date.prototype.toJSON = global.Date.prototype.toISOString
global.Date.prototype.valueOf = global.Date.prototype.getTime

global.Date.prototype.setDate = function () end
global.Date.prototype.setFullYear = function () end
global.Date.prototype.setHours = function () end
global.Date.prototype.setMilliseconds = function () end
global.Date.prototype.setMinutes = function () end
global.Date.prototype.setMonth = function () end
global.Date.prototype.setSeconds = function () end
global.Date.prototype.setTime = function () end
global.Date.prototype.setUTCDate = function () end
global.Date.prototype.setUTCFullYear = function () end
global.Date.prototype.setUTCHours = function () end
global.Date.prototype.setUTCMilliseconds = function () end
global.Date.prototype.setUTCMinutes = function () end
global.Date.prototype.setUTCMonth = function () end
global.Date.prototype.setUTCSeconds = function () end
global.Date.prototype.setYear = function () end

global.Date.prototype.toDateString = function () return ''; end
global.Date.prototype.toGMTString = function () return ''; end
global.Date.prototype.toLocaleDateString = function () return ''; end
global.Date.prototype.toLocaleString = function () return ''; end
global.Date.prototype.toLocaleTimeString = function () return ''; end
global.Date.prototype.toTimeString = function () return ''; end
global.Date.prototype.toUTCString = function () return ''; end

global.Date.now = function ()
  return tonumber(os.time()) or 0
end

global.Date.parse = function ()
  return tonumber(os.time()) or 0
end

global.Date.UTC = function ()
  return tonumber(os.time()) or 0
end

-- regexp library

if type(hs) == 'table' then
  local hsmatchc = 100
  local hsmatch = hs.regmatch_create(hsmatchc)

  global.RegExp = function (this, patt, flags)
    -- hsrude requires special flags handling
    if flags and string.find(flags, "i") then
      patt = '(?i)' .. patt
    end

    local cre = hs.regex_create()
    local crestr, rc = hs.re_comp(cre, patt, hs.ADVANCED)
    if rc ~= 0 then
      error('SyntaxError: Invalid regex "' .. patt .. '"')
    end
    if hs.regex_nsub(cre) > hsmatchc then
      error('Too many capturing subgroups (max ' .. hsmatchc .. ', compiled ' .. hs.regex_nsub(cre) .. ')')
    end

    local o = {pattern=patt, flags=flags}
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

  str_regex_replace = function (this, regex, out)
    -- verify regex
    local cre = getmetatable(regex).cre
    local crestr = getmetatable(regex).crestr
    if type(cre) ~= 'userdata' then
      error('Cannot call String::replace on non-regex')
    end

    local dorepeat = string.find(regex.flags, 'g')
    local data = tostring(this)
    local ret = {}
    local idx = 0
    -- TODO: optimize, give string with offset in re_exec
    repeat
      local datastr, rc = hs.re_exec(cre, data, nil, hsmatchc, hsmatch, 0)
      if rc ~= 0 then
        break
      end
      local so, eo = hs.regmatch_so(hsmatch, 0), hs.regmatch_eo(hsmatch, 0)
      table.insert(ret, string.sub(data, 1, so))

      if type(out) == 'function' then 
        local args = {this, string.sub(data, so + 1, eo)}
        for i=1,hs.regex_nsub(cre) do
          local subso, subeo = hs.regmatch_so(hsmatch, i), hs.regmatch_eo(hsmatch, i)
          table.insert(args, string.sub(data, subso + 1, subeo))
        end
        table.insert(args, idx + so)
        table.insert(args, this)
        table.insert(ret, tostring(out(unpack(args)) or 'undefined'))
      else
        local ins = tostring(out)
        local i, j = 0, 0
        while true do
          i, j = string.find(ins, "$%d+", i+1)    -- find 'next' newline
          if i == nil then break end
          local subindex = tonumber(string.sub(ins, i+1, j))
          local subso, subeo = hs.regmatch_so(hsmatch, subindex), hs.regmatch_eo(hsmatch, subindex)
          ins = string.sub(ins, 0, i-1) .. string.sub(data, subso + 1, subeo) .. string.sub(ins, j+1)
          i = i + (subeo - subso)
        end
        table.insert(ret, ins)
      end

      data = string.sub(data, eo+1)
      idx = eo
    until not dorepeat
    table.insert(ret, data)
    return table.concat(ret, '')
  end

  global.String.prototype.match = function (this, regex)
    -- return rex.match(this, regex.pattern)

    -- Match using hsrude
    local cre = getmetatable(regex).cre
    local crestr = getmetatable(regex).crestr
    if type(cre) ~= 'userdata' then
      error('Cannot call RegExp::match on non-regex')
    end

    local data = tostring(this)
    local datastr, rc = hs.re_exec(cre, data, nil, hsmatchc, hsmatch, 0)
    if rc ~= 0 then
      return nil
    end
    local ret, pos = {}, 0
    for i=0,hs.regex_nsub(cre) do
      local so, eo = hs.regmatch_so(hsmatch, i), hs.regmatch_eo(hsmatch, i)
      -- print('match', i, '=> start:', so, ', end:', eo)
      table.insert(ret, pos, string.sub(data, so + 1, eo))
      pos = pos + 1
    end
    return js_arr(ret)
  end

  global.RegExp.prototype.exec = function (regex, subj)
    -- TODO wrong
    local cre = getmetatable(regex).cre
    local crestr = getmetatable(regex).crestr
    if type(cre) ~= 'userdata' then
      error('Cannot call RegExp::match on non-regex')
    end

    local data = tostring(subj)
    local datastr, rc = hs.re_exec(cre, data, nil, hsmatchc, hsmatch, 0)
    if rc ~= 0 then
      return nil
    end
    local ret = {}
    for i=0,hs.regex_nsub(cre) do
      local so, eo = hs.regmatch_so(hsmatch, i), hs.regmatch_eo(hsmatch, i)
      -- print('match', i, '=> start:', so, ', end:', eo)
      table.insert(ret, string.sub(data, so + 1, eo))
    end
    local arrret = js_arr(ret)
    arrret:shift()
    return arrret
  end

  global.RegExp.prototype.test = function (this, subj)
    local cre = getmetatable(this).cre
    if type(cre) ~= 'userdata' then
      error('Cannot call RegExp::match on non-regex')
    end

    -- TODO optimize by capturing no subgroups?
    local datastr, rc = hs.re_exec(cre, tostring(subj), nil, hsmatchc, hsmatch, 0)
    return rc == 0
  end
end


--[[
--|| json library
--]]

global.JSON = js_obj({
  parse = function (ths, arg)
    return yajl.to_value(arg)
  end,
  stringify = function (ths, arg)
    return yajl.to_string(arg)
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
  str = string.gsub (str, " ", "+")
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
--|| Fake Event Loop
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
--|| Fake Timers
--]]

global.setTimeout = function (this, fn, timeout)
  local start = os.clock()
  table.insert(_eventQueue, function ()
    local now = os.clock()
    if now - start < (timeout/1000) then
      return 1
    end
    fn()
    return 0
  end)
end

global.setInterval = function (this, fn, timeout)
  local start = os.clock()
  table.insert(_eventQueue, function ()
    local now = os.clock()
    if now - start < (timeout/1000) then
      return 1
    end
    fn()
    start = os.clock() -- fixed time delay *between* calls
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
--|| return namespace
--]]

-- eval stub

global.eval = function () end

-- colony API

colony.global = global

end
