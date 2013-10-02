#include "colony.h"
#include "math.h"

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
 * Buffer
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

Buffer_t *colony_buffer_verify (lua_State *L, int idx)
{
    void *ud = luaL_checkudata(L, idx, "colony.Buffer");
    luaL_argcheck(L, ud != NULL, idx, "`array' expected");
    return (Buffer_t *)ud;
}

uint8_t *colony_buffer_ensure (lua_State *L, int idx, size_t *size)
{
    void *ud = luaL_checkudata(L, idx, "colony.Buffer");
    if (ud == NULL) {
      lua_pushvalue(L, idx);
      uint8_t *ret = lua_tolstring(L, -1, size);
      lua_pop(L, 1);
      return ret;
    } else {
      *size = ((Buffer_t *)ud)->size;
      return ((Buffer_t *)ud)->values;
    }
}


static int colony_buffer_size (lua_State *L)
{
    Buffer_t *a = colony_buffer_verify(L, 1);
    lua_pushnumber(L, a->size);
    return 1;
}


static uint8_t *colony_buffer_ptr (lua_State *L)
{
    Buffer_t *a = colony_buffer_verify(L, 1);
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

static int colony_buffer_fill (lua_State *L)
{
  Buffer_t *a = colony_buffer_verify(L, 1);
    uint8_t value = (uint8_t) lua_tonumber(L, 2);
    int start = (int) lua_tonumber(L, 3);
    int end = (int) lua_tonumber(L, 4);

    luaL_argcheck(L, 0 <= start && start < a->size, 2, "start out of range");
    luaL_argcheck(L, 0 <= end && end <= a->size, 2, "end out of range");

    for (int i = start; i < end; i++) {
      a->values[i] = value;
    }
    return 0;
}

static int colony_buffer_copy (lua_State *L)
{
  Buffer_t *source = colony_buffer_verify(L, 1);
  Buffer_t *target = colony_buffer_verify(L, 2);
    int targetStart = (int) lua_tonumber(L, 3);
    int sourceStart = (int) lua_tonumber(L, 4);
    int sourceEnd = (int) lua_tonumber(L, 5);

    luaL_argcheck(L, 0 <= targetStart && targetStart < target->size, 2, "targetStart out of range");
    luaL_argcheck(L, 0 <= sourceStart && sourceStart < source->size, 2, "sourceStart out of range");
    luaL_argcheck(L, 0 <= sourceEnd && sourceEnd <= source->size, 2, "sourceEnd out of range");

    for (int i = 0; i < sourceEnd - sourceStart; i++) {
      if (targetStart + i > target->size) {
        break;
      }
      target->values[targetStart + i] = source->values[sourceStart + i];
    }
    return 0;
}


static int colony_buffer_get (lua_State *L)
{
  if (lua_isnumber(L, 2)) {
    lua_pushnumber(L, *colony_buffer_ptr(L));
  } else {
    lua_pushvalue(L, 2);
    const char *key = lua_tostring(L, -1);
    if (strncmp(key, "fill", strlen("fill")) == 0) {
      lua_pushcclosure(L, colony_buffer_fill, 0);
      return 1;
    }
    if (strncmp(key, "copy", strlen("copy")) == 0) {
      lua_pushcclosure(L, colony_buffer_copy, 0);
      return 1;
    }
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

static int colony_setInterval_count = 0;

static void colony_setInterval_endpoint (void *_data)
{
  tm_lua_endpoint_t *data = (tm_lua_endpoint_t *) _data;

  tm_lua_start(tm_default_loop(), data->L, data->ref, 0);
}

static int colony_setInterval (lua_State *L)
{
  if (!lua_isfunction(L, 2)) {
    return 0;
  }
  int timeout = lua_tonumber(L, 3);
  if (!(timeout > 0)) {
    timeout = 1;
  }

  lua_pushvalue(L, 2);
  int ref = luaL_ref(L, LUA_REGISTRYINDEX);

  tm_lua_endpoint_t *data = calloc(1, sizeof(tm_lua_endpoint_t));
  data->ref = ref;
  data->L = L;
  tm_timer_start(tm_default_loop(), colony_setInterval_endpoint, timeout, timeout, data);

  colony_setInterval_count++;
  return 0;
}


/**
 * colony_setTimeout
 */

static int colony_setTimeout_count = 0;

static void colony_setTimeout_endpoint (void *_data)
{
  tm_lua_endpoint_t *data = (tm_lua_endpoint_t *) _data;

  tm_lua_start(tm_default_loop(), data->L, data->ref, 0);
  colony_setTimeout_count--;
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

  tm_lua_endpoint_t *data = calloc(1, sizeof(tm_lua_endpoint_t));
  data->ref = ref;
  data->L = L;
  tm_timer_start(tm_default_loop(), colony_setTimeout_endpoint, timeout, 0, data);
  colony_setTimeout_count++;
  return 0;
}

//static int colony_dointerrupt (lua_State *L)
//{
//  tm_interruptall(tm_default_loop());
//  return 0;
//}


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
  tm_lua_start(tm_default_loop(), L, ref, 1);
  return 0;
}


/**
 * Load Colony.
 */
 
extern int lcf_main (lua_State * L);

void colony_libload (lua_State *L)
{
//  // Load the compiled "colony" package.
//  lua_getglobal(L, "package");
//  lua_getfield(L, -1, "loaded");
//  lua_newtable(L); /* closure table */
//  lua_pushcclosure(L, lcf_main, 1);
//  int i;
//  // for (i=1; i < args->c; i++) {
//  //  lua_pushstring(L, args->v[i]);
//  //}
//  int status2 = lua_pcall(L, 0, 1, 0);
//  if (status2 != 0) {
//    const char * msg = lua_tostring(L,-1);
//    if (msg == NULL) msg = "(error object is not a string)";
//    fputs(msg, stderr);
//    printf("\n");
//    return;
//  }

//  lua_getfield(L, -1, "global");
  lua_pushcclosure(L, colony_setImmediate, 0);
  lua_setglobal(L, "_colony_global_setImmediate");
  lua_pushcclosure(L, colony_setTimeout, 0);
  lua_setglobal(L, "_colony_global_setTimeout");
  lua_pushcclosure(L, colony_setInterval, 0);
  lua_setglobal(L, "_colony_global_setInterval");
//  lua_pushcclosure(L, colony_dointerrupt, 0);
//  lua_setfield(L, -2, "dointerrupt");

  colony_buffer_init(L);
  lua_pushcclosure(L, colony_buffer_new, 0);
  lua_setglobal(L, "_colony_global_Buffer");

//  lua_remove(L, -1);
//
//  lua_setfield(L, -2, "colony");
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
  lua_State *L = lua_open();
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
