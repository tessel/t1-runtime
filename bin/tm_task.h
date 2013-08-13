// Tasks
#ifndef _TASK_H
#define _TASK_H

#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>

#include <stdint.h>
#include <setjmp.h>

typedef struct tm_task
{
  int (*taskfn)(void *);
  int (*taskinterrupt)(void *);
  void *taskdata;
  void *data;
  struct tm_task *tasknext;
} tm_task_t;

typedef tm_task_t** tm_task_loop_t;

tm_task_loop_t tm_task_default_loop (void);
void tm_task_run (tm_task_loop_t queue);

// Threadsafe interrupt all
void tm_task_interruptall ();

void tm_task_lua_start (tm_task_loop_t queue, lua_State *L, int ref, int dounref);
void tm_task_luaparse_start (tm_task_loop_t queue, lua_State *L, uint8_t *buf, size_t size);

// Colony

typedef struct {
  void (*timerf)(void *);
  double time;
  double repeat;
  uint8_t alive;
  void *userdata;
} tm_task_timer_t;

typedef struct {
  size_t size;
  uint8_t *buf;
  lua_State *L;
} tm_task_luaparse_endpoint_t;

typedef struct {
  lua_State *L;
  int ref;
  int dounref;
  jmp_buf jmp;
} tm_task_lua_endpoint_t;

#endif