#ifndef _COLONY_H
#define _COLONY_H

#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>
#include <stdlib.h>
#include <string.h>

#include "tm_task.h"

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
  int size;
  char values[1];
} Buffer_t;

lua_State *colony_init ();
void colony_libload (lua_State *L);
void colony_close (lua_State *L);

Buffer_t *colony_buffer_verify (lua_State *L, int idx);
uint8_t *colony_buffer_ensure (lua_State *L, int idx, size_t *size);

#ifdef __cplusplus
}
#endif

#endif
