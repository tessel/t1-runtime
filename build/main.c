/* foo.c */
#include <lua.h>
#include <lualib.h>
#include <lauxlib.h>
#include <stdlib.h>

static void *l_alloc_restricted (void *ud, void *ptr, size_t osize, size_t nsize)
 {
   const int MAX_SIZE = 1024*1024*32; /* set limit here */
   int *used = (int *)ud;

   if (nsize == 0)
   {
     free(ptr);
     *used -= osize; /* substract old size from used memory */
     return NULL;
   }
   else
   {
     if (*used + (nsize - osize) > MAX_SIZE) /* too much memory in use */
       return NULL;
     ptr = realloc(ptr, nsize);
     if (ptr) /* reallocation successful? */
       *used += (nsize - osize);
     return ptr;
   }
 }

/* custom panic handler */
static int custom_lua_atpanic(lua_State *L)
{
   printf("%s\n", lua_tostring(L, -1));
  /* will never return */
  return 1;
}

int main(void)
{
   int *ud = malloc(sizeof(int)); *ud = 0;
  lua_State *L = (lua_State *)lua_newstate(l_alloc_restricted, ud);
  
    // load Lua libraries
    static const luaL_Reg lualibs[] =
    {
        { "base", luaopen_base },
        { NULL, NULL}
    };
 
    const luaL_Reg *lib = lualibs;
    for(; lib->func != NULL; lib++)
    {
        lib->func(lua_state);
        lua_settop(lua_state, 0);
    }

  /* immediately install panic handler */
  lua_atpanic(L, &custom_lua_atpanic);

  int stat = luaL_dofile(L, "examples/colony.lua");
  if (stat) {
    luaL_error(L, "error running script: %s", lua_tostring(L, -1));
  }
  printf("%d", *ud);

  lua_close(L);
  return 0;
}