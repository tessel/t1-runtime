#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>
#include <luajit.h>

#include <stdlib.h>
#include <string.h>

#include "colony.h"
#include "tm.h"


/**
 * main
 */

int main (int argc, char *argv[])
{
  lua_State *L = colony_init();
  luaJIT_setmode(L, 0, LUAJIT_MODE_ENGINE|LUAJIT_MODE_OFF);

  // lua_gc(L, LUA_GCSETPAUSE, 90);
  // lua_gc(L, LUA_GCSETSTEPMUL, 200);

  // Parse code.
  tm_luaparse_start(tm_default_loop(), L, argv[1], strlen(argv[1]));

  // Main loop.
  tm_run(tm_default_loop());

  colony_close(L);

  return 0; 
}
