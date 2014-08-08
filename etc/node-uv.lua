return function (colony)

local bit = require('bit32')
local uv = uv_open()

-- locals

local js_arr = colony.js_arr
local js_obj = colony.js_obj
local js_new = colony.js_new
local js_tostring = colony.js_tostring
local js_instanceof = colony.js_instanceof
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

local obj_proto = colony.obj_proto
local num_proto = colony.num_proto
local func_proto = colony.func_proto
local str_proto = colony.str_proto
local arr_proto = colony.arr_proto
local regex_proto = colony.regex_proto

local global = colony.global


--[[
--|| Buffer
--]]

if _G._colony_global_Buffer then
  global.Buffer = _G._colony_global_Buffer

  global.Buffer.byteLength = function (this, msg)
    return type(msg) == 'string' and string.len(msg) or msg.length
  end
end


--[[
--|| process
--]]

global.process = js_obj({
  memoryUsage = function (ths)
    return js_obj({
      heapUsed=collectgarbage('count')*1024
    });
  end,
  platform = "colony",
  binding = function (self, key)
    return _G['_colony_binding_' + key](global);
  end,
  versions = js_obj({
    node = "0.10.0",
    colony = "0.1.0"
  }),
  env = js_obj({}),
  stdin = js_obj({
    resume = function () end,
    setEncoding = function () end
  }),
  stdout = js_obj({})
})


--[[
--|| global variables
--]]

global:__defineGetter__('____dirname', function (this)
  return string.gsub(string.sub(debug.getinfo(2).source, 2), "/?[^/]+$", "")
end)

global:__defineGetter__('____filename', function (this)
  return string.sub(debug.getinfo(2).source, 2)
end)

end
