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

local global = colony.global

-- Shorthand for helper functions in compiled code.

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

end