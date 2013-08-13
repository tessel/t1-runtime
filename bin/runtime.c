#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>

#include <stdlib.h>
#include <string.h>

#include "colony.h"
#include "tm_task.h"


/**
 * main
 */

int main (int argc, char *argv[])
{
  lua_State *L = colony_init();

  tm_task_luaparse_start(tm_task_default_loop(), L, argv[1], strlen(argv[1]));
  tm_task_run(tm_task_default_loop());

  colony_close(L);

  return 0; 
}
