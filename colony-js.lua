--[[
References:
  https://github.com/mirven/underscore.lua/blob/master/lib/underscore.lua
  https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String/slice
]]--

-- namespace

local _JS = {}

-- built-in prototypes

local obj_proto, func_proto, bool_proto, num_proto, str_proto, arr_proto, regex_proto = {}, {}, {}, {}, {}, {}, {}

-- introduce metatables to built-in types using debug library:
-- this can cause conflicts with other modules if they utilize the string prototype
-- (or expect number/booleans to have metatables)

local func_mt, str_mt = {}, {}
debug.setmetatable((function () end), func_mt)
debug.setmetatable(true, {__index=bool_proto})
debug.setmetatable(0, {__index=num_proto})
debug.setmetatable("", str_mt)

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
	f.prototype = {}
	return f
end
local luafunctor = function (f)
	return (function (this, ...) return f(...) end)
end

func_mt.__index=function (t, p)
	if getmetatable(t)[t] and getmetatable(t)[t][p] ~= nil then
		return getmetatable(t)[t][p]
	end
	return func_proto[p]
end
func_mt.__newindex=function (t, p, v)
	local pt = getmetatable(t)[t] or {}
	pt[p] = v
	getmetatable(t)[t] = pt
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
	return op1 .. op2
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

-- "add" function to rectify lua's distinction of adding vs concatenation

_JS._add = function (a, b)
	if type(a) == "string" or type(b) == "string" then
		return a .. b
	else
		return a + b
	end
end

-- typeof operator

_JS._typeof = type

-- instanceof

_JS._instanceof = function ()
	return true
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
str_proto.substr = function (str, i)
	return string.sub(str, i+1)
end
str_proto.toLowerCase = function (str)
	return string.lower(str)
end
str_proto.toUpperCase = function (str)
	return string.upper(str)
end
str_proto.indexOf = function (str, needle)
	local ret = string.find(str, needle, 1, true) 
	if ret == null then return -1; else return ret - 1; end
end
str_proto.split = function (str, sep, max)
	if sep == '' then return _JS._arr({}) end

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

-- object prototype

obj_proto.hasInstance = function (ths, p)
	return toboolean(rawget(ths, p))
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
	return table.insert(ths, ths.length, elem)
end
arr_proto.pop = function (ths)
	return table.remove(ths, ths.length-1)
end
arr_proto.shift = function (ths)
	local ret = ths[0]
	ths[0] = table.remove(ths, 0)
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
arr_proto.slice = function (ths, len)
	local a = _JS._arr({})
	for i=len,ths.length-1 do
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

--[[
Globals
]]--

_JS.this = _G

-- Object

_JS.Object = {}
_JS.Object.prototype = obj_proto

-- Array

_JS.Array = luafunctor(function (one, ...)
	if #arg > 0 or type(one) ~= 'number' then
		arg[0] = one
		return _JS._arr(arg)
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
	return tostring(str)
end)
_JS.String.prototype = str_proto
_JS.String.fromCharCode = luafunctor(function (c)
	return string.char(c)
end)

-- Math

_JS.Math = _JS._obj({
	max = luafunctor(math.max),
	sqrt = luafunctor(math.sqrt),
	floor = luafunctor(math.floor)
})

-- Console

_JS.console = _JS._obj({
	log = luafunctor(function (x)
		if x == nil then 
			print("undefined")
		elseif x == null then
			print("null")
		else
			print(x)
		end
	end)
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

_JS._bit = require('bit')

-- regexp library

local f, rex = pcall(require, 'rex_pcre')
if f then
	_JS.Regexp = luafunctor(function (pat, flags)
		local r = rex.new(tostring(pat))
		debug.setmetatable(r, regex_proto)
		return r
	end)
end

-- return namespace

return _JS
