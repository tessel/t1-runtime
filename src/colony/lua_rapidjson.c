// Copyright 2014 Technical Machine, Inc. See the COPYRIGHT
// file at the top-level directory of this distribution.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <stdbool.h>
#include <inttypes.h>
#include <assert.h>

#include <colony.h>
#include "lua_rapidjson.h"
#include "../tm_json.h"

void colony_array_length (lua_State* L, int pos)
{
  // TODO fix
  lua_getfield(L, pos, "length");
}

size_t colony_array_length_i (lua_State* L, int pos)
{
  // TODO fix
  lua_getfield(L, pos, "length");
  size_t ret = (size_t) lua_tonumber(L, -1);
  lua_pop(L, 1);
  return ret;
}

// Simple methods for referring to the state maintained carried by JSON parsing.

static void state_key_get (lua_State* L) { lua_pushvalue(L, 3); }
static void state_key_set (lua_State* L) { lua_replace(L, 3); }

static void state_ret_get (lua_State* L) { lua_pushvalue(L, 4); }
static void state_ret_set (lua_State* L) { lua_replace(L, 4); }

static int state_iskey_get (lua_State* L) { return lua_toboolean(L, 5); }
static void state_iskey_set (lua_State* L, int val) { lua_pushboolean(L, val); lua_replace(L, 5); }

/* Callback to Lua for parsing default values */
static void cb_Default (void* state_)
{
  // ignore
  (void) state_;
}

/* Callback to Lua for parsing nulls */
static void cb_Null (void* state)
{
  lua_State* L = (lua_State*) state;
  int top = lua_gettop(L);

  if (colony_isarray(L, -1)) {
    colony_array_length(L, -1);             // (arr, arr_len)
    lua_pushnil(L);                         // (arr, arr_len, value)
    lua_settable(L, -3);                    // (arr)
  } else {
    state_key_get(L);                       // (obj, key)
    lua_pushnil(L);                         // (obj, key, value)
    lua_settable(L, -3);                    // (obj)

    state_iskey_set(L, 1);
  }

  assert(top == lua_gettop(L));
}

/* Callback to Lua for parsing booleans */
static void cb_Bool (void* state, bool value)
{
  lua_State* L = (lua_State*) state;
  int top = lua_gettop(L);

  if (colony_isarray(L, -1)) {
    colony_array_length(L, -1);             // (arr, arr_len)
    lua_pushboolean(L, value);              // (arr, arr_len, value)
    lua_settable(L, -3);                    // (arr)
  } else {
    state_key_get(L);                       // (obj, key)
    lua_pushboolean(L, value);              // (obj, key, value)
    lua_settable(L, -3);                    // (obj)

    state_iskey_set(L, 1);
  }

  assert(top == lua_gettop(L));
}

/* Callback to Lua for parsing doubles */
static void cb_Double (void* state, double value)
{
  lua_State* L = (lua_State*) state;
  int top = lua_gettop(L);

  if (colony_isarray(L, -1)) {
    colony_array_length(L, -1);             // (arr, arr_len)
    lua_pushnumber(L, value);               // (arr, arr_len, value)
    lua_settable(L, -3);                    // (arr)
  } else {
    state_key_get(L);                       // (obj, key)
    lua_pushnumber(L, value);               // (obj, key, value)
    lua_settable(L, -3);                    // (obj)

    state_iskey_set(L, 1);
  }

  assert(top == lua_gettop(L));
}

/* Callback to Lua for parsing ints */
static void cb_Int (void* state, int value) { cb_Double(state, value); }

/* Callback to Lua for parsing unsigned ints */
static void cb_Uint (void* state, unsigned value) { cb_Double(state, value); }

/* Callback to Lua for parsing 64 bit ints */
static void cb_Int64 (void* state, int64_t value) { cb_Double(state, value); }

/* Callback to Lua for parsing unsigned 64 bit ints */
static void cb_Uint64 (void* state, uint64_t value) { cb_Double(state,value); }

/* Callback to Lua for parsing strings */
static void cb_String (void* state, const char* value, size_t str_len, bool docopy)
{
  (void) docopy;

  lua_State* L = (lua_State*) state;
  int top = lua_gettop(L);

  if (colony_isarray(L, -1)) {
    colony_array_length(L, -1);             // (arr, arr_len)
    lua_pushlstring(L, value, str_len);     // (arr, arr_len, str)
    lua_settable(L, -3);                    // (arr)
  } else if (state_iskey_get(L)) {
    lua_pushlstring(L, value, str_len);     // (obj, value)
    state_key_set(L);                       // (obj)

    state_iskey_set(L, 0);
  } else {
    state_key_get(L);                       // (obj, key)
    lua_pushlstring(L, value, str_len);     // (obj, key, value)
    lua_settable(L, -3);                    // (obj)

    state_iskey_set(L, 1);
  }

  assert(top == lua_gettop(L));
}

/* Callback to Lua for parsing start of an object */
static void cb_StartObject (void* state)
{
  lua_State* L = (lua_State*) state;
  int top = lua_gettop(L);

  if (lua_isnil(L, -1)) {
    colony_createobj(L, 0, 0);              // (nil, obj2)
  } else {
    colony_createobj(L, 0, 0);              // (obj, obj2)
    if (colony_isarray(L, -2)) {
      colony_array_length(L, -2);           // (arr, obj2, arr_len)
    } else {
      state_key_get(L);                     // (obj)
    }
    lua_pushvalue(L, -2);                   // (obj, obj2, value, obj2)
    lua_settable(L, -4);                    // (obj, obj2)
  }
  state_iskey_set(L, 1);

  assert(top + 1 == lua_gettop(L));
}

/* Callback to Lua for parsing end of an object */
static void cb_EndObject (void* state, size_t value)
{
  (void) value;

  lua_State* L = (lua_State*) state;
  int top = lua_gettop(L);

  state_ret_set(L);                         // pops stack
  state_iskey_set(L, 1);

  assert(top - 1 == lua_gettop(L));

}

/* Callback to Lua for parsing start of an array */
static void cb_StartArray (void* state)
{
  lua_State* L = (lua_State*) state;
  int top = lua_gettop(L);

  if (lua_isnil(L, -1)) {
    colony_createarray(L, 0);               // (nil, arr)
  } else {
    colony_createarray(L, 0);               // (obj, arr)
    if (colony_isarray(L, -2)) {
      colony_array_length(L, -2);           // (arr, arr2, arr_len)
    } else {
      state_key_get(L);                     // (obj)
    }
    lua_pushvalue(L, -2);                   // (obj, arr, value, arr)
    lua_settable(L, -4);                    // (obj, arr)
  }

  assert(top + 1 == lua_gettop(L));
}

/* Callback to Lua for parsing end of an array */
static void cb_EndArray (void* state, size_t value)
{
  (void) value;

  lua_State* L = (lua_State*) state;
  int top = lua_gettop(L);

  state_ret_set(L);                         // (obj) -> ()
  state_iskey_set(L, 1);

  assert(top - 1 == lua_gettop(L));
}

/* Calls Lua to deal with any error that occurs when parsing */
static void on_error (lua_State *L, const char* val, parse_error_t err)
{
  lua_pushvalue(L, 2);
  lua_pushstring(L,val);
  lua_pushnumber(L,err.code);
  lua_pushnumber(L,err.offset);
  lua_call(L,3,0);
}

/* Parsing function called by lua to turn JSON strings to a Lua table */
static int tm_json_read(lua_State *L)
{
  // get the string to parse
  const char* value = lua_tostring(L, 1);
  // index 2 is json_error

  // Widen bottom of stack for key and return value state.
  lua_pushnil(L);
  lua_insert(L, 3); // key
  lua_pushnil(L);
  lua_insert(L, 4); // return value
  lua_pushnil(L);
  lua_insert(L, 5); // is key?

  // create the reader callback handler
  tm_json_r_handler_t rh;
  rh.State = L;
  rh.Default = cb_Default;
  rh.Null = cb_Null;
  rh.Bool = cb_Bool;
  rh.Int = cb_Int;
  rh.Uint = cb_Uint;
  rh.Int64 = cb_Int64;
  rh.Uint64 = cb_Uint64;
  rh.Double = cb_Double;
  rh.String = cb_String;
  rh.StartObject = cb_StartObject;
  rh.EndObject = cb_EndObject;
  rh.StartArray = cb_StartArray;
  rh.EndArray = cb_EndArray;

  // call rapidjson to parse the string
  int top = lua_gettop(L);
  lua_pushnil(L);
  parse_error_t parse_err = tm_json_parse(rh,value);
  lua_settop(L, top);

  // if there's an error deal with it
  if(parse_err.code) { on_error(L,value,parse_err); }

  // return the parsed string
  state_ret_get(L);
  return 1;
}


/*
 * stringify
 */

/* Creates the writting handler for the writing functions to work */
static int tm_json_create (lua_State *L)
{
  size_t len;
  const char* indentation = lua_tolstring(L, 1, &len);

  tm_json_w_handler_t wh = tm_json_write_create(indentation, len);
  void* addr = lua_newuserdata(L, sizeof(tm_json_w_handler_t));
  memcpy(addr,&wh,sizeof(tm_json_w_handler_t));
  return 1;
}

/* Allows Lua call rapidjson's ability to write out what's in it's buffer */
static int tm_json_result (lua_State *L)
{
  tm_json_w_handler_t* wh = (tm_json_w_handler_t*)lua_touserdata(L, 1);
  const char* str = tm_json_write_result(*wh);
  lua_pushstring(L, str);
  return 1;
}

/* Allows Lua call rapidjson's ability to destroy the writing handler */
static int tm_json_destroy (lua_State *L)
{
  tm_json_w_handler_t* wh = (tm_json_w_handler_t*)lua_touserdata(L, 1);
  tm_json_write_destroy(*wh);
  return 1;
}

/* Write a Lua value into rapidjson */
static int tm_json_writer (lua_State *L)
{
  const int IDX_HANDLER = 1;
  const int IDX_VALUE = 2;
  const int IDX_REPLACER = 3;
  const int IDX_OPT_KEY = 4;
  const int IDX_OPT_THIS = 5;

  tm_json_w_handler_t* wh = (tm_json_w_handler_t*) lua_touserdata(L, IDX_HANDLER);
  int tojson_called = 0;

  // If a replacer function is given, call it.
  if (lua_isfunction(L, IDX_REPLACER)) {
    lua_pushvalue(L, IDX_REPLACER);            // (value[i], fn)
    lua_pushvalue(L, IDX_OPT_THIS);            // (value[i], fn, value)
    if (lua_isnil(L, IDX_OPT_KEY)) {
      lua_pushliteral(L, "");
    } else {
      lua_pushvalue(L, IDX_OPT_KEY);             // (value[i], fn, value, i)
    }
    lua_pushvalue(L, IDX_VALUE);               // (value[i], fn, value, i, value[i])
    lua_call(L, 3, 1);                         // (value[i])
    if (lua_isnil(L, -1)) {
      lua_pop(L, 1);
      return 0;
    }
    lua_replace(L, 2);
  }

  if (!lua_isnil(L, IDX_OPT_KEY)) {
    // Write key string.
    lua_pushvalue(L, IDX_OPT_KEY);
    size_t key_len = 0;
    const char* key = lua_tolstring(L, -1, &key_len);
    lua_pop(L, 1);

    tm_json_write_string(*wh, key, key_len);
  }

tojson_loop:
  switch (lua_type(L, IDX_VALUE)) {
    case LUA_TNIL: {
      tm_json_write_null(*wh);
      break;
    }

    case LUA_TBOOLEAN: {
      tm_json_write_boolean(*wh, lua_toboolean(L, IDX_VALUE));
      break;
    }

    case LUA_TNUMBER: {
      tm_json_write_number(*wh, lua_tonumber(L, IDX_VALUE));
      break;
    }

    case LUA_TSTRING: {
      size_t str_len = 0;
      const char* str = lua_tolstring(L, IDX_VALUE, &str_len);
      tm_json_write_string(*wh, str, str_len);
      break;
    }

    case LUA_TTABLE: {
      // TODO buffer should use .toJSON()
      if (colony_isarray(L, IDX_VALUE) || colony_isbuffer(L, IDX_VALUE)) {
        tm_json_write_array_start(*wh);

        size_t value_len = colony_array_length_i(L, IDX_VALUE);
        for (size_t i = 0; i < value_len; i++) {
          // Get value in array or buffer.
          lua_pushnumber(L, i);
          lua_gettable(L, IDX_VALUE);               // (value[i])

          // If a replacer function is given, call it.
          if (lua_isfunction(L, 3)) {
            lua_pushvalue(L, 3);            // (value[i], fn)
            lua_pushvalue(L, 2);            // (value[i], fn, value)
            lua_pushnumber(L, i);           // (value[i], fn, value, i)
            lua_pushvalue(L, -2);           // (value[i], fn, value, i, value[i])
            lua_call(L, 3, 1);              // (value[i])
            lua_remove(L, -2);
          }

          // Only recursively solve for serializable values.
          switch (lua_type(L, -1)) {
            // Convert exotic variable types to null.
            case LUA_TFUNCTION:
            case LUA_TTHREAD:
            case LUA_TUSERDATA:
              tm_json_write_null(*wh);
              break;

            default:
              lua_pushcfunction(L, tm_json_writer);
              lua_pushvalue(L, 1);          // (value[i], recurser, handler)
              lua_pushvalue(L, -3);         // (value[i], recurser, handler, value[i])
              lua_pushvalue(L, IDX_REPLACER);
              lua_pushnil(L);
              lua_pushvalue(L, IDX_VALUE);  // this
              lua_call(L, 5, 0);            // (value[i])
              break;
          }
          
          lua_pop(L, 1);                    // ()
        }
        tm_json_write_array_end(*wh);
      } else {
        // Attempt to call .toJSON to override value.
        // If a toJSON method exists, call method, replace IDX_VALUE and loop.
        if (!tojson_called && lua_type(L, -1) == LUA_TTABLE) {
          lua_getfield(L, IDX_VALUE, "toJSON");
          if (lua_isfunction(L, -1) != 0) {
            lua_pushvalue(L, IDX_VALUE);            // val for `this`
            lua_pushvalue(L, IDX_OPT_KEY);
            lua_call(L, 2, 1);
            lua_replace(L, IDX_VALUE);
            tojson_called = 1;
            goto tojson_loop;
          } else {
            lua_pop(L, 1);
          }
        }

        tm_json_write_object_start(*wh);

        // Replacer array with keys.
        if (lua_type(L, IDX_REPLACER) == LUA_TTABLE) {
          lua_createtable(L, 0, 0);

          size_t replacer_len = colony_array_length_i(L, IDX_REPLACER);
          for (size_t i = 0; i < replacer_len; i++) {
            lua_pushnumber(L, i);           // (table, i)
            lua_gettable(L, IDX_REPLACER);  // (table, key)
            lua_tostring(L, -1); // cast to string
            lua_pushvalue(L, -1);           // (table, key, key)
            lua_gettable(L, IDX_VALUE);     // (table, key, value)
            if (!lua_isnil(L, -1)) {
              lua_settable(L, -3);          // (table)
            } else {
              lua_pop(L, 2);                // (table)
            }
          }
          lua_replace(L, IDX_VALUE);
        }

        /* table is in the stack at index 't' */
        lua_pushnil(L);  /* first key */
        while (lua_next(L, IDX_VALUE) != 0) {       // (value[i])
          switch (lua_type(L, -1)) {
            // Convert exotic variable types to null.
            case LUA_TFUNCTION:
            case LUA_TTHREAD:
            case LUA_TUSERDATA:
              break;

            default:
              lua_pushcfunction(L, tm_json_writer);
              lua_pushvalue(L, 1);          // (value[i], recurser, handler)
              lua_pushvalue(L, -3);         // (value[i], recurser, handler, value[i])
              lua_pushvalue(L, IDX_REPLACER);
              lua_pushvalue(L, -6);
              lua_pushvalue(L, IDX_VALUE);  // this
              lua_call(L, 5, 0);            // (value[i])
              break;
          }
          
          lua_pop(L, 1);                    // ()
        }
        tm_json_write_object_end(*wh);
      }
      break;
    }

    // Expose exotic variables as "{}""
    default:
      tm_json_write_object_start(*wh);
      tm_json_write_object_end(*wh);
      break;
  }

  return 0;
}

/* Creates and pushes to a table the function that Lua needs to access */
int lua_open_rapidjson (lua_State *L)
{
  lua_createtable(L, 0, 0);

  lua_pushcfunction(L, tm_json_read);
  lua_setfield(L, -2, "parse");

  lua_pushcfunction(L, tm_json_create);
  lua_setfield(L, -2, "create_writer");

  lua_pushcfunction(L, tm_json_result);
  lua_setfield(L, -2, "result");

  lua_pushcfunction(L, tm_json_destroy);
  lua_setfield(L, -2, "destroy");

  lua_pushcfunction(L, tm_json_writer);
  lua_setfield(L, -2, "write_value");

  return 1;

}
