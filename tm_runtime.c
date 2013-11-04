#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>

#include "tm.h"


static void stackDump (lua_State *L)
{
  int i;
  int top = lua_gettop(L);
  for (i = 1; i <= top; i++) {  /* repeat for each level */
    int t = lua_type(L, i);
    switch (t) {

      case LUA_TSTRING:  /* strings */
        printf("`%s'", lua_tostring(L, i));
        break;

      case LUA_TBOOLEAN:  /* booleans */
        printf(lua_toboolean(L, i) ? "true" : "false");
        break;

      case LUA_TNUMBER:  /* numbers */
        printf("%g", lua_tonumber(L, i));
        break;

      default:  /* other values */
        printf("%s", lua_typename(L, t));
        break;

    }
    printf("  ");  /* put a separator */
  }
  printf("\n");  /* end the listing */
}


/**
 * Buffer
 */

static int l_tm_buffer_create (lua_State *L)
{
  size_t n = (size_t) lua_tonumber(L, 2);
  uint8_t * buf = malloc(n);
  lua_pushlightuserdata(L, buf);
  return 1;
}


static int l_tm_buffer_free (lua_State *L)
{
  uint8_t *ud = (uint8_t *) lua_touserdata(L, 1);
  free(ud);
  return 0;
}


static int l_tm_buffer_set (lua_State *L)
{
  uint8_t *ud = (uint8_t *) lua_touserdata(L, 1);
  size_t index = (size_t) lua_tonumber(L, 2);
  uint8_t newvalue = (uint8_t) lua_tonumber(L, 3);

  ud[index] = newvalue;
  return 0;
}


static int l_tm_buffer_get (lua_State *L)
{
  uint8_t *ud = (uint8_t *) lua_touserdata(L, 1);
  size_t index = (size_t) lua_tonumber(L, 2);
  lua_pushnumber(L, ud[index]);
  return 1;
}


static int l_tm_buffer_fill (lua_State *L)
{
  uint8_t *a = (uint8_t *) lua_touserdata(L, 1);
  uint8_t value = (uint8_t) lua_tonumber(L, 2);
  int start = (int) lua_tonumber(L, 3);
  int end = (int) lua_tonumber(L, 4);

  for (int i = start; i < end; i++) {
    a[i] = value;
  }
  return 0;
}

static int l_tm_buffer_copy (lua_State *L)
{
  uint8_t *source = (uint8_t *) lua_touserdata(L, 1);
  uint8_t *target = (uint8_t *) lua_touserdata(L, 2);
  int targetStart = (int) lua_tonumber(L, 3);
  int sourceStart = (int) lua_tonumber(L, 4);
  int sourceEnd = (int) lua_tonumber(L, 5);

  for (int i = 0; i < sourceEnd - sourceStart; i++) {
    target[targetStart + i] = source[sourceStart + i];
  }
  return 0;
}


/**
 * Load Colony.
 */

void luaopen_tm (lua_State *L)
{
  luaL_register(L, "tm", (luaL_reg[]) {

    { "buffer_create", l_tm_buffer_create },
    { "buffer_free", l_tm_buffer_free },
    { "buffer_set", l_tm_buffer_set },
    { "buffer_get", l_tm_buffer_get },
    { "buffer_fill", l_tm_buffer_fill },
    { "buffer_copy", l_tm_buffer_copy },

    { NULL, NULL }
  });
}
