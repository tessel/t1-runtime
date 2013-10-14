return function (colony)

local bit = require('bit32')
local _, rex = pcall(require, 'rex_pcre')

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

-- Shorthand for helper functions in compiled code.

global = js_obj({})

global._obj = js_obj
global._arr = js_arr
global._void = js_void
global._null = js_null
global._pairs = js_pairs
global._typeof = js_typeof
global._instanceof = js_instanceof
global._new = js_new
global._truthy = js_truthy
global._arguments = js_arguments
global._seq = js_seq
global._in = js_in
global._break = js_break
global._cont = js_cont

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

str_proto.toString = function (this)
  -- not called as __tostring metatable to prevent recursion
  if type(this) == 'string' then
    return tostring(this)
  else
    return '[object Object]'
  end
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
  if string.len(str) > 0 then
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
  return js_arr(ret)
end

str_proto.replace = function (str, match, out)
  if type(match) == 'string' then
    return string.gsub(str, string.gsub(match, "(%W)","%%%1"), out)
  elseif js_instanceof(match, global.RegExp) then
    if type(out) == 'function' then 
      print('REGEX REPLACE NOT SUPPORTED')
    end
    local count = 1
    if string.find(match.flags, 'g') ~= nil then
      count = nil
    end
    local ret, _ = rex.gsub(str, match.pattern, out, count)
    return ret
  else
    print(match)
    error('Unknown regex invocation object: ' .. type(match))
  end
end

-- object prototype

obj_proto.toString = function (this)
  if getmetatable(this) and getmetatable(this).proto == arr_proto then
    return '[object Array]'
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

func_proto.call = function (func, ths, ...)
  return func(ths, ...)
end

func_proto.bind = function (func, ths1, ...)
  local args1 = table.pack(...)
  return function (ths2, ...)
    local args2 = table.pack(...)
    return func(ths1, unpack(table.augment(args1, args2)))
  end
end

func_proto.apply = function (func, ths, args)
  -- copy args to new args array
  local luargs = {}
  if args then
    for i=0,(args.length or 0)-1 do luargs[i+1] = args[i] end
  end
  return func(ths, unpack(luargs))
end

func_proto.toString = function ()
  return "function () { ... }"
end

-- array prototype

arr_proto.toString = function (ths)
  local str = ''
  for i=0,ths.length-1 do
    str = str .. tostring(ths[i]) .. (i == ths.length-1 and '' or ',')
  end
  return str
end

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

arr_proto.splice = function (ths, i, del, ...)
  local ret = js_arr({})
  for j=1,del do
    ret:push(ths[i])
    table.remove(ths, i)
  end
  local args = table.pack(...)
  for j=1,args.length do
    table.insert(ths, i, args[j])
    i = i + 1
  end
  return ret
end

arr_proto.reverse = function (ths)
  local arr = js_arr({})
  for i=0,ths.length-1 do
    arr[ths.length - 1 - i] = ths[i]
  end
  return arr
end

arr_proto.slice = function (ths, start, len)
  local a = js_arr({})
  if not len then
    len = ths.length - (start or 0)
  end
  for i=start or 0,len do
    a:push(ths[i])
  end
  return a
end

arr_proto.concat = function (src1, src2)
  local a = js_arr({})
  for i=0,src1.length-1 do
    a:push(src1[i])
  end
  for i=0,src2.length-1 do
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

arr_proto.reduce = function (ths, fn)
  local a = js_arr({})
  -- TODO
  return a
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

-- toString

-- Number

global.Number = function (ths, n) 
  return tonumber(n)
end

-- Object

global.Object = js_obj({})

global.Object.prototype = obj_proto

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
  for k, v in js_pairs(props) do
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
    return a
  end
  for k,v in js_pairs(obj) do
    a:push(k)
  end
  return a
end

-- Function

global.Function = function (ths)
  -- TODO
  return {}
end

global.Function.prototype = func_proto

-- Array

global.Array = function (ths, one, ...)
  local a = table.pack(...)
  if a.length > 0 or type(one) ~= 'number' then
    a[0] = one
    return js_arr(a)
  elseif one ~= nil then
    local a = {}
    for i=0,tonumber(one)-1 do a[i]=null end
    return js_arr(a)
  end
  return js_arr({})
end

global.Array.prototype = arr_proto

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
  sqrt = luafunctor(math.sqrt),
  ceil = luafunctor(math.ceil),
  floor = luafunctor(math.floor),
  log = luafunctor(math.log),
  random = function ()
    return math.random()
  end
})

-- Error

global.Error = function (self, str)
  getmetatable(self).__tostring = function (self)
    return self.message
  end
  self.message = str
  self.stack = ""
end

global.Error.captureStackTrace = function ()
  return {}
end

-- Console

local function objtostring (obj, sset)
  local vals = {}
  sset[obj] = true
  for k, v in pairs(obj) do
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

-- parseFloat, parseInt

global.parseFloat = function (ths, str)
  return tonumber(tostring(str)) or 0
end

global.parseInt = function (ths, str)
  return math.floor(tonumber(str) or 0)
end

-- Date

global.Date = function (ths)
  return 0
end

-- regexp library

if rex then
  global.RegExp = function (this, pat, flags)
    local o = {pattern=pat, flags=flags}
    setmetatable(o, {
      __index=global.RegExp.prototype,
      __tostring=js_tostring,
      proto=global.RegExp.prototype
    })
    return o
  end

  global._regexp = function (pat, flags) 
    return js_new(global.RegExp, pat, flags)
  end

  global.String.prototype.match = function (this, regex)
    return rex.match(this, regex.pattern)
  end

  global.RegExp.prototype.test = function (this, subj)
    return rex.match(subj, this.pattern) and true or false
  end
end

-- json library

global.JSON = js_obj({
  parse = function (this, arg)
    return js_obj({})
  end,
  stringify = function (this, arg)
    return "{}"
  end
})

-- global.JSON = js_obj({
--  parse = function (ths, arg)
--    return json.decode(arg)
--  end,
--  stringify = function (ths, arg)
--    return json.encode(arg, { indent = true })
--  end,
-- })

-- return namespace

-- eval stub

global.eval = function () end

-- extern globals
-- TODO fix these
global.setTimeout = function (this, fn, val) 
  return _G._colony_global_setTimeout(nil, function ()
    fn(this)
  end, val)
end
global.setInterval = function (this, fn, val) 
  return _G._colony_global_setInterval(nil, function ()
    fn(this)
  end, val)
end
global.setImmediate = function (this, fn, val) 
  return _G._colony_global_setImmediate(nil, function ()
    fn(this)
  end, val)
end

-- NODE JS
-- Emulation

global.Buffer = _G._colony_global_Buffer

global.Buffer.byteLength = function (this, msg)
  return type(msg) == 'string' and string.len(msg) or msg.length
end

-- process

global.process = js_obj({
  memoryUsage = function (ths)
    return js_obj({
      heapUsed=collectgarbage('count')*1024
    });
  end,
  binding = function (self, key)
    return _G['_colony_binding_' + key](global);
  end,
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

-- dirname, pathname

global:__defineGetter__('____dirname', function (this)
  return string.gsub(string.sub(debug.getinfo(2).source, 2), "/?[^/]+$", "")
end)

global:__defineGetter__('____filename', function (this)
  return string.sub(debug.getinfo(2).source, 2)
end)

-- poor man's eval

-- global.collectgarbage = luafunctor(collectgarbage)

-- print('[[end colony mem: ' .. collectgarbage('count') .. 'kb]]');

return global

end