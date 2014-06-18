// Copyright 2014 Technical Machine, Inc. See the COPYRIGHT
// file at the top-level directory of this distribution.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>

#include "colony.h"
#include "regalone.h"
#include "regex.h"

#ifdef REGEX_WCHAR
# define chr  wchar_t
# define re_comp  re_wcomp
# define re_exec  re_wexec
#else
# define chr  char
#endif

static int l_regex_create (lua_State* L)
{
  regex_t* cre = (regex_t*) lua_newuserdata(L, sizeof(regex_t));
  memset(cre, 0, sizeof(regex_t));
  return 1;
}

static int l_regex_nsub (lua_State* L)
{
  regex_t* cre = (regex_t*) lua_touserdata(L, 1);

  lua_pushnumber(L, cre->re_nsub);
  return 1;
}

static int l_regmatch_create (lua_State* L)
{
  size_t n = (size_t) lua_tonumber(L, 1);

  regmatch_t* pmatch = (regmatch_t*) lua_newuserdata(L, sizeof(regmatch_t) * n);
  memset(pmatch, 0, sizeof(regmatch_t) * n);
  return 1;
}

static int l_regmatch_so (lua_State* L)
{
  regmatch_t* pmatch = (regmatch_t*) lua_touserdata(L, 1);
  size_t n = (size_t) lua_tonumber(L, 2);

  lua_pushnumber(L, pmatch[n].rm_so);
  return 1;
}

static int l_regmatch_eo (lua_State* L)
{
  regmatch_t* pmatch = (regmatch_t*) lua_touserdata(L, 1);
  size_t n = (size_t) lua_tonumber(L, 2);

  lua_pushnumber(L, pmatch[n].rm_eo);
  return 1;
}

// Lua is using ascii. We are too, until we have real usc2 functions.

static chr* _toregexstr (const char *input, size_t input_len, chr *output, size_t* output_len)
{
  #ifdef REGEX_WCHAR
    *output_len = mbstowcs(output, input, input_len);
  #else
    *output_len = memcpy(output, input, input_len);
  #endif
  return output;
}

static chr* toregexstr (const char *input, size_t input_len, size_t* output_len)
{
  chr* output = (chr*) calloc(1, input_len * sizeof(chr));
  return _toregexstr(input, input_len, output, output_len);
}

static const chr* lua_toregexstr (lua_State* L, int pos, size_t* buflen)
{
  size_t patt_len = 0;
  const char *patt = lua_tolstring(L, pos, &patt_len);
  chr *mbpatt = (chr *) lua_newuserdata(L, (patt_len+1) * sizeof(chr));
  return _toregexstr(patt, patt_len, mbpatt, buflen);
}

static int l_re_comp (lua_State* L)
{
  size_t pattlen;
  regex_t* cre = (regex_t*) lua_touserdata(L, 1);
  int flags = (int) lua_tonumber(L, 3);

  const wchar_t* patt = lua_toregexstr(L, 2, &pattlen);
  int rc = re_comp(cre, patt, pattlen, flags);

  lua_pushnumber(L, rc);
  return 2;
}

static int l_re_exec (lua_State* L)
{
  regex_t* cre = (regex_t*) lua_touserdata(L, 1);
  // ignore 3
  int pmatchlen = (int) lua_tonumber(L, 4);
  regmatch_t* pmatch = (regmatch_t*) lua_touserdata(L, 5);
  int flags = (int) lua_tonumber(L, 6);

  size_t input_len;
  const char* input = lua_tolstring(L, 2, &input_len);
  size_t data_len;
  chr* data = toregexstr(input, input_len, &data_len);
  int rc = re_exec(cre, data, data_len, NULL, pmatchlen, pmatch, flags);
  lua_pushnumber(L, rc);
  return 1;
}

static int l_regerror (lua_State* L)
{
  int rc = (int) lua_tonumber(L, 1);
  regex_t* cre = (regex_t*) lua_touserdata(L, 2);

  char buf[1024] = { 0 };
  regerror(rc, cre, buf, sizeof(buf));
  lua_pushstring(L, buf);
  return 1;
}

static int l_regfree (lua_State* L)
{
  regfree(lua_touserdata(L, 1));
  return 0;
}

static int l_regex_split (lua_State *L)
{
  // stack: this regex
  size_t input_len = 0;
  const char* input = lua_tolstring(L, 1, &input_len);
  lua_getmetatable(L, 2);
  lua_getfield(L, -1, "cre");
  regex_t* cre = (regex_t*) lua_touserdata(L, -1);

  // matches
  int pmatch_len = 100;
  lua_getglobal(L, "_HSMATCH");
  regmatch_t* pmatch = (regmatch_t*) lua_touserdata(L, -1);

  lua_checkstack(L, 256); // double each time

  size_t w_input_len = 0;
  chr* orig_w_input = toregexstr(input, input_len, &w_input_len);
  chr* w_input = orig_w_input;

  lua_createtable(L, 0, 0);

  int idx = 0;
  while (w_input_len > 0) {
    int rc = re_exec(cre, w_input, w_input_len, NULL, pmatch_len, pmatch, 0);
    if (rc != 0) {
      lua_pushlstring(L, input, input_len);
      lua_rawseti(L, -2, idx);
      idx++;
      break;
    }

    lua_pushlstring(L, input, pmatch[0].rm_so);
    lua_rawseti(L, -2, idx);

    w_input = &w_input[pmatch[0].rm_eo];
    input = &input[pmatch[0].rm_eo];
    idx++;
    w_input_len -= pmatch[0].rm_eo;
    input_len -= pmatch[0].rm_eo;
  }

  free(orig_w_input);

  return 1;
}

/**
 * Load evinrude.
 */

#define luaL_setfieldnumber(L, str, num) lua_pushnumber (L, num); lua_setfield (L, -2, str);

LUALIB_API int luaopen_hsregex (lua_State *L)
{
  lua_newtable (L);
  luaL_register(L, NULL, (luaL_reg[]) {

    { "regex_create", l_regex_create },
    { "regex_nsub", l_regex_nsub },
    { "regmatch_create", l_regmatch_create },
    { "regmatch_so", l_regmatch_so },
    { "regmatch_eo", l_regmatch_eo },
    { "re_comp", l_re_comp },
    { "re_exec", l_re_exec },
    { "regerror", l_regerror },
    { "regfree", l_regfree },
    { "regex_split", l_regex_split },

    { NULL, NULL }
  });
  luaL_setfieldnumber(L, "ADVANCED", REG_ADVANCED);
  luaL_setfieldnumber(L, "NOSUB", REG_NOSUB);
  return 1;
}
