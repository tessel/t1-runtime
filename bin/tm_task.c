#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>
#include <stdlib.h>

#include "tm_task.h"
#include "time.h"


double millis () {
  struct timeval tv;
  gettimeofday(&tv, NULL);

  double time_in_mill = (tv.tv_sec) * 1000 + (tv.tv_usec) / 1000;
  return time_in_mill;
}


/**
 * Event queue
 */

tm_task_t *queue = NULL;

tm_task_loop_t tm_task_default_loop ()
{
 return &queue;
}

static void tm_task_push (tm_task_loop_t queue, tm_task_t *task)
{
 tm_task_t *item = *queue;
 if (item == NULL) {
   *queue = task;
   return;
 }
 while (item->tasknext != NULL) {
   item = item->tasknext;
 }
 item->tasknext = task;
}

static void tm_task_remove (tm_task_loop_t queue, tm_task_t *task)
{
 tm_task_t *item = *queue;
 if (item == task) {
   *queue = item->tasknext;
   return;
 }
 while (item->tasknext != task) {
   item = item->tasknext;
 }
 item->tasknext = task->tasknext;
}

static tm_task_t *tm_task_create (int (*f)(void *), int (*interrupt)(void *), void *taskdata)
{
  tm_task_t *task = calloc(1, sizeof(tm_task_t));
  task->taskfn = f;
  task->taskinterrupt = interrupt;
  task->taskdata = taskdata;
  return task;
}

tm_task_t *queue_current = NULL;

static tm_task_t *tm_task_current (tm_task_loop_t queue)
{
  return queue_current;
}

void tm_task_run (tm_task_loop_t queue)
{
  while ((*queue) != NULL) {
    tm_task_t *item = *queue;
    while (item != NULL) {
      tm_task_t *last = item;
      queue_current = item;
      int remove = (item->taskfn(item->taskdata)) == 0;
      item = item->tasknext;
      if (remove) {
        tm_task_remove(queue, last);
        free(last);
      }
    }
  }
}

void tm_task_interruptall (tm_task_loop_t queue)
{
  tm_task_t *item = *queue;
  while (item != NULL) {
    if (item->taskinterrupt != NULL) {
      item->taskinterrupt(item->taskdata);
    }
    item = item->tasknext;
  }
}


/**
 * Idle
 */

int tm_task_timer_endpoint (void *_taskdata)
{
  tm_task_timer_t *taskdata = (tm_task_timer_t *) _taskdata;

  if (!taskdata->alive) {
    return 0;
  }
  if (millis() < taskdata->time) {
    return 1;
  }

  taskdata->timerf(taskdata->userdata);
  if (taskdata->repeat) {
    taskdata->time = millis() + taskdata->repeat;
    return 1;
  }
  return 0;
}

int tm_task_timer_interrupt (void *_taskdata)
{
  tm_task_timer_t *taskdata = (tm_task_timer_t *) _taskdata;

  taskdata->alive = 0;
}

void tm_task_timer_start (tm_task_loop_t queue, void (*f)(void *), int time, int repeat, void *data)//uint8_t *buf, size_t size)
{
  tm_task_timer_t *taskdata = calloc(1, sizeof(tm_task_timer_t));
  taskdata->timerf = f;
  taskdata->time = millis() + time;
  taskdata->repeat = repeat;
  taskdata->alive = 1;
  taskdata->userdata = data;

  tm_task_push(queue, tm_task_create(tm_task_timer_endpoint, tm_task_timer_interrupt, taskdata));
}


/**
 * Lua Parsing
 */

int tm_task_luaparse_endpoint (void *_data)
{
  tm_task_luaparse_endpoint_t *data = (tm_task_luaparse_endpoint_t *) _data;

  int ret_lb = luaL_loadbuffer(data->L, data->buf, data->size, "usercode");
  if (ret_lb != 0) {
    if (ret_lb == 4) {
      printf("ERROR: Not enough memory to load code.\n");
    } else if (ret_lb == 3) {
      printf("ERROR: Syntax error.\n");
    } else {
      printf("ERROR: Could not load code (error #%d)\n", ret_lb);
    }
  } else {
    int ref = luaL_ref(data->L, LUA_REGISTRYINDEX);
    tm_task_lua_start(tm_task_default_loop(), data->L, ref, 1);
  }
  return 0;
}

void tm_task_luaparse_start (tm_task_loop_t queue, lua_State *L, uint8_t *buf, size_t size)
{
  tm_task_luaparse_endpoint_t *data = calloc(1, sizeof(tm_task_luaparse_endpoint_t));

  data->size = size;
  data->buf = buf;
  data->L = L;

  tm_task_push(queue, tm_task_create(tm_task_luaparse_endpoint, NULL, data));
}


/**
 * Lua callback
 */

int tm_task_lua_endpoint (void *_taskdata)
{
  tm_task_lua_endpoint_t *taskdata = (tm_task_lua_endpoint_t *) _taskdata;

  lua_rawgeti(taskdata->L, LUA_REGISTRYINDEX, taskdata->ref);
  int error = 0;
  if (setjmp(taskdata->jmp) == 0) {
    error = lua_pcall(taskdata->L, 0, 0, -2);
  }
  if (taskdata->dounref) {
    luaL_unref(taskdata->L, LUA_REGISTRYINDEX, taskdata->ref);
  }
  return 0;
}

void tm_task_lua_interrupt_hook (lua_State* L, lua_Debug *ar)
{
  tm_task_t *task = tm_task_current(tm_task_default_loop());
  tm_task_lua_endpoint_t *taskdata = (tm_task_lua_endpoint_t *) task->taskdata;
  // printf("WHAT IS TASKDATA %p\n", taskdata);

  // lua_sethook(taskdata->L, NULL, 0, 0);
  longjmp(taskdata->jmp, 1);
}

int tm_task_lua_interrupt (void *_taskdata)
{
  tm_task_lua_endpoint_t *taskdata = (tm_task_lua_endpoint_t *) _taskdata;

  lua_sethook(taskdata->L, tm_task_lua_interrupt_hook, LUA_MASKCOUNT, 1);
}

void tm_task_lua_start (tm_task_loop_t queue, lua_State *L, int ref, int dounref)
{
  tm_task_lua_endpoint_t *taskdata = calloc(1, sizeof(tm_task_lua_endpoint_t));
  taskdata->ref = ref;
  taskdata->L = L;
  taskdata->dounref = dounref;

  tm_task_push(queue, tm_task_create(tm_task_lua_endpoint, tm_task_lua_interrupt, taskdata));
}


/**
 * Collect streams
 */

//typedef struct {
//  size_t size;
//  size_t cur;
//  uint8_t *buf;
//} tm_task_collect_endpoint_t;
//
//int tm_task_collect_endpoint (void *_data)
//{
//  tm_task_collect_endpoint_t *data = (tm_task_collect_endpoint_t *) _data;
//  int len = tm_usb_cdc_available();
//  if (len > 0) {
//    if (len > (data->size - data->cur)) {
//      len = data->size - data->cur;
//    }
//    tm_usb_cdc_read(&data->buf[data->cur], len);
//    data->cur += len;
//    printf("Read %d bytes...\n", len);
//  }
//  return data->size - data->cur > 0;
//}
//
//
//void tm_task_collect_start (tm_task_loop_t queue, size_t bytes)
//{
//  tm_task_collect_endpoint_t *data = calloc(1, sizeof(tm_task_collect_endpoint_t));
//  data->size = bytes;
//  data->cur = 0;
//  data->buf = calloc(bytes, 1);
//
//  tm_task_t *task = tm_task_create();
//  task->data = data;
//  task->f = tm_task_collect_endpoint;
//  tm_task_push(queue, task);
//}