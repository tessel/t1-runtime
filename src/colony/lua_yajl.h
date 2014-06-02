// Copyright 2014 Technical Machine, Inc. See the COPYRIGHT
// file at the top-level directory of this distribution.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

#ifndef _LUA_YAJL_H_
#define _LUA_YAJL_H_

#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>

LUALIB_API int luaopen_yajl(lua_State *L);

#endif