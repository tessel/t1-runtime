print('STARTING COLONYLIB: ' .. collectgarbage('count'));

--[[
References:
  https://github.com/mirven/underscore.lua/blob/master/lib/underscore.lua
  https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String/slice
]]--

local pairs, type, tostring, tonumber, getmetatable, setmetatable, rawset =
      pairs, type, tostring, tonumber, getmetatable, setmetatable, rawset
local error, require, pcall, select = error, require, pcall, select
local floor, huge = math.floor, math.huge
local strrep, gsub, strsub, strbyte, strchar, strfind, strlen, strformat =
      string.rep, string.gsub, string.sub, string.byte, string.char,
      string.find, string.len, string.format
local concat = table.concat

local json = { version = "dkjson 2.2" }

pcall (function()
  -- Enable access to blocked metatables.
  -- Don't worry, this module doesn't change anything in them.
  local debmeta = require "debug".getmetatable
  if debmeta then getmetatable = debmeta end
end)

json.null = setmetatable ({}, {
  __tojson = function () return "null" end
})

local function isarray (tbl)
  local max, n, arraylen = 0, 0, 0
  for k,v in pairs (tbl) do
    if k == 'n' and type(v) == 'number' then
      arraylen = v
      if v > max then
        max = v
      end
    else
      if type(k) ~= 'number' or k < 1 or floor(k) ~= k then
        return false
      end
      if k > max then
        max = k
      end
      n = n + 1
    end
  end
  if max > 10 and max > arraylen and max > n * 2 then
    return false -- don't create an array with too many holes
  end
  return true, max
end

local escapecodes = {
  ["\""] = "\\\"", ["\\"] = "\\\\", ["\b"] = "\\b", ["\f"] = "\\f",
  ["\n"] = "\\n",  ["\r"] = "\\r",  ["\t"] = "\\t"
}

local function escapeutf8 (uchar)
  local value = escapecodes[uchar]
  if value then
    return value
  end
  local a, b, c, d = strbyte (uchar, 1, 4)
  a, b, c, d = a or 0, b or 0, c or 0, d or 0
  if a <= 0x7f then
    value = a
  elseif 0xc0 <= a and a <= 0xdf and b >= 0x80 then
    value = (a - 0xc0) * 0x40 + b - 0x80
  elseif 0xe0 <= a and a <= 0xef and b >= 0x80 and c >= 0x80 then
    value = ((a - 0xe0) * 0x40 + b - 0x80) * 0x40 + c - 0x80
  elseif 0xf0 <= a and a <= 0xf7 and b >= 0x80 and c >= 0x80 and d >= 0x80 then
    value = (((a - 0xf0) * 0x40 + b - 0x80) * 0x40 + c - 0x80) * 0x40 + d - 0x80
  else
    return ""
  end
  if value <= 0xffff then
    return strformat ("\\u%.4x", value)
  elseif value <= 0x10ffff then
    -- encode as UTF-16 surrogate pair
    value = value - 0x10000
    local highsur, lowsur = 0xD800 + floor (value/0x400), 0xDC00 + (value % 0x400)
    return strformat ("\\u%.4x\\u%.4x", highsur, lowsur)
  else
    return ""
  end
end

local function fsub (str, pattern, repl)
  -- gsub always builds a new string in a buffer, even when no match
  -- exists. First using find should be more efficient when most strings
  -- don't contain the pattern.
  if strfind (str, pattern) then
    return gsub (str, pattern, repl)
  else
    return str
  end
end

local function quotestring (value)
  -- based on the regexp "escapable" in https://github.com/douglascrockford/JSON-js
  value = fsub (value, "[%z\1-\31\"\\\127]", escapeutf8)
  if strfind (value, "[\194\216\220\225\226\239]") then
    value = fsub (value, "\194[\128-\159\173]", escapeutf8)
    value = fsub (value, "\216[\128-\132]", escapeutf8)
    value = fsub (value, "\220\143", escapeutf8)
    value = fsub (value, "\225\158[\180\181]", escapeutf8)
    value = fsub (value, "\226\128[\140-\143\168\175]", escapeutf8)
    value = fsub (value, "\226\129[\160-\175]", escapeutf8)
    value = fsub (value, "\239\187\191", escapeutf8)
    value = fsub (value, "\239\191[\176\191]", escapeutf8)
  end
  return "\"" .. value .. "\""
end
json.quotestring = quotestring

local function addnewline2 (level, buffer, buflen)
  buffer[buflen+1] = "\n"
  buffer[buflen+2] = strrep ("  ", level)
  buflen = buflen + 2
  return buflen
end

function json.addnewline (state)
  if state.indent then
    state.bufferlen = addnewline2 (state.level or 0,
                           state.buffer, state.bufferlen or #(state.buffer))
  end
end

local encode2 -- forward declaration

local function addpair (key, value, prev, indent, level, buffer, buflen, tables, globalorder)
  local kt = type (key)
  if kt ~= 'string' and kt ~= 'number' then
    return nil, "type '" .. kt .. "' is not supported as a key by JSON."
  end
  if prev then
    buflen = buflen + 1
    buffer[buflen] = ","
  end
  if indent then
    buflen = addnewline2 (level, buffer, buflen)
  end
  buffer[buflen+1] = quotestring (key)
  buffer[buflen+2] = ":"
  return encode2 (value, indent, level, buffer, buflen + 2, tables, globalorder)
end

encode2 = function (value, indent, level, buffer, buflen, tables, globalorder)
  local valtype = type (value)
  local valmeta = getmetatable (value)
  valmeta = type (valmeta) == 'table' and valmeta -- only tables
  local valtojson = valmeta and valmeta.__tojson
  if valtojson then
    if tables[value] then
      return nil, "reference cycle"
    end
    tables[value] = true
    local state = {
        indent = indent, level = level, buffer = buffer,
        bufferlen = buflen, tables = tables, keyorder = globalorder
    }
    local ret, msg = valtojson (value, state)
    if not ret then return nil, msg end
    tables[value] = nil
    buflen = state.bufferlen
    if type (ret) == 'string' then
      buflen = buflen + 1
      buffer[buflen] = ret
    end
  elseif value == nil then
    buflen = buflen + 1
    buffer[buflen] = "null"
  elseif valtype == 'number' then
    local s
    if value ~= value or value >= huge or -value >= huge then
      -- This is the behaviour of the original JSON implementation.
      s = "null"
    else
      s = tostring (value)
    end
    buflen = buflen + 1
    buffer[buflen] = s
  elseif valtype == 'boolean' then
    buflen = buflen + 1
    buffer[buflen] = value and "true" or "false"
  elseif valtype == 'string' then
    buflen = buflen + 1
    buffer[buflen] = quotestring (value)
  elseif valtype == 'table' then
    if tables[value] then
      return nil, "reference cycle"
    end
    tables[value] = true
    level = level + 1
    local isa, n = isarray (value)
    if n == 0 and valmeta and valmeta.__jsontype == 'object' then
      isa = false
    end
    local msg
    if isa then -- JSON array
      buflen = buflen + 1
      buffer[buflen] = "["
      for i = 1, n do
        buflen, msg = encode2 (value[i], indent, level, buffer, buflen, tables, globalorder)
        if not buflen then return nil, msg end
        if i < n then
          buflen = buflen + 1
          buffer[buflen] = ","
        end
      end
      buflen = buflen + 1
      buffer[buflen] = "]"
    else -- JSON object
      local prev = false
      buflen = buflen + 1
      buffer[buflen] = "{"
      local order = valmeta and valmeta.__jsonorder or globalorder
      if order then
        local used = {}
        n = #order
        for i = 1, n do
          local k = order[i]
          local v = value[k]
          if v then
            used[k] = true
            buflen, msg = addpair (k, v, prev, indent, level, buffer, buflen, tables, globalorder)
            prev = true -- add a seperator before the next element
          end
        end
        for k,v in pairs (value) do
          if not used[k] then
            buflen, msg = addpair (k, v, prev, indent, level, buffer, buflen, tables, globalorder)
            if not buflen then return nil, msg end
            prev = true -- add a seperator before the next element
          end
        end
      else -- unordered
        for k,v in pairs (value) do
          buflen, msg = addpair (k, v, prev, indent, level, buffer, buflen, tables, globalorder)
          if not buflen then return nil, msg end
          prev = true -- add a seperator before the next element
        end
      end
      if indent then
        buflen = addnewline2 (level - 1, buffer, buflen)
      end
      buflen = buflen + 1
      buffer[buflen] = "}"
    end
    tables[value] = nil
  else
    return nil, "type '" .. valtype .. "' is not supported by JSON."
  end
  return buflen
end

function json.encode (value, state)
  state = state or {}
  local oldbuffer = state.buffer
  local buffer = oldbuffer or {}
  local ret, msg = encode2 (value, state.indent, state.level or 0,
                   buffer, state.bufferlen or 0, state.tables or {}, state.keyorder)
  if not ret then
    error (msg, 2)
  elseif oldbuffer then
    state.bufferlen = ret
    return true
  else
    return concat (buffer)
  end
end

local function loc (str, where)
  local line, pos, linepos = 1, 1, 0
  while true do
    pos = strfind (str, "\n", pos, true)
    if pos and pos < where then
      line = line + 1
      linepos = pos
      pos = pos + 1
    else
      break
    end
  end
  return "line " .. line .. ", column " .. (where - linepos)
end

local function unterminated (str, what, where)
  return nil, strlen (str) + 1, "unterminated " .. what .. " at " .. loc (str, where)
end

local function scanwhite (str, pos)
  while true do
    pos = strfind (str, "%S", pos)
    if not pos then return nil end
    if strsub (str, pos, pos + 2) == "\239\187\191" then
      -- UTF-8 Byte Order Mark
      pos = pos + 3
    else
      return pos
    end
  end
end

local escapechars = {
  ["\""] = "\"", ["\\"] = "\\", ["/"] = "/", ["b"] = "\b", ["f"] = "\f",
  ["n"] = "\n", ["r"] = "\r", ["t"] = "\t"
}

local function unichar (value)
  if value < 0 then
    return nil
  elseif value <= 0x007f then
    return strchar (value)
  elseif value <= 0x07ff then
    return strchar (0xc0 + floor(value/0x40),
                    0x80 + (floor(value) % 0x40))
  elseif value <= 0xffff then
    return strchar (0xe0 + floor(value/0x1000),
                    0x80 + (floor(value/0x40) % 0x40),
                    0x80 + (floor(value) % 0x40))
  elseif value <= 0x10ffff then
    return strchar (0xf0 + floor(value/0x40000),
                    0x80 + (floor(value/0x1000) % 0x40),
                    0x80 + (floor(value/0x40) % 0x40),
                    0x80 + (floor(value) % 0x40))
  else
    return nil
  end
end

local function scanstring (str, pos)
  local lastpos = pos + 1
  local buffer, n = {}, 0
  while true do
    local nextpos = strfind (str, "[\"\\]", lastpos)
    if not nextpos then
      return unterminated (str, "string", pos)
    end
    if nextpos > lastpos then
      n = n + 1
      buffer[n] = strsub (str, lastpos, nextpos - 1)
    end
    if strsub (str, nextpos, nextpos) == "\"" then
      lastpos = nextpos + 1
      break
    else
      local escchar = strsub (str, nextpos + 1, nextpos + 1)
      local value
      if escchar == "u" then
        value = tonumber (strsub (str, nextpos + 2, nextpos + 5), 16)
        if value then
          local value2
          if 0xD800 <= value and value <= 0xDBff then
            -- we have the high surrogate of UTF-16. Check if there is a
            -- low surrogate escaped nearby to combine them.
            if strsub (str, nextpos + 6, nextpos + 7) == "\\u" then
              value2 = tonumber (strsub (str, nextpos + 8, nextpos + 11), 16)
              if value2 and 0xDC00 <= value2 and value2 <= 0xDFFF then
                value = (value - 0xD800)  * 0x400 + (value2 - 0xDC00) + 0x10000
              else
                value2 = nil -- in case it was out of range for a low surrogate
              end
            end
          end
          value = value and unichar (value)
          if value then
            if value2 then
              lastpos = nextpos + 12
            else
              lastpos = nextpos + 6
            end
          end
        end
      end
      if not value then
        value = escapechars[escchar] or escchar
        lastpos = nextpos + 2
      end
      n = n + 1
      buffer[n] = value
    end
  end
  if n == 1 then
    return buffer[1], lastpos
  elseif n > 1 then
    return concat (buffer), lastpos
  else
    return "", lastpos
  end
end

local scanvalue -- forward declaration

local function scantable (what, closechar, str, startpos, nullval, objectmeta, arraymeta)
  local len = strlen (str)
  local tbl, n = {}, 0
  local pos = startpos + 1
  if what == 'object' then
    setmetatable (tbl, objectmeta)
  else
    setmetatable (tbl, arraymeta)
  end
  while true do
    pos = scanwhite (str, pos)
    if not pos then return unterminated (str, what, startpos) end
    local char = strsub (str, pos, pos)
    if char == closechar then
      return tbl, pos + 1
    end
    local val1, err
    val1, pos, err = scanvalue (str, pos, nullval, objectmeta, arraymeta)
    if err then return nil, pos, err end
    pos = scanwhite (str, pos)
    if not pos then return unterminated (str, what, startpos) end
    char = strsub (str, pos, pos)
    if char == ":" then
      if val1 == nil then
        return nil, pos, "cannot use nil as table index (at " .. loc (str, pos) .. ")"
      end
      pos = scanwhite (str, pos + 1)
      if not pos then return unterminated (str, what, startpos) end
      local val2
      val2, pos, err = scanvalue (str, pos, nullval, objectmeta, arraymeta)
      if err then return nil, pos, err end
      tbl[val1] = val2
      pos = scanwhite (str, pos)
      if not pos then return unterminated (str, what, startpos) end
      char = strsub (str, pos, pos)
    else
      n = n + 1
      tbl[n] = val1
    end
    if char == "," then
      pos = pos + 1
    end
  end
end

scanvalue = function (str, pos, nullval, objectmeta, arraymeta)
  pos = pos or 1
  pos = scanwhite (str, pos)
  if not pos then
    return nil, strlen (str) + 1, "no valid JSON value (reached the end)"
  end
  local char = strsub (str, pos, pos)
  if char == "{" then
    return scantable ('object', "}", str, pos, nullval, objectmeta, arraymeta)
  elseif char == "[" then
    return scantable ('array', "]", str, pos, nullval, objectmeta, arraymeta)
  elseif char == "\"" then
    return scanstring (str, pos)
  else
    local pstart, pend = strfind (str, "^%-?[%d%.]+[eE]?[%+%-]?%d*", pos)
    if pstart then
      local number = tonumber (strsub (str, pstart, pend))
      if number then
        return number, pend + 1
      end
    end
    pstart, pend = strfind (str, "^%a%w*", pos)
    if pstart then
      local name = strsub (str, pstart, pend)
      if name == "true" then
        return true, pend + 1
      elseif name == "false" then
        return false, pend + 1
      elseif name == "null" then
        return nullval, pend + 1
      end
    end
    return nil, pos, "no valid JSON value at " .. loc (str, pos)
  end
end

local function optionalmetatables(...)
  if select("#", ...) > 0 then
    return ...
  else
    return {__jsontype = 'object'}, {__jsontype = 'array'}
  end
end

function json.decode (str, pos, nullval, ...)
  local objectmeta, arraymeta = optionalmetatables(...)
  return scanvalue (str, pos, nullval, objectmeta, arraymeta)
end








-- requires
-- luarocks install bit32
-- luarocks install json
-- luarocks install lrexlib-pcre
local bit, json = require('bit32');
local _, rex = pcall(require, 'rex_pcre');

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
			if arr[0] then return table.getn(arr) + 1 end
			return table.getn(arr)
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
  table.insert(ths, ths.length, elem)
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
	return table.insert(ths, 0, elem)
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
			out:write(_JS.JSON:stringify(x))
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

-- process

_JS.process = _JS._obj({
	memoryUsage = function (ths)
		return _JS._obj({
			heapUsed=collectgarbage('count')*1024
		});
	end
})

-- json library

_JS.JSON = _JS._obj({
	parse = function (ths, arg)
		return json.decode(arg)
	end,
	stringify = function (ths, arg)
		return json.encode(arg, { indent = true })
	end,
})

-- return namespace

print('ENDING COLONYLIB: ' .. collectgarbage('count'));

return _JS