-- print('[[start colony mem: ' .. collectgarbage('count') .. 'kb]]');

-- requires
-- luarocks install bit32
-- luarocks install json
-- luarocks install lrexlib-pcre

local bit = require('bit32')

-- lua methods

function table.augment (t1,t2)
  for i=1,#t2 do
    t1[#t1+1] = t2[i]
  end
  return t1
end

if not table.pack then
  function table.pack(...)
    return { length = select("#", ...), ... }
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

-- built-in prototypes

local obj_proto, func_proto, bool_proto, num_proto, str_proto, arr_proto, regex_proto = {}, {}, {}, {}, {}, {}, {}
funcproxies = {}

-- get from prototype chain while maintaining "self"

local function js_proto_get (self, proto, key)
  if key == '__proto__' then return proto; end
  proto = rawget(funcproxies, proto) or proto
  return rawget(proto, key) or (getmetatable(proto) and getmetatable(proto).__index and getmetatable(proto).__index(self, key, proto)) or nil
end

local function js_getter_index (proto)
  return function (self, key, _self)
    local mt = getmetatable(_self or self)
    local getter = mt.getters[key]
    if getter then
      return getter(self)
    end
    return mt.values[key] or js_proto_get(self, proto, key)
  end
end

local function js_setter_index (proto)
  return function (self, key, value)
    local mt = getmetatable(self)
    local setter = mt.setters[key]
    if setter then
      return setter(self, value)
    end
    rawset(mt.values, key, value)
  end
end

local function js_tostring (this)
  return this:toString()
end

local function js_valueof (this)
  return this:valueOf()
end

-- introduce metatables to built-in types using debug library:
-- this can cause conflicts with other modules if they utilize the string prototype
-- (or expect number/booleans to have metatables)

local func_mt, str_mt, nil_mt, num_mt = {}, {}, {}, {}

debug.setmetatable((function () end), func_mt)
debug.setmetatable(true, {
  __index=function (self, key)
    return js_proto_get(self, bool_proto, key)
  end
})
debug.setmetatable(0, num_mt)
debug.setmetatable("", str_mt)
debug.setmetatable(nil, nil_mt)

--[[
--  number
--]]

num_mt.__index=function (self, key)
  return js_proto_get(self, num_proto, key)
end

num_mt.__lt = function (op1, op2)
  if op2 == nil then return op1 < 0 end
  return tonumber(op1) < tonumber(op1)
end

num_mt.__le = function (op1, op2)
  if op2 == nil then return op1 <= 0 end
  return tonumber(op1) <= tonumber(op1)
end


--[[
--  undefined (nil)
--]]

nil_mt.__tostring = function (arg)
  return 'undefined'
end

nil_mt.__add = function (op1, op2)
  return "null" + op2
end

nil_mt.__eq = function (op1, op2)
  return op2 == nil
end

nil_mt.__lt = function (op1, op2)
  return op2 > 0
end

nil_mt.__le = function (op1, op2)
  return op2 >= 0
end


--[[
--  Object
--]]

function js_obj_index (self, key)
  return js_proto_get(self, obj_proto, key)
end

function js_obj (o)
  local mt = getmetatable(o) or {}
  local proto = obj_proto
  if o.__proto__ then
    proto = o.__proto__
    o.__proto__ = nil
  end
  mt.__index = function (self, key)
    return js_proto_get(self, proto, key)
  end
  mt.__newindex = function (this, key, value)
    if key == '__proto__' then
      mt.proto = value
      mt.__index = function (self, key)
        return js_proto_get(self, value, key)
      end
    else
      rawset(this, key, value)
    end
  end
  mt.__tostring = js_tostring
  mt.__tovalue = js_valueof
  mt.proto = proto
  setmetatable(o, mt)
  return o
end

-- all prototypes inherit from object

js_obj(func_proto)
js_obj(num_proto)
js_obj(bool_proto)
js_obj(str_proto)
js_obj(arr_proto)


--[[
--  Function
--]]

-- Functions don't have objects on them by default
-- so when we access an __index or __newindex, we 
-- set up an intermediary object to handle it

setmetatable(funcproxies, {__mode = 'k'})

function js_func_proxy (fn)
  local proxy = rawget(funcproxies, fn)
  if not proxy then
    proxy = {}
    setmetatable(proxy, {
      __index = function (self, key)
        return js_proto_get(self, func_proto, key)
      end,
      proto = func_proto
    })
    rawset(funcproxies, fn, proxy)
  end
  return proxy
end

func_mt.__index = function (self, key)
  if key == 'prototype' then
    local proxy = js_func_proxy(self)
    if proxy.prototype == nil then
      proxy.prototype = js_obj({constructor = self})
    end
    return proxy.prototype
  end

  local proxy = rawget(funcproxies, self)
  if proxy then
    return js_proto_get(self, proxy, key)
  end
  return js_proto_get(self, func_proto, key)
end
func_mt.__newindex = function (this, key, value)
  local proxy = js_func_proxy(this)
  proxy[key] = value
end
func_mt.__tostring = js_tostring
func_mt.__tovalue = js_valueof
-- func_mt.__tostring = function ()
--   return "[Function]"
-- end
func_mt.proto = func_proto


--[[
--  String
--]]

str_mt.getters = {
  length = function (ths)
    return string.len(ths)
  end
}
str_mt.values = {}
str_mt.__index = function (self, key)
  -- custom js_getter_index for strings 
  -- allows numerical indices
  local mt = getmetatable(self)
  local getter = mt.getters[key]
  if getter then
    return getter(self, key)
  end
  if (tonumber(key) == key) then
    if key >= self.length then
      return null
    else
      return string.sub(self, key+1, key+1)
    end
  end
  return js_proto_get(self, str_proto, key)
end
str_mt.__add = function (op1, op2)
  return op1 .. tostring(op2)
end
str_mt.proto = str_proto


--[[
--  Array
--]]

function array_getter_length (this)
  return math.max((this[0] ~= nil and {#this + 1} or {#this})[1], getmetatable(this).length)
end

function array_setter (this, key, val)
  if type(key) == 'number' then
    local mt = getmetatable(this)
    mt.length = math.max(mt.length, (tonumber(key) or 0) + 1)
  end
  rawset(this, key, val)
end

function js_arr (arr, len)
  if len == nil then
    len = #arr
    if len > 1 or arr[0] ~= nil then
      len = len + 1
    end
  end

  setmetatable(arr, {
    getters = {
      length = array_getter_length
    },
    values = {},
    length = len,
    __index = js_getter_index(arr_proto),
    __newindex = array_setter,
    __tostring = js_tostring,
    __valueof = js_valueof,
    proto = arr_proto
  })
  return arr
end

--[[
--  "null" object (nil == undefined)
--]]

local js_null = {
  __tostring = function ()
    return 'null'
  end
}


--[[
--  void
--]]

local function js_void () end

local function js_next (a, b, c)
  local mt = getmetatable(a)
  if b == nil and mt and ((mt.length ~= nil and mt.length > 0) or rawget(a, 0)) then
    return 0
  end
  if type(b) == 'number' and mt and mt.length ~= nil then
    if b < a.length - 1 then
      return b + 1
    end
    b = nil
  end
  local k = b
  repeat
    k = next(a, k)
  until mt.length == nil or type(k) ~= 'number'
  return k
end

-- pairs

function js_pairs (arg)
  if type(arg) == 'function' then
    return pairs({})
  elseif type(arg) == 'string' then
    -- todo what
    return js_next, {}
  else
    return js_next, (arg or {})
  end
end

-- typeof operator

function js_typeof (arg)
  if arg == nil then
    return 'undefined'
  elseif type(arg) == 'table' then
    return 'object'
  end
  return type(arg)
end

-- instanceof

function js_instanceof (self, arg)
  local mt = getmetatable(self)
  if mt and arg then
    local proto = getmetatable(self).proto
    if proto then
      return proto == arg.prototype or js_instanceof(proto, arg)
    end
  end
  return false
end

-- "new" invocation

function js_new (f, ...)
  if type(f) ~= 'function' then
    error('TypeError: object is not a function')
  end
  local o = {}
  local mt = {
    __index = function (self, key)
      return js_proto_get(self, f.prototype, key)
    end,
    __newindex = function (this, key, value)
      if key == '__proto__' then
        local mt = getmetatable(this)
        mt.proto = value
        mt.__index = function (self, key)
          return js_proto_get(self, value, key)
        end
      else
        rawset(this, key, value)
      end
    end,
    __tostring = js_tostring,
    __tovalue = js_valueof,
    proto = f.prototype
  }
  setmetatable(o, mt)
  return f(o, ...) or o
end

-- arguments objects

function js_arguments (...)
  local a, len = {}, select('#', ...)
  for i=1,len do
    local val, _ = select(i, ...)
    table.insert(a, i-1, val)
  end

  local obj = global._obj(a);
  obj.length = len
  return obj
end


-- break/cont flags

local js_break = {}
local js_cont = {}

-- sequence

function js_seq (list)
  return table.remove(list)
end

-- in

function js_in (key, obj)
  return obj[key] ~= nil
end

-- with

function js_with (env, fn)
  local genv = getfenv(2)

  local locals = {}
  local idx = 1
  while true do
    local ln, lv = debug.getlocal(2, idx)
    if ln ~= nil then
      locals[ln] = idx
    else
      break
    end
    idx = 1 + idx
  end
  
  local mt = getmetatable(env) or {};

  mt.__index = function (this, key)
    if locals[key] ~= nil then
      local ln, lv = debug.getlocal(4, locals[key])
      return lv
    else
      return genv[key]
    end
  end

  mt.__newindex = function (this, key, value)
    if locals[key] ~= nil then
      debug.setlocal(4, locals[key], value)
    else
      genv[key] = value
    end
  end

  setmetatable(env, mt);

  setfenv(fn, env)
  
  return fn(js_with)
end


--[[
--  Public API
--]]

colony = {
  js_arr = js_arr,
  js_obj = js_obj,
  js_new = js_new,
  js_tostring = js_tostring,
  js_valueof = js_valueof,
  js_instanceof = js_instanceof,
  js_void = js_void,
  js_pairs = js_pairs,
  js_typeof = js_typeof,
  js_arguments = js_arguments,
  js_break = js_break,
  js_cont = js_cont,
  js_seq = js_seq,
  js_in = js_in,
  js_setter_index = js_setter_index,
  js_getter_index = js_getter_index,
  js_proto_get = js_proto_get,
  js_func_proxy = js_func_proxy,
  js_with = js_with,

  obj_proto = obj_proto,
  bool_proto = bool_proto,
  num_proto = num_proto,
  func_proto = func_proto,
  str_proto = str_proto,
  arr_proto = arr_proto,
  regex_proto = regex_proto
}

-- Load standard library

require('std')(colony)

if true then
  require('node-tm')(colony)
end

return colony
