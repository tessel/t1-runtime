local rapidjson = require('rapidjson')
local js_tostring = colony.js_tostring

-- called by lua_rapidjson.c when a parsing error occurs
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

local function json_parse (value)
  -- Parse into a Lua structure.
  -- Non-object primitives require a wrapper.
  return rapidjson.parse('{"value":\n' .. tostring(value) .. '\n}', json_error).value
end

-- Checks initial type and recurses through object if it needs to
local function json_stringify (value, replacer, spacer)
  local val_copy = {}     -- copies of hits in the replacer array
  local call_ext = false  -- whether to call an external replacer function

  -- Fix spacer argument
  if type(spacer) == 'number' then
    spacer = string.rep(' ', spacer)
  else
    spacer = tostring(spacer or '')
  end
  spacer = string.sub(spacer, 1, 10)

  -- Call writer.
  local wh = rapidjson.create_writer(spacer)
  local status, err = pcall(rapidjson.write_value, wh, value, replacer)
  if not status then
    rapidjson.destroy(wh)
    error(err)
  end
  local str = rapidjson.result(wh)
  rapidjson.destroy(wh)

  return tostring(str)

end

return {
  parse = json_parse,
  stringify = json_stringify
}
