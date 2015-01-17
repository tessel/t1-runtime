// Copyright 2014 Technical Machine, Inc. See the COPYRIGHT
// file at the top-level directory of this distribution.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>

#include <stdlib.h>
#include <string.h>
#include <stddef.h>
#include "colony.h"

void colony_createarray (lua_State* L, int size)
{
  lua_getglobal(L, "_colony");
  lua_getfield(L, -1, "global");
  lua_remove(L, -2);
  lua_pushliteral(L,"_arr");
  lua_gettable(L, -2);
  lua_remove(L, -2);
  lua_createtable(L, size > 0 ? size - 1 : size, size > 0 ? 1 : 0);
  lua_pushnumber(L, size);
  lua_call(L,2,1);
}

void colony_createobj (lua_State* L, int size, int proto)
{
  (void) proto;

  lua_getglobal(L, "_colony");
  lua_getfield(L, -1, "global");
  lua_remove(L, -2);
  lua_pushliteral(L,"_obj");
  lua_gettable(L, -2);
  lua_remove(L, -2);
  lua_createtable(L, 0, size);
  lua_call(L,1,1);
}

int colony_isarray (lua_State* L, int index)
{
  lua_getglobal(L, "colony_isarray");
  lua_pushnil(L);
  if (index < 0) {
    index -= 2;
  }
  lua_pushvalue(L, index);
  lua_call(L, 2, 1);
  int ret = lua_toboolean(L, -1);
  lua_pop(L, 1);
  return ret;
}

void colony_array_length (lua_State* L, int pos)
{
  // TODO fix
  lua_getfield(L, pos, "length");
}

size_t colony_array_length_i (lua_State* L, int pos)
{
  // TODO fix
  lua_getfield(L, pos, "length");
  size_t ret = (size_t) lua_tonumber(L, -1);
  lua_pop(L, 1);
  return ret;
}

int colony_isbuffer (lua_State *L, int index)
{
  int ret = 0;
  if (lua_getmetatable(L, index)) {
    lua_getfield(L, -1, "buffer");
    if (!lua_isnil(L, -1)) {
      ret = 1;
    }
    lua_pop(L, 2);
  }
  return ret;
}

static uint8_t* colony_getbufferptr (lua_State *L, int index, size_t* buf_len)
{
  uint8_t* buf = NULL;
  if (lua_getmetatable(L, index)) {
    lua_getfield(L, -1, "buffer");
    if (!lua_isnil(L, -1)) {
      buf = lua_touserdata(L, -1);
      if (buf_len != NULL) {
        lua_getfield(L, -2, "bufferlen");
        *buf_len = lua_tonumber(L, -1);
        lua_remove(L, -1);
      }
    }
    lua_remove(L, -1);
    lua_remove(L, -1);
  }
  return buf;
}

uint8_t* colony_createbuffer (lua_State* L, int size)
{
  lua_getglobal(L, "_colony");
  lua_getfield(L, -1, "global");
  lua_remove(L, -2);
  lua_pushliteral(L,"Buffer");
  lua_gettable(L, -2);
  lua_remove(L, -2);
  lua_pushnil(L);
  lua_pushnumber(L, size);
  lua_call(L,2,1);
  return colony_getbufferptr(L, -1, NULL);
}

// you probably mean this instead of lua_pushlstring
void colony_pushbuffer (lua_State* L, const uint8_t* buf, size_t buf_len)
{
    uint8_t* tgt = colony_createbuffer(L, buf_len);
    memcpy(tgt, buf, buf_len);
}

const uint8_t* colony_toconstdata (lua_State* L, int index, size_t* buf_len)
{
  const uint8_t* buf = NULL;
  buf = (const uint8_t *) colony_getbufferptr(L, index, buf_len);
  if (buf == NULL) {
    buf = (const uint8_t *) lua_tolstring(L, index, buf_len);
  }

  return buf;
}

uint8_t* colony_tobuffer (lua_State* L, int index, size_t* buf_len)
{
  uint8_t* buf = NULL;
  buf = (uint8_t *) colony_getbufferptr(L, index, buf_len);
  return buf;
}

void colony_ipc_emit (lua_State* L, char *type, void* data, size_t size)
{
  // Get preload table.
  lua_getglobal(L, "_colony_emit");
  if (lua_isnil(L, -1)) {
    lua_pop(L, 1);
  } else {
    lua_pushstring(L, type);
    uint8_t* buf = colony_createbuffer(L, size);
    memcpy(buf, data, size);
    tm_checked_call(L, 2);
  }
}

// Backported from Lua 5.1
LUALIB_API const char *colony_tolstring (lua_State *L, int idx, size_t *len) {
  if (!luaL_callmeta(L, idx, "__tostring")) {  /* no metafield? */
    switch (lua_type(L, idx)) {
      case LUA_TNUMBER:
      case LUA_TSTRING:
        lua_pushvalue(L, idx);
        break;
      case LUA_TBOOLEAN:
        lua_pushstring(L, (lua_toboolean(L, idx) ? "true" : "false"));
        break;
      case LUA_TNIL:
        lua_pushliteral(L, "nil");
        break;
      default:
        lua_pushfstring(L, "%s: %p", luaL_typename(L, idx),
                                            lua_topointer(L, idx));
        break;
    }
  }
  return lua_tolstring(L, -1, len);
}
