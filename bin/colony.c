#include "colony.h"

typedef struct {
  int size;
  char values[1];
} Buffer_t;


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
 * Colony buffer
 */

static int colony_buffer_new (lua_State *L)
{
    size_t n = (size_t) lua_tonumber(L, 2);
    size_t nbytes = sizeof(Buffer_t) + (n - 1)*sizeof(uint8_t);

    Buffer_t *a = (Buffer_t *)lua_newuserdata(L, nbytes);
    
    luaL_getmetatable(L, "colony.Buffer");
    lua_setmetatable(L, -2);
    
    a->size = n;
    return 1;  /* new userdatum is already on the stack */
}

static Buffer_t *colony_buffer_verify (lua_State *L)
{
    void *ud = luaL_checkudata(L, 1, "colony.Buffer");
    luaL_argcheck(L, ud != NULL, 1, "`array' expected");
    return (Buffer_t *)ud;
}


static int colony_buffer_size (lua_State *L)
{
    Buffer_t *a = colony_buffer_verify(L);
    lua_pushnumber(L, a->size);
    return 1;
}


static uint8_t *colony_buffer_ptr (lua_State *L)
{
    Buffer_t *a = colony_buffer_verify(L);
    size_t index = (size_t) lua_tonumber(L, 2);
    
    luaL_argcheck(L, 0 <= index && index < a->size, 2, "index out of range");
    
    /* return element address */
    return &a->values[index];
}


static int colony_buffer_set (lua_State *L)
{
    uint8_t newvalue = (uint8_t) lua_tonumber(L, 3);
    *colony_buffer_ptr(L) = newvalue;
    return 0;
}


static int colony_buffer_get (lua_State *L)
{
  if (lua_isnumber(L, 2)) {
    lua_pushnumber(L, *colony_buffer_ptr(L));
  } else {
    lua_pushvalue(L, 2);
    lua_tostring(L, -1);
    // TODO when not userdata
    // lua_rawget(L, 1);
    lua_pushnil(L);
    if (lua_isnil(L, -1)) {
      lua_pop(L, 1);
      luaL_getmetatable(L, "colony.Buffer");
      lua_getfield(L, -1, "__proto");
      lua_pushvalue(L, 2);
      lua_gettable(L, -2);
    }
  }
  return 1;
}

void colony_buffer_init (lua_State *L)
{

  luaL_newmetatable(L, "colony.Buffer");

  lua_pushcclosure(L, colony_buffer_get, 0);
  lua_setfield(L, -2, "__index");

  lua_pushcclosure(L, colony_buffer_set, 0);
  lua_setfield(L, -2, "__newindex");

  lua_newtable(L);
  lua_setfield(L, -2, "__proto");  

  lua_remove(L, -1);
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

  colony_buffer_init(L);
  lua_pushcclosure(L, colony_buffer_new, 0);
  lua_setfield(L, -2, "Buffer");

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