#ifndef _COLONY_H
#define _COLONY_H

#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>
#include <stdlib.h>
#include <string.h>

#include "tm_task.h"

lua_State *colony_init ();
void colony_libload (lua_State *L);
void colony_close (lua_State *L);

#endif