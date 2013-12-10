#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>
// #include <luajit.h>

#include <stdlib.h>
#include <string.h>

#include "tm.h"
#include "l_http_parser.h"
#include "l_tm.h"
#include "l_hsregex.h"
#include "l_bit.h"

LUALIB_API int luaopen_yajl(lua_State *L);


/**
 * Runtime.
 */

static int traceback (lua_State *L)
{
  if (!lua_isstring(L, 1))  /* 'message' not a string? */
    return 1;  /* keep it intact */
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

static int handle_script(lua_State *L, const char* script, size_t scriptlen, char **argv, int argc)
{
  int status;
  int narg = getargs(L, argv, argc);  /* collect arguments */
  lua_setglobal(L, "arg");
  // if (strcmp(argv[0], "-") == 0 && strcmp(argv[n-1], "--") != 0)
  //   fname = NULL;  /* stdin */
  status = luaL_loadbuffer(L,script, scriptlen, "runtime");
  if (status == 0)
    status = docall(L, 1, 0);
  else
    lua_pop(L, narg);

  return report(L, status);
}

static int runtime_panic (lua_State *L)
{
  printf("PANIC: unprotected error in call to Lua API (%s)\n", lua_tostring(L, -1));
  return 0;  /* return to Lua to abort */
}

// static int base64_write(lua_State* L, unsigned char* str, size_t len, 
//         struct luaL_Buffer *buf)
// {
//     unsigned int idx;
//     for (idx=0; idx<len; idx++){
//         printf("0x%02x, ", (unsigned int) str[idx]);
//         //printf(code);
//         // luaL_addlstring(buf, code, 4);
//     }
//     //printf("\n");
//     return 0;
// }

// const uint8_t thebytes[] = {
//   0x1b, 0x4c, 0x75, 0x61, 0x51, 0x00, 0x01, 0x04, 0x04, 0x04, 0x08, 0x00, 0x07, 0x00, 0x00, 0x00, 0x3d, 0x73, 0x74, 0x64, 0x69, 0x6e, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x02, 0x03, 0x00, 0x00, 0x00, 0x00, 0x24, 0x00, 0x00, 0x00, 0x1e, 0x00, 0x00, 0x01, 0x1e, 0x00, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04, 0x06, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00, 0x41, 0x00, 0x00, 0x00, 0x81, 0x40, 0x00, 0x00, 0xc1, 0x80, 0x00, 0x00, 0x1c, 0x40, 0x00, 0x02, 0x1e, 0x00, 0x80, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x06, 0x00, 0x00, 0x00, 0x70, 0x72, 0x69, 0x6e, 0x74, 0x00, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x20, 0x40, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80, 0x23, 0x40, 0x00, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
// };

// const char SOMECODETOCOMPILE[] = "return function () print('print', 4 + 4, 6.54 + 3.21); end";

// void dump_function(lua_State* L){
//     int stack_sz;
//     int res;
//     luaL_Buffer buf;

//     luaL_buffinit(L, &buf);

//     // ** test 1 - works as expected
//     lua_settop(L,0);
//     luaL_loadbuffer(L, SOMECODETOCOMPILE, strlen(SOMECODETOCOMPILE), "=stdin");
//     printf("stack sz: %i\n", lua_gettop(L));
//     res = lua_dump(L, (lua_Writer)base64_write, &buf);
//     printf("\n");
// }

typedef struct dir_reg { const char *path; const unsigned char *src; unsigned int len; } dir_reg_t;
extern dir_reg_t dir_runtime_lib[];
extern dir_reg_t dir_builtin[];

static int builtin_loader (lua_State* L)
{
  const char* path = lua_tostring(L, 1);
  int i = (int) lua_tonumber(L, 2);

  int res = luaL_loadbuffer(L, (const char *) dir_builtin[i].src, dir_builtin[i].len, dir_builtin[i].path);
  if (res != 0) {
    printf("Error in %s: %d\n", dir_builtin[i].path, res);
    report(L, res);
    exit(1);
  }

  return 1;
}

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

    // dump_function(L);
  // int res = luaL_loadbuffer(L, thebytes, sizeof(thebytes), "=stdin");
  // lua_pcall(L, 0, LUA_MULTRET, 0);
  // lua_pcall(L, 0, LUA_MULTRET, 0);


  // Type of build.
#ifdef COLONY_EMBED
  lua_pushboolean(L, 1);
#else
  lua_pushboolean(L, 0);
#endif
  lua_setglobal(L, "COLONY_EMBED");

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
  // hsregex
  lua_pushcfunction(L, luaopen_hsregex);
  lua_setfield(L, -2, "hsregex");
  // yajl
  lua_pushcfunction(L, luaopen_yajl);
  lua_setfield(L, -2, "yajl");

  for (int i = 0; dir_runtime_lib[i].path != NULL; i++) {
    // printf("lib -> %s\n", dir_runtime_lib[i].path);
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


  lua_pushcfunction(L, builtin_loader);
  lua_setglobal(L, "_builtin_load");

  
  lua_newtable(L);
  for (int i = 0; dir_builtin[i].path != NULL; i++) {
    // printf("builtin -> %s\n", dir_builtin[i].path);
    // lua_pushlightuserdata(L, &dir_index_builtin[i]);
    // lua_pushstring(L, dir_index_builtin[i].path);
    lua_pushlstring(L, dir_builtin[i].path, strchr(dir_builtin[i].path, '.') - dir_builtin[i].path);
    lua_pushnumber(L, i);
    // int res = luaL_loadbuffer(L, (const char *) dir_index_builtin[i].src, dir_index_builtin[i].len, dir_index_builtin[i].path);
    // if (res != 0) {
    //   printf("Error in %s: %d\n", dir_index_builtin[i].path, res);
    //   report(L, res);
    //   exit(1);
    // }
    lua_settable(L, -3);
  }
  lua_setglobal(L, "_builtin");

  return 0;
}

const char runtime_lua[] = "require('cli');";

int colony_runtime_run (lua_State** stateptr, const char *path, char **argv, int argc)
{
  lua_State* L = *stateptr;

  // Run script.
  // const char *runtime_lua = "local colony = require('lib/colony'); collectgarbage(); colony.run('./' .. arg[1]); colony.runEventLoop();";
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


void colony_newarray (lua_State* L, int size)
{
  lua_getglobal(L, "_colony");
  lua_getfield(L, -1, "global");
  lua_pushliteral(L,"_arr");
  lua_gettable(L, -2);
  lua_remove(L, -2);
  lua_createtable(L, size > 0 ? size - 1 : size, size > 0 ? 1 : 0);
  lua_call(L,1,1);
}

void colony_newobj (lua_State* L, int size)
{
  lua_getglobal(L, "_colony");
  lua_getfield(L, -1, "global");
  lua_pushliteral(L,"_obj");
  lua_gettable(L, -2);
  lua_remove(L, -2);
  lua_createtable(L, 0, size);
  lua_call(L,1,1);
}