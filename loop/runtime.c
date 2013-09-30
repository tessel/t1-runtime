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

int main (int argc, char *argv[])
{
  lua_State *L = colony_init();
  luaJIT_setmode(L, 0, LUAJIT_MODE_ENGINE|LUAJIT_MODE_OFF);

  // lua_gc(L, LUA_GCSETPAUSE, 90);
  // lua_gc(L, LUA_GCSETSTEPMUL, 200);

  // Parse code.
  char *fullfile = readfile(argv[1]);
  tm_luaparse_start(tm_default_loop(), L, fullfile, strlen(fullfile));

  // Main loop.
  tm_run(tm_default_loop());

  colony_close(L);

  return 0; 
}
