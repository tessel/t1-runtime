local rapidjson = require('rapidjson')
local js_tostring = colony.js_tostring

-- Added rapidjson globals
-- TODO: eliminate zem
stack = {}
lua_table = nil
cur_table = nil
on_key = true
prev_k = nil
is_arr = false
arr_lvl = 0

-- Callback when a default value is parsed in json
function json_read_default()
  if is_arr then
    lua_table[arr_lvl] = ''
    arr_lvl = arr_lvl + 1
  else
    lua_table[prev_k] = ''
    on_key = true
  end
end

-- Callback when a null value is parsed in json
function json_read_null()
  if is_arr then
    lua_table[arr_lvl] = js_null
    arr_lvl = arr_lvl + 1
  else
    lua_table[prev_k] = js_null
    on_key = true
  end
end

-- Callback when a boolean is parsed in json
function json_read_value(value) json_read_double(value) end

-- Callback when a double is parsed in json
function json_read_double(value)
  if is_arr then
    lua_table[arr_lvl] = value
    arr_lvl = arr_lvl + 1
  else
    lua_table[prev_k] = value
    on_key = true
  end
end

-- Callback when a string is parsed in json
function json_read_string(value)
  if is_arr then
    lua_table[arr_lvl] = value
    arr_lvl = arr_lvl + 1
  elseif on_key then
    lua_table[value] = value
    prev_k = value
    on_key = false
  else
    lua_table[prev_k] = value
    on_key = true
  end
end

-- Callback when the start of an object is parsed in json
function json_read_start_object()
  if lua_table == nil then
    lua_table = js_obj({})
  else
    local parent_table = js_obj({})
    parent_table[prev_k] = lua_table
    table.insert(stack, parent_table)
    lua_table = js_obj({})
  end
  on_key = true
end

-- Callback when the end of an object is parsed in json
function json_read_end_object(value)
  local parent_table = table.remove(stack, #stack)
  if parent_table ~= nil then
    for k,v in pairs(parent_table) do
      v[k] = lua_table
      lua_table = parent_table[k]
    end
  end
  on_key = true
end

-- Callback when the start of an array is parsed in json
function json_read_start_array()
  if lua_table == nil then
    lua_table = js_arr({},0)
  else
    local parent_table = {}
    parent_table[prev_k] = lua_table
    table.insert(stack, parent_table)
    lua_table = js_arr({},0)
  end
  is_arr = true
end

-- Callback when the end of an array is parsed in json
function json_read_end_array(value)
  local parent_table = table.remove(stack, #stack)
  if parent_table ~= nil then
    for k,v in pairs(parent_table) do
      v[k] = lua_table
      lua_table = parent_table[k]
    end
  end
  is_arr = false
end

-- Checks initial type and recurses through object if it needs to
function json_stringify (value, ...)

  local val_copy = {}     -- copies of hits in the replacer array
  local call_ext = false  -- whether to call an external replacer function
  local replacer = nil    -- replacer function/array if provided
  local spacer = nil      -- spacer to insert if provided

  -- A guard to allow calls to json_stringify(value) with no replacer/spacer
  if arg[1] then
    replacer = arg[1]['replacer']
    spacer = arg[1]['indent']
  end

  if not spacer then
    spacer = ''
  elseif type(spacer) == 'number' then
    spacer = string.rep(' ', spacer)
  else
    spacer = tostring(spacer)
  end
  spacer = string.sub(spacer, 1, 10)

  -- does what stringify does but can be called recursively
  function json_recurse (handler, value)

    if type(value) == 'nil' then
      rapidjson.to_null(handler,value)
    elseif type(value) == 'boolean' then
      rapidjson.to_boolean(handler,value)
    elseif type(value) == 'number' then
      rapidjson.to_number(handler,value)
    elseif type(value) == 'string' then
      rapidjson.to_string(handler,value)
    elseif type(value) == 'table' then
      if global.Array:isArray(value) or (getmetatable(value) and getmetatable(value).buffer) then
        rapidjson.array_start(handler)
        for i=0,value.length-1 do
          if call_ext then replacer(value,i,value[i]) end
          local vt = type(value[i])
          if vt == 'function' or vt == 'userdata' or vt == 'thread' then
            rapidjson.to_null(handler,value)
          else json_recurse(handler,value[i]) end
        end
        rapidjson.array_end(handler)
      else
        local val_copy = {}
        if replacer then
          if type(replacer) == 'function' then
          elseif type(replacer) == 'table' then
            if global.Array:isArray(value) then
            elseif type(value) == 'table' then
              if next(value) then
                for i=0,#replacer do
                  local k = tostring(replacer[i])
                  if value[k] then
                    val_copy[k] = value[k]
                  end
                end
                value = val_copy
              end
            end
          end
        end
        rapidjson.object_start(handler)
        for k, v in pairs(value) do
          local vt = type(v)
          if vt == 'function' or vt == 'userdata' or vt == 'thread' then
          else
            local rep = value
            if call_ext then rep = replacer(value,k,v) end
            if rep then
              if type(k) ~= 'table' then
                json_recurse(handler,tostring(k))
              else
                json_recurse(handler,k)
              end
              json_recurse(handler,v)
            end
          end
        end
        rapidjson.object_end(handler)
      end
    else
      rapidjson.object_start(handler)
      rapidjson.object_end(handler)
    end
  end

  -- if the optional replacer is provided
  if replacer then
    if type(replacer) == 'function' then
      call_ext = true
    elseif type(replacer) == 'table' then
      call_ext = false
      if global.Array:isArray(value) then
      elseif type(value) == 'table' then
        if next(value) then
          for i=0,#replacer do
            local k = tostring(replacer[i])
            if value[k] then
              val_copy[k] = value[k]
            end
          end
          value = val_copy
        end
      end
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
  str = string.gsub(str,'%[null%]','%[%]') -- array workaround
  return tostring(str)

end

-- Parses the string into a lua table
function json_parse(value)

  -- rapidjson will throw an error if non-objects are passed in
  -- this circumvents those errors
  if value == 'true' or value == 'false' or tonumber(value) then
    return value
  end

  -- parse the value and set the lua table based off callbacks
  rapidjson.parse(value)

  -- reference it from here so we can clear the globals for another round
  local lua_table_cpy = lua_table

  -- clear the globals for the next round
  lua_table = nil
  cur_table = nil
  on_key = true
  prev_k = nil
  is_arr = false
  arr_lvl = 0

  -- return the parsed object to lua
  return lua_table_cpy

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
