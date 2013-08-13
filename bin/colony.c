#include "colony.h"


static void stackDump (lua_State *L) {
      int i;
      int top = lua_gettop(L);
      for (i = 1; i <= top; i++) {  /* repeat for each level */
        int t = lua_type(L, i);
        switch (t) {

          case LUA_TSTRING:  /* strings */
            printf("`%s'", lua_tostring(L, i));
            break;

          case LUA_TBOOLEAN:  /* booleans */
            printf(lua_toboolean(L, i) ? "true" : "false");
            break;

          case LUA_TNUMBER:  /* numbers */
            printf("%g", lua_tonumber(L, i));
            break;

          default:  /* other values */
            printf("%s", lua_typename(L, t));
            break;

        }
        printf("  ");  /* put a separator */
      }
      printf("\n");  /* end the listing */
    }


/**
 * colony_setInterval
 */

static void colony_setInterval_endpoint (void *_data)
{
  tm_task_lua_endpoint_t *data = (tm_task_lua_endpoint_t *) _data;

  tm_task_lua_start(tm_task_default_loop(), data->L, data->ref, 0);
}

static int colony_setInterval (lua_State *L)
{
  if (!lua_isfunction(L, 2)) {
    return 0;
  }
  int timeout = lua_tonumber(L, 3);

  lua_pushvalue(L, 2);
  int ref = luaL_ref(L, LUA_REGISTRYINDEX);

  tm_task_lua_endpoint_t *data = calloc(1, sizeof(tm_task_lua_endpoint_t));
  data->ref = ref;
  data->L = L;
  tm_task_timer_start(tm_task_default_loop(), colony_setInterval_endpoint, timeout, timeout, data);
  return 0;
}


/**
 * colony_setTimeout
 */

static void colony_setTimeout_endpoint (void *_data)
{
  tm_task_lua_endpoint_t *data = (tm_task_lua_endpoint_t *) _data;

  tm_task_lua_start(tm_task_default_loop(), data->L, data->ref, 0);
  free(data);
}

static int colony_setTimeout (lua_State *L)
{
  if (!lua_isfunction(L, 2)) {
    return 0;
  }
  int timeout = lua_tonumber(L, 3);

  lua_pushvalue(L, 2);
  int ref = luaL_ref(L, LUA_REGISTRYINDEX);

  tm_task_lua_endpoint_t *data = calloc(1, sizeof(tm_task_lua_endpoint_t));
  data->ref = ref;
  data->L = L;
  tm_task_timer_start(tm_task_default_loop(), colony_setTimeout_endpoint, timeout, 0, data);
  return 0;
}

static int colony_dointerrupt (lua_State *L)
{
  tm_task_interruptall(tm_task_default_loop());
  return 0;
}


/**
 * colony_setImmediate
 */

static int colony_setImmediate (lua_State *L)
{
  if (!lua_isfunction(L, 2)) {
    return 0;
  }

  lua_pushvalue(L, 2);
  int ref = luaL_ref(L, LUA_REGISTRYINDEX);
  tm_task_lua_start(tm_task_default_loop(), L, ref, 1);
  return 0;
}


/**
 * Load Colony.
 */
 
extern int lcf_main (lua_State * L);

void colony_libload (lua_State *L)
{
  // Load the compiled "colony" package.
  lua_getglobal(L, "package");
  lua_getfield(L, -1, "loaded");
  lua_newtable(L); /* closure table */
  lua_pushcclosure(L, lcf_main, 1);
  int i;
  // for (i=1; i < args->c; i++) {
  //  lua_pushstring(L, args->v[i]);
  //}
  int status2 = lua_pcall(L, 0, 1, 0);
  if (status2 != 0) {
    const char * msg = lua_tostring(L,-1);
    if (msg == NULL) msg = "(error object is not a string)";
    fputs(msg, stderr);
    printf("\n");
    return;
  }

  lua_getfield(L, -1, "global");
  lua_pushcclosure(L, colony_setImmediate, 0);
  lua_setfield(L, -2, "setImmediate");
  lua_pushcclosure(L, colony_setTimeout, 0);
  lua_setfield(L, -2, "setTimeout");
  lua_pushcclosure(L, colony_setInterval, 0);
  lua_setfield(L, -2, "setInterval");
  lua_pushcclosure(L, colony_dointerrupt, 0);
  lua_setfield(L, -2, "dointerrupt");
  lua_remove(L, -1);

  lua_setfield(L, -2, "colony");
}


/**
 * colony_init
 */

static int colony_panic (lua_State *L)
{
  printf("PANIC: unprotected error in call to Lua API (%s)\n", lua_tostring(L, -1));
  return 0;  /* return to Lua to abort */
}

lua_State *colony_init ()
{
  lua_State *L = luaL_newstate();
  lua_atpanic(L, &colony_panic);
  luaL_openlibs(L);

  // Initialize colony library.
  colony_libload(L);

  return L;
}


/**
 * colony_close
 */

void colony_close (lua_State *L)
{
  lua_close(L);
}