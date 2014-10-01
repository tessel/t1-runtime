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
#include <colony.h>
#include "lua_rapidjson.h"
#include "../tm_json.h"

/* Callback to Lua for parsing default values */
void cb_Default() {
  lua_getfield(tm_lua_state, LUA_GLOBALSINDEX, "json_read_default");
  lua_call(tm_lua_state,0,0);
}

/* Callback to Lua for parsing nulls */
void cb_Null() {
  lua_getfield(tm_lua_state, LUA_GLOBALSINDEX, "json_read_null");
  lua_call(tm_lua_state,0,0);
}

/* Callback to Lua for parsing booleans */
void cb_Bool(bool value) {
  lua_getfield(tm_lua_state, LUA_GLOBALSINDEX, "json_read_value");
  lua_pushboolean(tm_lua_state,value);
  lua_call(tm_lua_state,1,0);
}

/* Callback to Lua for parsing doubles */
void cb_Double(double value) {
  lua_getfield(tm_lua_state, LUA_GLOBALSINDEX, "json_read_double");
  lua_pushnumber(tm_lua_state,value);
  lua_call(tm_lua_state,1,0);
}

/* Callback to Lua for parsing ints */
void cb_Int(int value) { cb_Double(value); }

/* Callback to Lua for parsing unsigned ints */
void cb_Uint(unsigned value) { cb_Double(value); }

/* Callback to Lua for parsing 64 bit ints */
void cb_Int64(int64_t value) { cb_Double(value); }

/* Callback to Lua for parsing unsigned 64 bit ints */
void cb_Uint64(uint64_t value) { cb_Double(value); }

/* Callback to Lua for parsing strings */
void cb_String(const char* value, size_t len, bool set) {lua_getfield(tm_lua_state, LUA_GLOBALSINDEX, "json_read_string");
  lua_pushstring(tm_lua_state,value);
  lua_pushnumber(tm_lua_state,len);
  lua_pushboolean(tm_lua_state,set);
  lua_call(tm_lua_state, 3, 0);
}

/* Callback to Lua for parsing start of an object */
void cb_StartObject() {
  lua_getfield(tm_lua_state, LUA_GLOBALSINDEX, "json_read_start_object");
  lua_call(tm_lua_state,0,0);
}

/* Callback to Lua for parsing end of an object */
void cb_EndObject(size_t value) {
  lua_getfield(tm_lua_state, LUA_GLOBALSINDEX, "json_read_end_object");
  lua_pushnumber(tm_lua_state,value);
  lua_call(tm_lua_state,1,0);
}

/* Callback to Lua for parsing start of an array */
void cb_StartArray() {
  lua_getfield(tm_lua_state, LUA_GLOBALSINDEX, "json_read_start_array");
  lua_call(tm_lua_state,0,0);
}

/* Callback to Lua for parsing end of an array */
void cb_EndArray(size_t value) {
  lua_getfield(tm_lua_state, LUA_GLOBALSINDEX, "json_read_end_array");
  lua_pushnumber(tm_lua_state,value);
  lua_call(tm_lua_state,1,0);
}

/* Calls Lua to deal with any error that occurs when parsing */
void on_error(lua_State *L, const char* val, parse_error_t err) {
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

  // create the reader handler
  tm_json_r_handler_t rh;

  // set the handler function pointers
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
  parse_error_t parse_err = tm_json_parse(rh,value);

  // if there's an error deal with it
  if(parse_err.code) { on_error(L,value,parse_err); }

  // return the parsed string (eventually)
  return 1;
}

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
