#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>
// #include <luajit.h>

#include <stdlib.h>
#include <string.h>
#include <stddef.h>

#include "tm.h"
#include "lua_http_parser.h"
#include "lua_tm.h"
#include "lua_hsregex.h"
#include "lua_bit.h"
#include "lua_yajl.h"

#include "dlmalloc.h"
#include "dlmallocfork.h"


/**
 * Runtime.
 */

static int traceback (lua_State *L)
{
  // TODO why is the error at index "0" here?
  if (!lua_isstring(L, 1)) {  /* 'message' not a string? */
    lua_pushstring(L, lua_tostring(L, 0));
    lua_replace(L, 1);
  }
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
  lua_pushvalue(L, 1);  /* pass error message */
  lua_pushinteger(L, 2);  /* skip this function and traceback */
  lua_call(L, 2, 1);  /* call debug.traceback */
  return 1;
}

static int getargs(lua_State *L, char **argv, int argc)
{
  int i;
  luaL_checkstack(L, argc + 3, "too many arguments to script");
  lua_createtable(L, argc, argc);
  for (i = 0; i < argc; i++) {
    lua_pushstring(L, argv[i]);
    lua_rawseti(L, -2, i + 1);
  }
  return argc;
}

static int report(lua_State *L, int status)
{
  if (status && !lua_isnil(L, -1)) {
    size_t len = 0;
    const char *msg = lua_tolstring(L, -1, &len);
    if (msg != NULL) {
      tm_log(SYS_ERR, msg, len);
    } else {
      tm_logf(SYS_ERR, "(error object is not a string)");
    }
    lua_pop(L, 1);
  }
  return status;
}

static int handle_script(lua_State *L, const char* script, size_t scriptlen, char **argv, int argc)
{
  int status;
  int narg = getargs(L, argv, argc);  /* collect arguments */
  lua_setglobal(L, "arg");
  // if (strcmp(argv[0], "-") == 0 && strcmp(argv[n-1], "--") != 0)
  //   fname = NULL;  /* stdin */
  lua_pushcfunction(L, traceback);
  status = luaL_loadbuffer(L,script, scriptlen, "@[T]: runtime");
  if (status == 0) {
    // status = docall(L, 1, 0);
    status = lua_pcall(L, 0, 0, lua_gettop(L) - 1);
  } else {
    lua_pop(L, narg);
  }

  return report(L, status);
}

static int runtime_panic (lua_State *L)
{
  tm_logf(SYS_ERR, "PANIC: unprotected error in call to Lua API (%s)\n", lua_tostring(L, -1));
  return 0;  /* return to Lua to abort */
}




/**
 * colony lua methods
 */

typedef struct dir_reg { const char *path; const unsigned char *src; unsigned int len; } dir_reg_t;
extern dir_reg_t dir_runtime_lib[];
extern dir_reg_t dir_builtin[];

static int builtin_loader (lua_State* L)
{
  // const char* path = lua_tostring(L, 1);
  int i = (int) lua_tonumber(L, 2);

  int res = luaL_loadbuffer(L, (const char *) dir_builtin[i].src, dir_builtin[i].len, dir_builtin[i].path);
  if (res != 0) {
    printf("Error in %s: %d\n", dir_builtin[i].path, res);
    report(L, res);
    exit(1);
  }

  return 1;
}

const char preload_lua[] = "require('preload');";

int colony_runtime_open (lua_State** stateptr)
{
  lua_State* L = *stateptr = luaL_newstate ();
  lua_atpanic(L, &runtime_panic);
  // luaJIT_setmode(L, 0, LUAJIT_MODE_ENGINE|LUAJIT_MODE_ON);
  // lua_gc(L, LUA_GCSETPAUSE, 90);
  // lua_gc(L, LUA_GCSETSTEPMUL, 200);

  // Open libraries.
  luaL_openlibs(L);

  // Type of build.
#ifdef COLONY_EMBED
  lua_pushboolean(L, 1);
#else
  lua_pushboolean(L, 0);
#endif
  lua_setglobal(L, "COLONY_EMBED");

  // Preload Lua modules.
  lua_getglobal(L, "package");
  lua_getfield(L, -1, "preload");
  lua_remove(L, -2);
  // bit32
  lua_pushcfunction(L, luaopen_bit);
  lua_setfield(L, -2, "bit32");
  // tm
  lua_pushcfunction(L, luaopen_tm);
  lua_setfield(L, -2, "tm");
  // http_parser
  lua_pushcfunction(L, luaopen_http_parser);
  lua_setfield(L, -2, "http_parser");
  // hsregex
  lua_pushcfunction(L, luaopen_hsregex);
  lua_setfield(L, -2, "hsregex");
  // yajl
  lua_pushcfunction(L, luaopen_yajl);
  lua_setfield(L, -2, "yajl");
  // Load lib/*.lua files into memory.
  for (int i = 0; dir_runtime_lib[i].path != NULL; i++) {
    lua_pushlstring(L, dir_runtime_lib[i].path, strchr(dir_runtime_lib[i].path, '.') - dir_runtime_lib[i].path);
    int res = luaL_loadbuffer(L, (const char *) dir_runtime_lib[i].src, dir_runtime_lib[i].len, dir_runtime_lib[i].path);
    if (res != 0) {
      printf("Error in runtime lib %s: %d\n", dir_runtime_lib[i].path, res);
      report(L, res);
      exit(1);
    }
    lua_settable(L, -3);
  }
  // Done with preload
  lua_pop(L, 1);

  // Given the index of a builtin file to load, this function loads it.
  lua_pushcfunction(L, builtin_loader);
  lua_setglobal(L, "_builtin_load");

  // Adds builtin files to an array _builtin.
  lua_newtable(L);
  for (int i = 0; dir_builtin[i].path != NULL; i++) {
    lua_pushlstring(L, dir_builtin[i].path, strchr(dir_builtin[i].path, '.') - dir_builtin[i].path);
    lua_pushnumber(L, i);
    lua_settable(L, -3);
  }
  lua_setglobal(L, "_builtin");

  // Load all builtin libraries immediately on init.
  // This can trade loss of sped for later access.
#ifdef COLONY_PRELOAD
  lua_pushnumber(L, 1);
#else
  lua_pushnumber(L, 0);
#endif
  lua_setglobal(L, "_colony_preload_on_init");

  // Launch our preload.lua script.
  char* argv[] = { 0 };
  return handle_script(L, preload_lua, strlen(preload_lua), argv, 0);
}


const char runtime_lua[] = "require('cli');";

int colony_runtime_run (lua_State** stateptr, const char *path, char **argv, int argc)
{
  (void) path;
  
  lua_State* L = *stateptr;

  // Launch our cli.lua script.
  return handle_script(L, runtime_lua, strlen(runtime_lua), argv, argc);
}


int colony_runtime_close (lua_State** stateptr)
{
  lua_State* L = *stateptr;

  // Close runtime.
  lua_close(L);
  *stateptr = NULL;
  return 0;
}
