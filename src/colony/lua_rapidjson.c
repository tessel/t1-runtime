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

int colony_isarray (lua_State* L, int pos)
{
  // TODO fix
  lua_getfield(L, pos, "length");
  int ret = lua_isnil(L, -1);
  lua_pop(L, 1);
  return !ret;
}

void colony_array_length (lua_State* L, int pos)
{
  // TODO fix
  lua_getfield(L, pos, "length");
}

static void state_key_get (lua_State* L) { lua_pushvalue(L, 2); }
static void state_key_set (lua_State* L) { lua_replace(L, 2); }

static void state_ret_get (lua_State* L) { lua_pushvalue(L, 3); }
static void state_ret_set (lua_State* L) { lua_replace(L, 3); }

static int state_iskey_get (lua_State* L) { return lua_toboolean(L, 4); }
static void state_iskey_set (lua_State* L, int val) { lua_pushboolean(L, val); lua_replace(L, 4); }

/* Callback to Lua for parsing default values */
static void cb_Default(void* state_) {
  // ignore
}

/* Callback to Lua for parsing nulls */
static void cb_Null(void* state) {
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
static void cb_Bool(void* state, bool value) {
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
static void cb_Double(void* state, double value) {
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
static void cb_Int(void* state, int value) { cb_Double(state, value); }

/* Callback to Lua for parsing unsigned ints */
static void cb_Uint(void* state, unsigned value) { cb_Double(state, value); }

/* Callback to Lua for parsing 64 bit ints */
static void cb_Int64(void* state, int64_t value) { cb_Double(state, value); }

/* Callback to Lua for parsing unsigned 64 bit ints */
static void cb_Uint64(void* state, uint64_t value) { cb_Double(state,value); }

/* Callback to Lua for parsing strings */
static void cb_String(void* state, const char* value, size_t str_len, bool set) {
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
static void cb_StartObject(void* state) {
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
static void cb_EndObject(void* state, size_t value) {
  lua_State* L = (lua_State*) state;
  int top = lua_gettop(L);

  state_ret_set(L);                         // pops stack
  state_iskey_set(L, 1);

  assert(top - 1 == lua_gettop(L));

}

/* Callback to Lua for parsing start of an array */
static void cb_StartArray(void* state) {
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
static void cb_EndArray(void* state, size_t value) {
  lua_State* L = (lua_State*) state;
  int top = lua_gettop(L);

  state_ret_set(L);                         // (obj) -> ()
  state_iskey_set(L, 1);

  assert(top - 1 == lua_gettop(L));
}

/* Calls Lua to deal with any error that occurs when parsing */
static void on_error(lua_State *L, const char* val, parse_error_t err) {
  lua_getfield(L, LUA_GLOBALSINDEX,"json_error");
  lua_pushstring(L,val);
  lua_pushnumber(L,err.code);
  lua_pushnumber(L,err.offset);
  lua_call(L,3,0);
}

/* Parsing function called by lua to turn JSON strings to a Lua table */
static int tm_json_read(lua_State *L) {

  // get the string to parse
  const char* value = lua_tostring(L, 1);

  // Widen bottom of stack for key and return value state.
  lua_pushnil(L);
  lua_insert(L, 2); // key
  lua_pushnil(L);
  lua_insert(L, 3); // return value
  lua_pushnil(L);
  lua_insert(L, 4); // is key?

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
static int tm_json_create(lua_State *L) {
  size_t len;
  const char* indentation = lua_tolstring(L, 1, &len);

  tm_json_w_handler_t wh = tm_json_write_create(indentation, len);
  void* addr = lua_newuserdata(L, sizeof(tm_json_w_handler_t));
  memcpy(addr,&wh,sizeof(tm_json_w_handler_t));
  return 1;
}

/* Allows Lua call rapidjson's ability to write strings */
static int tm_json_to_string (lua_State *L) {
  tm_json_w_handler_t* wh = (tm_json_w_handler_t*)lua_touserdata(L, 1);
  const char* value = lua_tostring(L, 2);
  tm_json_write_string(*wh,value);
  return 1;
}

/* Allows Lua call rapidjson's ability to write booleans */
static int tm_json_to_boolean(lua_State *L) {
  tm_json_w_handler_t* wh = (tm_json_w_handler_t*)lua_touserdata(L, 1);
  int value = lua_toboolean(L, 2);
  tm_json_write_boolean(*wh,value);
  return 1;
}

/* Allows Lua call rapidjson's ability to write numbers */
static int tm_json_to_number(lua_State *L) {
  tm_json_w_handler_t* wh = (tm_json_w_handler_t*)lua_touserdata(L, 1);
  lua_Number value = lua_tonumber(L, 2);
  tm_json_write_number(*wh,value);
  return 1;
}

/* Allows Lua call rapidjson's ability to write null values */
static int tm_json_to_null(lua_State *L) {
  tm_json_w_handler_t* wh = (tm_json_w_handler_t*)lua_touserdata(L, 1);
  tm_json_write_null(*wh);
  return 1;
}

/* Allows Lua call rapidjson's ability to write the start of objects */
static int tm_json_start_object(lua_State *L) {
  tm_json_w_handler_t* wh = (tm_json_w_handler_t*)lua_touserdata(L, 1);
  tm_json_write_object_start(*wh);
  return 1;
}

/* Allows Lua call rapidjson's ability to write the end of objects */
static int tm_json_end_object(lua_State *L) {
  tm_json_w_handler_t* wh = (tm_json_w_handler_t*)lua_touserdata(L, 1);
  tm_json_write_object_end(*wh);
  return 1;
}

/* Allows Lua call rapidjson's ability to write the start of arrays */
static int tm_json_start_array(lua_State *L) {
  tm_json_w_handler_t* wh = (tm_json_w_handler_t*)lua_touserdata(L, 1);
  tm_json_write_array_start(*wh);
  return 1;
}

/* Allows Lua call rapidjson's ability to write the end of arrays */
static int tm_json_end_array(lua_State *L) {
  tm_json_w_handler_t* wh = (tm_json_w_handler_t*)lua_touserdata(L, 1);
  tm_json_write_array_end(*wh);
  return 1;
}

/* Allows Lua call rapidjson's ability to write out what's in it's buffer */
static int tm_json_result(lua_State *L) {
  tm_json_w_handler_t* wh = (tm_json_w_handler_t*)lua_touserdata(L, 1);
  const char* str = tm_json_write_result(*wh);
  lua_pushstring(L, str);
  return 1;
}

/* Allows Lua call rapidjson's ability to destroy the writing handler */
static int tm_json_destroy(lua_State *L) {
  tm_json_w_handler_t* wh = (tm_json_w_handler_t*)lua_touserdata(L, 1);
  tm_json_write_destroy(*wh);
  return 1;
}

/* Creates and pushes to a table the function that Lua needs to access */
int lua_open_rapidjson(lua_State *L) {

  lua_createtable(L, 0, 0);

  lua_pushcfunction(L, tm_json_read);
  lua_setfield(L, -2, "parse");

  lua_pushcfunction(L, tm_json_create);
  lua_setfield(L, -2, "create_writer");

  lua_pushcfunction(L, tm_json_to_string);
  lua_setfield(L, -2, "to_string");

  lua_pushcfunction(L, tm_json_to_boolean);
  lua_setfield(L, -2, "to_boolean");

  lua_pushcfunction(L, tm_json_to_number);
  lua_setfield(L, -2, "to_number");

  lua_pushcfunction(L, tm_json_to_null);
  lua_setfield(L, -2, "to_null");

  lua_pushcfunction(L, tm_json_start_object);
  lua_setfield(L, -2, "object_start");

  lua_pushcfunction(L, tm_json_end_object);
  lua_setfield(L, -2, "object_end");

  lua_pushcfunction(L, tm_json_start_array);
  lua_setfield(L, -2, "array_start");

  lua_pushcfunction(L, tm_json_end_array);
  lua_setfield(L, -2, "array_end");

  lua_pushcfunction(L, tm_json_result);
  lua_setfield(L, -2, "result");

  lua_pushcfunction(L, tm_json_destroy);
  lua_setfield(L, -2, "destroy");

  return 1;

}
