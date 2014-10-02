local rapidjson = require('rapidjson')
local js_tostring = colony.js_tostring

function json_parse (value)
  -- Parse into a Lua structure.
  -- Non-object primitives require a wrapper.
  return rapidjson.parse('{"value":\n' .. tostring(value) .. '\n}').value
end

-- Checks initial type and recurses through object if it needs to
function json_stringify (value, replacer, spacer)
  local val_copy = {}     -- copies of hits in the replacer array
  local call_ext = false  -- whether to call an external replacer function

  -- Fix spacer argument
  if type(spacer) == 'number' then
    spacer = string.rep(' ', spacer)
  else
    spacer = tostring(spacer or '')
  end
  spacer = string.sub(spacer, 1, 10)

  function repobj (value)
    if type(replacer) == 'table' then
      if not global.Array:isArray(value) then
        if next(value) then
          local val_copy = {}
          for i=0,#replacer do
            local k = tostring(replacer[i])
            if value[k] then
              val_copy[k] = value[k]
            end
          end
          return val_copy
        end
      end
    end
    return value
  end

  -- does what stringify does but can be called recursively
  function json_recurse (handler, value)
    if rapidjson.write_value(handler, value, replacer, json_recurse, repobj) then
    -- elseif type(value) == 'nil' then
    --   rapidjson.to_null(handler,value)
    -- elseif type(value) == 'boolean' then
    --   rapidjson.to_boolean(handler,value)
    -- elseif type(value) == 'number' then
    --   rapidjson.to_number(handler,value)
    -- elseif type(value) == 'string' then
    -- --   rapidjson.to_string(handler,value)
    -- else
    --   value = repobj(value)

    --   rapidjson.object_start(handler)
    --   for k, v in pairs(value) do
    --     local vt = type(v)
    --     if vt == 'function' or vt == 'userdata' or vt == 'thread' then
    --     else
    --       local rep = value
    --       if call_ext then rep = replacer(value,k,v) end
    --       if rep then
    --         if type(k) ~= 'table' then
    --           json_recurse(handler,tostring(k))
    --         else
    --           json_recurse(handler,k)
    --         end
    --         json_recurse(handler,v)
    --       end
    --     end
    --   end
    --   rapidjson.object_end(handler)
    end
  end

  local wh = rapidjson.create_writer(spacer)
  local status, err = pcall(json_recurse,wh,value)
  if not status then
    rapidjson.destroy(wh)
    error(err)
  end
  local str = rapidjson.result(wh)
  rapidjson.destroy(wh)
  return tostring(str)

end

-- called by lua_rapidjson.c when a parsing error occurs
function json_error(val,code,offset)

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

return {
  parse = json_parse,
  stringify = json_stringify
}
