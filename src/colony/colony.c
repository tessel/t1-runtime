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
// #include <luajit.h>

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
  int ret = lua_tonumber(L, -1);
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
    lua_pop(L, 1);
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

/*
const uint8_t* colony_tolstring (lua_State* L, int index, size_t* buf_len)
{
  size_t str_len;
  const char* str = lua_tolstring(L, index, &str_len);
  
  size_t utf8_len;
  // TODO: split into "preflight" and malloc here?
  const char* utf8 = tm_str_to_utf8(str, str_len, &utf8_len);
  lua_pushlstring(L, utf8, utf8_len);
  if (utf8 != str) free(utf8);
  lua_replace(L, index);
  if (buf_len) *buf_len = utf8_len;
  return (const uint8_t*) utf8;
}
*/

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
