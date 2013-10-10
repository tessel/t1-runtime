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

int barfunc(int foo)
{
    /* a dummy function to test with FFI */ 
    return foo + 1;
}

char *readfile (char *path) {
  FILE *fp;
  long lSize;
  char *buffer;

  fp = fopen (path, "rb" );
  if( !fp ) perror(path),exit(1);

  fseek( fp , 0L , SEEK_END);
  lSize = ftell( fp );
  rewind( fp );

  /* allocate memory for entire content */
  buffer = calloc( 1, lSize+1 );
  if( !buffer ) fclose(fp),fputs("memory alloc fails",stderr),exit(1);

  /* copy the file into the buffer */
  if( 1!=fread( buffer , lSize, 1 , fp) )
    fclose(fp),free(buffer),fputs("entire read fails",stderr),exit(1);

  /* do your work here, buffer is a string contains the whole text */

  fclose(fp);
  // free(buffer);

  return buffer;
}


#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>

static int traceback(lua_State *L)
{
  if (!lua_isstring(L, 1)) { /* Non-string error object? Try metamethod. */
    if (lua_isnoneornil(L, 1) ||
  !luaL_callmeta(L, 1, "__tostring") ||
  !lua_isstring(L, -1))
      return 1;  /* Return non-string error object. */
    lua_remove(L, 1);  /* Replace object by result of __tostring metamethod. */
  }
  luaL_traceback(L, L, lua_tostring(L, 1), 1);
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

static int handle_script(lua_State *L, char **argv, int n)
{
  int status;
  int narg = getargs(L, argv, n);  /* collect arguments */
  lua_setglobal(L, "arg");
  // if (strcmp(argv[0], "-") == 0 && strcmp(argv[n-1], "--") != 0)
  //   fname = NULL;  /* stdin */
  status = luaL_loadfile(L, "runtime.lua");
  lua_insert(L, -(narg+1));
  if (status == 0)
    status = docall(L, narg, 0);
  else
    lua_pop(L, narg);
  return report(L, status);
}

int main (int argc, char *argv[])
{
  lua_State *L = colony_init();
  luaJIT_setmode(L, 0, LUAJIT_MODE_ENGINE|LUAJIT_MODE_ON);

  // lua_gc(L, LUA_GCSETPAUSE, 90);
  // lua_gc(L, LUA_GCSETSTEPMUL, 200);

  if (argc < 2) {
    printf("Need more arguments bro\n");
    return 1;
  }

  // Parse code.
  int status = handle_script(L, argv, 1);
  // printf("status: %d\n", status);
  // char *fullfile = readfile(argv[1]);
  // tm_luaparse_start(tm_default_loop(), L, fullfile, strlen(fullfile));

  // Main loop.
  if (status == 0) {
    tm_run(tm_default_loop());
  }

  colony_close(L);

  return status; 
}
