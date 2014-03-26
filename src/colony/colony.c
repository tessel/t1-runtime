#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>
// #include <luajit.h>

#include <stdlib.h>
#include <string.h>
#include <stddef.h>

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

const uint8_t* colony_tobuffer (lua_State* L, int index, size_t* buf_len)
{
  const uint8_t* buf = NULL;
  buf = (const uint8_t *) colony_getbufferptr(L, index, buf_len);
  if (buf == NULL) {
    buf = (const uint8_t *) lua_tolstring(L, index, buf_len);
  }

  return buf;
}