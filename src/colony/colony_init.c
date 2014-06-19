// Copyright 2014 Technical Machine, Inc. See the COPYRIGHT
// file at the top-level directory of this distribution.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

// This file is for gradual deprecation of functions in colony-init.lua

#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>

#include <string.h>

/*
local function js_proto_get (self, proto, key)
   if key == '__proto__' then return proto; end
   proto = rawget(funcproxies, proto) or proto
   return rawget(proto, key) or (getmetatable(proto) and getmetatable(proto).__index and getmetatable(proto).__index(self, key, proto)) or nil
end
*/

// This is an overload for the __index function on JavaScript objects.
// Using the __index inheritance chain causes Lua to use the wrong "this" value
// for getters.
// It also serves for serving __proto__, and for serving properties of functions
// (which are not objects).

static int js_proto_get (lua_State* L)
{
	// stack: self, proto, key

	// if key == '__proto__' then return proto; end
	size_t len = 0;
	char const* s = lua_tolstring(L, 3, &len);
	if (len == 9 && !memcmp(s, "__proto__", 9)) {
		lua_pushvalue(L, 2);
		return 1;
	}

	// proto = rawget(funcproxies, proto) or proto
	if (lua_isfunction(L, 2)) {
		lua_getglobal(L, "funcproxies");
		lua_pushvalue(L, 2);
		lua_rawget(L, -2);
		if (lua_isnil(L, -1)) {
			return 1;
		}
	} else {
		lua_pushvalue(L, 2);
	}

	// -- self, proto, key ... proto
	lua_pushvalue(L, 3);
	// -- self, proto, key ... proto, key
	lua_rawget(L, -2);
	// -- self, proto, key ... proto, rawget(proto, key)
	if (!lua_isnil(L, -1)) {
		return 1;
	} else {
		// -- self, proto, key ... proto, nil
		lua_remove(L, -1);
	}

	// -- self, proto, key ... proto
	if (lua_getmetatable(L, -1) != 0) {
		// -- self, proto, key ... proto, mt(proto)
		lua_getfield(L, -1, "__index");
		// -- self, proto, key ... proto, mt(proto).__index
		if (lua_isfunction(L, -1)) {
			lua_remove(L, -2);
			lua_pushvalue(L, 1);
			// -- self, proto, key ... proto, mt(proto).__index, self
			lua_pushvalue(L, 3);
			// -- self, proto, key ... proto, mt(proto).__index, self, key
			lua_pushvalue(L, -4);
			// -- self, proto, key ... proto, mt(proto).__index, self, key, proto
			lua_call(L, 3, 1);
			return 1;
		}
	}
	lua_pushnil(L);
	return 1;
}

/*
local function js_getter_index (self, key, _self)
	local mt = getmetatable(_self or self)
	local getter = mt.getters[key]
	if getter then
		return getter(self)
	end
	return rawget(_self or self, key) or js_proto_get(self, mt.proto, key)
end
*/

static int js_getter_index (lua_State* L)
{
	// stack: self, key, _self

	while (lua_gettop(L) < 3) {
		lua_pushnil(L);
	}

	// _self or self
	if (lua_isnil(L, 3)) {
		lua_pushvalue(L, 1);
	} else {
		lua_pushvalue(L, 3);
	}

	if (lua_getmetatable(L, -1) == 0) {
		lua_pushnil(L);
		return 1;
	}

	// stack: self, key, _self, (_self or self), mt
	// Check getters
	lua_getfield(L, -1, "getters");
	if (!lua_isnil(L, -1)) {
		lua_pushvalue(L, 2);
		lua_rawget(L, -2);
		if (!lua_isnil(L, -1)) {
			lua_pushvalue(L, 1);
			lua_call(L, 1, 1);
			return 1;
		}
		lua_remove(L, -1);
	}
	lua_remove(L, -1);

	// stack: self, key, _self, (_self or self), mt
	// Get raw key or defer to proto getter
	lua_pushvalue(L, 2);
	// stack: self, key, _self, (_self or self), mt, key
	lua_rawget(L, -3);

	// stack: self, key, _self, (_self or self), mt, (_self or self)[key]
	if (lua_isnil(L, -1)) {
		// stack: self, key, _self, (_self or self), mt, nil
		lua_pushcfunction(L, js_proto_get);
		// stack: self, key, _self, (_self or self), mt, nil, fn
		lua_pushvalue(L, 1);
		// stack: self, key, _self, (_self or self), mt, nil, fn, self
		lua_getfield(L, -4, "proto");
		// stack: self, key, _self, (_self or self), mt, nil, fn, self, mt.proto
		lua_pushvalue(L, 2);
		// stack: self, key, _self, (_self or self), mt, nil, fn, self, mt.proto, key
		lua_call(L, 3, 1);
		return 1;
	}

	return 1;
}

/*
function array_getter_length (this)
  return math.max((this[0] ~= nil and {#this + 1} or {#this})[1], getmetatable(this).length)
end
*/

// This function is a getter for the array length property.

static int array_getter_length (lua_State* L)
{
	// -- this

	size_t len = lua_objlen(L, 1);

	lua_pushnumber(L, 0);
	lua_rawget(L, 1);
	if (!lua_isnil(L, -1)) {
		len = len + 1;
	}

	// -- self, proto, key ... proto
	size_t mt_len = 0;
	if (lua_getmetatable(L, 1) != 0) {
		// -- self, proto, key ... proto, mt(proto)
		lua_getfield(L, -1, "length");
		mt_len = lua_tonumber(L, -1);
	}

	lua_pushnumber(L, len > mt_len ? len : mt_len);
	return 1;
}

void colony_init (lua_State* L)
{
	lua_pushcfunction(L, js_proto_get);
	lua_setglobal(L, "js_proto_get");

	lua_pushcfunction(L, js_getter_index);
	lua_setglobal(L, "js_getter_index");

	lua_pushcfunction(L, array_getter_length);
	lua_setglobal(L, "array_getter_length");
}
