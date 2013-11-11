#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>

int colony_runtime_open (lua_State** stateptr);
int colony_runtime_run (lua_State** stateptr, const char *path, char **argv, int argc);
int colony_runtime_close (lua_State** stateptr);