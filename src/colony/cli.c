#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>
// #include <luajit.h>

#include <stdlib.h>
#include <string.h>
#include <signal.h>

#include "tm.h"
#include "colony.h"


/**
 * Run
 */

static int keeprunning = 1;
static jmp_buf place;

static int traceback (lua_State *L)
{
  lua_getfield(L, LUA_GLOBALSINDEX, "debug");
  if (!lua_istable(L, -1)) {
    lua_pop(L, 1);
    return 1;
  }
  lua_getfield(L, -1, "traceback");
  if (!lua_isfunction(L, -1)) {
    lua_pop(L, 2);
    return 1;
  }
  // lua_pushinteger(L, 2);   skip this function and traceback 
  lua_call(L, 0, 1);  /* call debug.traceback */
  return 1;
}

static void lua_interrupt_hook(lua_State* L, lua_Debug *ar)
{
  traceback(L);
  printf("SIGINT %s\n", lua_tostring(L, -1));
  longjmp(place, 1);
}

static void intHandler (int dummy)
{
  if (tm_lua_state != NULL && keeprunning > 0) {
    lua_sethook(tm_lua_state, lua_interrupt_hook, LUA_MASKCOUNT, 10);
  } else {
    exit(1);
  }
}

int main (int argc, const char *argv[])
{
  int ret = 0;

  signal(SIGINT, intHandler);

  tm_fs_init();

  colony_runtime_open();

  if (setjmp(place) == 0)
    ret = colony_runtime_run(argv[1], argv, argc);
  colony_runtime_close();
  return ret;
}
