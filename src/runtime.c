#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>
// #include <luajit.h>

#include <stdlib.h>
#include <string.h>

#include "tm.h"
#include "lhttp_parser.h"


/**
 * Runtime.
 */

LUALIB_API int luaopen_evinrude (lua_State *L);
LUALIB_API int luaopen_bit (lua_State *L);

void luaL_traceback (lua_State *L, lua_State *L1, const char *msg, int level);

static int traceback(lua_State *L)
{
  if (!lua_isstring(L, 1)) { /* Non-string error object? Try metamethod. */
    if (lua_isnoneornil(L, 1) ||
  !luaL_callmeta(L, 1, "__tostring") ||
  !lua_isstring(L, -1))
      return 1;  /* Return non-string error object. */
    lua_remove(L, 1);  /* Replace object by result of __tostring metamethod. */
  }
  // luaL_traceback(L, L, lua_tostring(L, 1), 1);
  return 1;
}

static int docall(lua_State *L, int narg, int clear)
{
  int status;
  int base = lua_gettop(L) - narg;  /* function index */
  lua_pushcfunction(L, traceback);  /* push traceback function */
  lua_insert(L, base);  /* put it under chunk and args */
  status = lua_pcall(L, narg, (clear ? 0 : LUA_MULTRET), base);
  lua_remove(L, base);  /* remove traceback function */
  /* force a complete garbage collection in case of errors */
  if (status != 0) lua_gc(L, LUA_GCCOLLECT, 0);
  return status;
}

static int getargs(lua_State *L, char **argv, int n)
{
  int narg;
  int i;
  int argc = 0;
  while (argv[argc]) argc++;  /* count total number of arguments */
  narg = argc - (n + 1);  /* number of arguments to the script */
  luaL_checkstack(L, narg + 3, "too many arguments to script");
  for (i = n+1; i < argc; i++)
    lua_pushstring(L, argv[i]);
  lua_createtable(L, narg, n + 1);
  for (i = 0; i < argc; i++) {
    lua_pushstring(L, argv[i]);
    lua_rawseti(L, -2, i - n);
  }
  return narg;
}

static void l_message(const char *pname, const char *msg)
{
  if (pname) fprintf(stderr, "%s: ", pname);
  fprintf(stderr, "%s\n", msg);
  fflush(stderr);
}

static int report(lua_State *L, int status)
{
  if (status && !lua_isnil(L, -1)) {
    const char *msg = lua_tostring(L, -1);
    if (msg == NULL) msg = "(error object is not a string)";
    l_message("runtime", msg);
    lua_pop(L, 1);
  }
  return status;
}

static int handle_script(lua_State *L, const char* script, size_t scriptlen, char **argv, int n)
{
  int status;
  int narg = getargs(L, argv, n);  /* collect arguments */
  lua_setglobal(L, "arg");
  // if (strcmp(argv[0], "-") == 0 && strcmp(argv[n-1], "--") != 0)
  //   fname = NULL;  /* stdin */
  status = luaL_loadbuffer(L,script, scriptlen, "runtime");
  lua_insert(L, -(narg+1));
  if (status == 0)
    status = docall(L, narg, 0);
  else
    lua_pop(L, narg);
  return report(L, status);
}

static int runtime_panic (lua_State *L)
{
  printf("PANIC: unprotected error in call to Lua API (%s)\n", lua_tostring(L, -1));
  return 0;  /* return to Lua to abort */
}


#define LOAD_EMBEDDED_LUA(L, NAME) extern unsigned char* NAME; extern unsigned int NAME ## _len; luaL_loadbuffer(L, (const char*) &NAME, NAME ## _len, (const char*) &NAME);

// Function to be called by javascript
int colony_runtime_open (lua_State** stateptr)
{
  lua_State* L = *stateptr = lua_open();

  lua_atpanic(L, &runtime_panic);
  // luaJIT_setmode(L, 0, LUAJIT_MODE_ENGINE|LUAJIT_MODE_ON);
  // lua_gc(L, LUA_GCSETPAUSE, 90);
  // lua_gc(L, LUA_GCSETSTEPMUL, 200);

  // Open libraries.
  luaL_openlibs(L);

  // Get preload table.
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
  // evinrude
  lua_pushcfunction(L, luaopen_evinrude);
  lua_setfield(L, -2, "evinrude");

  // lib/cli.lua
  LOAD_EMBEDDED_LUA(L, lib_cli_lua);
  lua_setfield(L, -2, "lib/cli.lua");
  // lib/colony.lua
  LOAD_EMBEDDED_LUA(L, lib_colony_lua);
  lua_setfield(L, -2, "lib/colony.lua");
  // lib/node-tm.lua
  LOAD_EMBEDDED_LUA(L, lib_node_tm_lua);
  lua_setfield(L, -2, "lib/node-tm.lua");
  // lib/std.lua
  LOAD_EMBEDDED_LUA(L, lib_std_lua);
  lua_setfield(L, -2, "lib/std.lua");

  // Done with preload
  lua_pop(L, 1);

  return 0;
}


int colony_runtime_run (lua_State** stateptr, const char *path, char **argv)
{
  lua_State* L = *stateptr;

  // Run script.
  // const char *runtime_lua = "local colony = require('lib/colony'); collectgarbage(); colony.run('./' .. arg[1]); colony.runEventLoop();";
  const char *runtime_lua = "require('lib/cli')";
  return handle_script(L, runtime_lua, strlen(runtime_lua), argv, 0);
}


int colony_runtime_close (lua_State** stateptr)
{
  lua_State* L = *stateptr;

  // Close runtime.
  lua_close(L);
  *stateptr = NULL;
  return 0;
}


/**
 * Populate FatFS
 */

#include "ff.h"

void populate_fs_file (const char *pathname, const uint8_t *src, size_t len)
{
  tm_fs_t fd;
  UINT written;
  int res_open = f_open(&fd, "~index.colony", TM_RDWR | FA_CREATE_ALWAYS);
  int res_write = f_write(&fd, src, len, &written);
  int res_close = f_close(&fd);
}

void populate_fs ()
{
  FATFS fs;
  int res_mount = f_mount(&fs, "", 0);  /* Register work area to the logical drive 0 */
  int res_mkfs = f_mkfs("", 1, 0);         /* Create FAT volume on the logical drive 0. 2nd argument is ignored. */

  // Add index.js file
  const char *jscode = "function () console:log('hi'); end";
  populate_fs_file("~index.colony", (const uint8_t*) jscode, strlen(jscode));

  f_mount(NULL, "", 0); // unmount
}

/**
 * Run
 */

int main (int argc, char *argv[])
{
  lua_State* L;
  populate_fs();
  tm_fs_init();

  colony_runtime_open(&L);
  int ret = colony_runtime_run(&L, argv[1], argv);
  colony_runtime_close(&L);
  return ret;
}
