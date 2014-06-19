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

#include <ctype.h>

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


/**
 * Regex bindings
 */

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

typedef struct {
  uint8_t* string;
  size_t len;
  size_t buffer_len;
} stringbuilder_t;

static stringbuilder_t stringbuilder_create ()
{
  stringbuilder_t b;
  b.string = NULL;
  b.len = 0;
  b.buffer_len = 0;
  return b;
}

unsigned long upper_power_of_two(unsigned long v)
{
  v--;
  v |= v >> 1;
  v |= v >> 2;
  v |= v >> 4;
  v |= v >> 8;
  v |= v >> 16;
  v++;
  return v;
}

static void stringbuilder_append (stringbuilder_t* b, const char* input, size_t input_len)
{
  if (b->len + input_len + 1 >= b->buffer_len) {
    size_t newlen = upper_power_of_two((b->buffer_len < 64 ? 64 : b->buffer_len) + input_len);
    b->string = realloc(b->string, newlen);
    b->buffer_len = newlen;
  }
  memcpy(&b->string[b->len], input, input_len);
  b->len += input_len;
  b->string[b->len] = 0;
}

static int l_regex_replace (lua_State *L)
{
  // stack: this regex out
  size_t input_len = 0;
  const char* input = lua_tolstring(L, 1, &input_len);
  lua_getmetatable(L, 2);
  lua_getfield(L, -1, "cre");
  regex_t* cre = (regex_t*) lua_touserdata(L, -1);

  lua_getfield(L, 2, "flags");
  const char* regex_flags = lua_tostring(L, -1);
  int repeat_flag = strstr(regex_flags, "g") == NULL;

  // matches
  int pmatch_len = 100;
  lua_getglobal(L, "_HSMATCH");
  regmatch_t* pmatch = (regmatch_t*) lua_touserdata(L, -1);

  size_t w_input_len = 0;
  chr* orig_w_input = toregexstr(input, input_len, &w_input_len);
  chr* w_input = orig_w_input;

  int nullmatch_flag = 0;
  int isfn_flag = lua_isfunction(L, 3);

  // Replace with strings.
  size_t out_len = 0, orig_out_len = 0;
  const char* out = NULL;
  const char* orig_out = NULL;
  if (!isfn_flag) {
    out = lua_tolstring(L, 3, &out_len);
    orig_out_len = out_len;
    orig_out = out;
  }

  stringbuilder_t b = stringbuilder_create();

  int flags = 0;
  do {
    // Create match.
    int rc = re_exec(cre, w_input, w_input_len, NULL, pmatch_len, pmatch, flags);
    if (rc != 0) {
      break;
    }

    // On next loop, we won't be first.
    flags = REG_NOTBOL;

    // Don't make an empty match twice.
    if (nullmatch_flag) {
      nullmatch_flag = 0;
      if (input_len == 0) {
        break;
      }

      stringbuilder_append(&b, &input[0], 1);

      input_len -= 1;
      w_input_len -= 1;
      input = &input[1];
      w_input = &w_input[1];
      continue;
    }

    nullmatch_flag = pmatch[0].rm_so == pmatch[0].rm_eo;
    if (pmatch[0].rm_so > 0) {
      stringbuilder_append(&b, &input[0], pmatch[0].rm_so);
    }

    if (isfn_flag) {
      lua_pushvalue(L, 3);

      lua_pushvalue(L, 1); // this
      lua_pushlstring(L, &input[pmatch[0].rm_so], pmatch[0].rm_eo - pmatch[0].rm_so);
      for (size_t i = 0; i < cre->re_nsub; i++) {
        if (pmatch[i+1].rm_so > -1 && pmatch[i+1].rm_eo > -1) {
          lua_pushlstring(L, &input[pmatch[i+1].rm_so], pmatch[i+1].rm_eo - pmatch[i+1].rm_so);
        } else {
          lua_pushnil(L);
        }
      }
      lua_pushnumber(L, pmatch[0].rm_so);
      lua_pushvalue(L, 1);
      lua_call(L, 4 + cre->re_nsub, 1);

      size_t sect_len = 0;
      const char* sect = NULL;
      if (lua_isnil(L, -1)) {
        sect = "undefined";
        sect_len = 9;
      } else {
        sect = lua_tolstring(L, -1, &sect_len);
      }
      lua_remove(L, -1);
      stringbuilder_append(&b, sect, sect_len);
    } else {
      out = orig_out;
      out_len = orig_out_len;

      for (size_t i = 0; out_len > 0 && i < out_len - 1; i++) {
        if (out[i] == '$' && isdigit((unsigned char) out[i+1])) {
          int subindex_i = 0, offset_i = 0;
          // safe since lua_tolstring returns null-terminated string
          if (sscanf(&out[i], "$%d%n", &subindex_i, &offset_i)) {
            size_t offset = (size_t) offset_i, subindex = (size_t) subindex_i;
            // check subindex is valid
            if (subindex_i > 0 && subindex <= cre->re_nsub) {
              stringbuilder_append(&b, out, i);
              stringbuilder_append(&b, &input[pmatch[subindex].rm_so], pmatch[subindex].rm_eo - pmatch[subindex].rm_so);
            } else {
              stringbuilder_append(&b, out, offset);
            }
            out = &out[i + offset];
            out_len -= i + offset;
            i = -1;
          }
        }
      }
      if (out_len > 0) {
        stringbuilder_append(&b, out, out_len);
      }
    }

    input = &input[pmatch[0].rm_eo];
    input_len -= pmatch[0].rm_eo;
    w_input = &w_input[pmatch[0].rm_eo];
    w_input_len -= pmatch[0].rm_eo;
  } while (!repeat_flag);

  stringbuilder_append(&b, input, input_len);
  lua_pushlstring(L, (const char*) b.string, b.len);
  free(b.string);

  free(orig_w_input);

  return 1;
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
  lua_pushnumber(L, idx);

  return 2;
}


/**
 * Load hsregex.
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
    { "regex_replace", l_regex_replace },

    { NULL, NULL }
  });
  luaL_setfieldnumber(L, "ADVANCED", REG_ADVANCED);
  luaL_setfieldnumber(L, "NOSUB", REG_NOSUB);
  return 1;
}
