-- Copyright 2014 Technical Machine, Inc. See the COPYRIGHT
-- file at the top-level directory of this distribution.
--
-- Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
-- http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
-- <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
-- option. This file may not be copied, modified, or distributed
-- except according to those terms.

--
-- colony-init.lua
-- Initialize metatables, operators, and prototypes.
--

-- requires
-- $ luarocks install bit32

local bit = require('bit32')

-- local logger = assert(io.open('colony.log', 'w+'))
-- debug.sethook(function ()
--   logger:write(debug.traceback())
--   logger:write('\n\n')
-- end, 'c', 1000)

-- lua methods

-- tonumber that returns NaN instead of nil
_G.tonumbervalue = function (val)
  val = tonumber(val)
  if val == nil then
    return 0/0
  else
    return val
  end
end

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

local obj_proto, func_proto, bool_proto, num_proto, str_proto, arr_proto, regex_proto, date_proto = {}, {}, {}, {}, {}, {}, {}, {}
funcproxies = {}

_G.funcproxies = funcproxies

-- NOTE: js_proto_get defined in colony_init.c
-- NOTE: js_getter_index defined in colony_init.c

local function js_setter_index (proto)
  return function (self, key, value)
    local mt = getmetatable(self)
    local setter = mt.setters[key]
    if setter then
      return setter(self, value)
    end
    rawset(self, key, value)
  end
end

function js_define_setter (self, key, fn)
  if type(self) == 'function' then
    self = js_func_proxy(self)
  end

  local mt = get_unique_metatable(self)
  rawset(self, key, nil)
  if not mt.getters then
    mt.getters = {}
    mt.__index = js_getter_index
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

  local mt = get_unique_metatable(self)
  rawset(self, key, nil)
  if not mt.getters then
    mt.getters = {}
    mt.__index = js_getter_index
  end
  if not mt.setters then
    mt.setters = {}
    mt.__newindex = js_setter_index(mt.proto)
  end

  mt.getters[key] = fn
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
  if op1 == nil then
    op1 = 'null'
  end
  if op2 == nil and type(op1) == 'string' then
    op2 = 'null'
  elseif op2 == nil then
    op2 = 0
  end
  return op1 + op2
end

nil_mt.__sub = function (op1, op2)
  return (tonumber(op1) or 0) - (tonumber(op2) or 0)
end

nil_mt.__mul = function (op1, op2)
  return (tonumber(op1) or 0) * (tonumber(op2) or 0)
end

nil_mt.__div = function (op1, op2)
  return (tonumber(op1) or 0) / (tonumber(op2) or 0)
end

nil_mt.__mod = function (op1, op2)
  return (tonumber(op1) or 0) % (tonumber(op2) or 0)
end

nil_mt.__pow = function (op1, op2)
  return (tonumber(op1) or 0) ^ (tonumber(op2) or 0)
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

function get_unique_metatable (this)
  local mt = getmetatable(this)
  if mt and mt.shared then
    setmetatable(this, {
      __index = mt.__index,
      __newindex = mt.__newindex,
      __tostring = mt.__tostring,
      __tovalue = mt.__tovalue,
      proto = mt.proto,
      shared = false
    });
    return getmetatable(this)
  end
  return mt
end

function js_obj_index (self, key)
  return js_proto_get(self, obj_proto, key)
end

function js_obj_newindex (this, key, value)
  if key == '__proto__' then
    local mt = get_unique_metatable(this)
    mt.proto = value
    mt.__index = function (self, key)
      return js_proto_get(self, value, key)
    end
  else
    rawset(this, key, value)
  end
end

local js_obj_mt = {
  __index = js_obj_index,
  __newindex = js_obj_newindex,
  __tostring = js_tostring,
  __tovalue = js_valueof,
  proto = obj_proto,
  shared = true
};

function js_obj (o)
  if rawget(o, '__proto__') then
    local proto = o.__proto__
    rawset(o, '__proto__', nil)
    setmetatable(o, js_obj_mt)
    o.__proto__ = proto
  else
    setmetatable(o, js_obj_mt)
  end
  return o
end

-- all prototypes inherit from object

js_obj(func_proto)
js_obj(num_proto)
js_obj(bool_proto)
js_obj(str_proto)
js_obj(arr_proto)
js_obj(regex_proto)
js_obj(date_proto)


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
    proxy = js_obj({})
    proxy.__proto__ = func_proto
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
  return tostring(op1) .. tostring(op2)
end
str_mt.proto = str_proto


--[[
--  Array
--]]

function array_setter (this, key, val)
  if type(key) == 'number' then
    rawset(this, 'length', math.max(rawget(this, 'length'), (tonumber(key) or 0) + 1))
  end
  if key ~= 'length' then
    rawset(this, key, val)
  end
end

function js_arr_index (self, key)
  return js_proto_get(self, arr_proto, key)
end

local arr_mt_cached = {
  __index = js_arr_index,
  __newindex = array_setter,
  __tostring = js_tostring,
  __valueof = js_valueof,
  proto = arr_proto,
  shared = true
}

function js_arr (arr, len)
  if len == nil then
    error('js_arr invoked without length')
  end

  rawset(arr, 'length', len)
  setmetatable(arr, arr_mt_cached)
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

-- a = object, b = last value
local function js_next (a, b, c)
  local len = rawget(a, 'length')
  local mt = getmetatable(a)

  -- first value in arrays should be 0
  if b == nil and type(len) == 'number' and len > 0 then
    return 0
  end

  -- next value after 0 should be 1
  if type(b) == 'number' and len then
    if b < len - 1 then
      return b + 1
    end
    b = nil
  end
  local k = b
  repeat
    k = next(a, k)
  until (len == nil or type(k) ~= 'number') and not (k == 'length' and mt.proto == arr_proto)
  return k
end

-- pairs

function js_pairs (arg)
  if type(arg) == 'function' then
    arg = js_func_proxy(arg)
  end
  if type(arg) == 'string' then
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
    error(js_new(global.TypeError, 'object is not a function'))
  end
  local o = {}
  local mt = {
    __index = function (self, key)
      return js_proto_get(self, f.prototype, key)
    end,
    __newindex = function (this, key, value)
      if key == '__proto__' then
        local mt = get_unique_metatable(this)
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
  get_unique_metatable(obj).arguments = true
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

  local mt = get_unique_metatable(env) or {};

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

colony.js_arr = js_arr
colony.js_obj = js_obj
colony.js_new = js_new
colony.js_tostring = js_tostring
colony.js_valueof = js_valueof
colony.js_instanceof = js_instanceof
colony.js_void = js_void
colony.js_pairs = js_pairs
colony.js_typeof = js_typeof
colony.js_arguments = js_arguments
colony.js_break = js_break
colony.js_cont = js_cont
colony.js_seq = js_seq
colony.js_in = js_in
colony.js_setter_index = js_setter_index
colony.js_getter_index = js_getter_index
colony.js_define_getter = js_define_getter
colony.js_define_setter = js_define_setter
colony.js_proto_get = js_proto_get
colony.js_func_proxy = js_func_proxy
colony.js_with = js_with

colony.obj_proto = obj_proto
colony.bool_proto = bool_proto
colony.num_proto = num_proto
colony.func_proto = func_proto
colony.str_proto = str_proto
colony.arr_proto = arr_proto
colony.regex_proto = regex_proto
colony.date_proto = date_proto
