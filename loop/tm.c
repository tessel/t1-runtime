#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>
#include <stdlib.h>

#include "tm.h"
#include "tm_uptime.h"
#include "tm_debug.h"
#include "time.h"

#include<stdio.h>
#include<string.h>    //strlen
#include<sys/socket.h>
#include<arpa/inet.h> //inet_addr
#include <stdint.h>
#include <sys/time.h>

tm_socket_t tm_udp_open ()
{
    return socket(AF_INET, SOCK_STREAM, 0);
}

tm_socket_t tm_tcp_open ()
{
    return socket(AF_INET, SOCK_STREAM, 0);
}

int tm_tcp_connect (tm_socket_t sock, uint8_t ip0, uint8_t ip1, uint8_t ip2, uint8_t ip3, uint16_t port)
{
    struct sockaddr_in server;
    server.sin_addr.s_addr = htonl(ip0 << 24 | ip1 << 16 | ip2 << 8 | ip3); // inet_addr("74.125.235.20");
    server.sin_family = AF_INET;
    server.sin_port = htons(port);
    // printf("server: %p, %d, %d\n", server.sin_addr.s_addr, server.sin_family, server.sin_port);
    return connect(sock, (struct sockaddr *) &server, sizeof(server));
}

// http://publib.boulder.ibm.com/infocenter/iseries/v5r3/index.jsp?topic=%2Frzab6%2Frzab6xnonblock.htm

int tm_tcp_write (tm_socket_t sock, uint8_t *buf, size_t buflen)
{
    return send(sock, buf, buflen, 0);
}

int tm_tcp_read (tm_socket_t sock, uint8_t *buf, size_t buflen)
{
    return recv(sock, buf, buflen, 0);
}

int tm_tcp_readable (tm_socket_t sock)
{
    struct timeval tv;
    tv.tv_sec = 0;
    tv.tv_usec = 0;

    fd_set readset;
    FD_ZERO(&readset);
    FD_SET(sock, &readset);
    if (select(sock+1, &readset, NULL, NULL, &tv) <= 0) {
        return 0;
    }
    return FD_ISSET(sock, &readset);
}


//double millis () {
//  struct timeval tv;
//  gettimeofday(&tv, NULL);
//
//  double time_in_mill = (tv.tv_sec) * 1000 + (tv.tv_usec) / 1000;
//  return time_in_mill;
//}

/**
 * Event queue
 */

volatile tm_task_t *default_queue_root = NULL;
tm_loop_t default_queue = &default_queue_root;

tm_loop_t tm_default_loop ()
{
  return default_queue;
}

static void tm_push (volatile tm_loop_t queue, tm_task_t *task)
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

static void tm_remove (volatile tm_loop_t queue, volatile tm_task_t *task)
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

static tm_task_t *tm_create (int (*f)(void *), void (*interrupt)(void *), void *taskdata)
{
  tm_task_t *task = calloc(1, sizeof(tm_task_t));
  task->taskfn = f;
  task->taskinterrupt = interrupt;
  task->taskdata = taskdata;
  return task;
}

volatile tm_task_t *queue_current = NULL;

volatile static tm_task_t *tm_current (volatile tm_loop_t queue)
{
  return queue_current;
}

static int tm_count (volatile tm_loop_t queue)
{
  int count = 0;
  tm_task_t *item = *queue;
  while (item != NULL) {
    count++;
    item = item->tasknext;
  }
  return count;
}

void tm_run (volatile tm_loop_t queue)
{
  while ((*queue) != NULL) {
    volatile tm_task_t *item = *queue;
    while (item != NULL) {
      volatile tm_task_t *last = item;
      queue_current = item;
      int remove = (item->taskfn(item->taskdata)) == 0;
      item = item->tasknext;
      if (remove) {
        tm_remove(queue, last);
        free((void *) last);
      }
    }
  }
}

void tm_run_forever (volatile tm_loop_t queue)
{
  while (1) {
    tm_run(queue);
  }
}

int tm_interruptall_endpoint (void *_data)
{
  void (*callback)(void) = _data;

  TM_DEBUG("Interrupting (%d tasks remaining)...", tm_count(tm_default_loop()));
  if (tm_count(tm_default_loop()) == 1) {
    callback();
    return 0;
  } else {
    return 1;
  }
}

void tm_interruptall (volatile tm_loop_t queue, void (*cb)(void))
{
  tm_task_t *item = *queue;
  while (item != NULL) {
    if (item->taskinterrupt != NULL) {
      item->taskinterrupt(item->taskdata);
    }
    item = item->tasknext;
  }

  tm_push(queue, tm_create(tm_interruptall_endpoint, NULL, cb));
}


/**
 * Idle
 */

int tm_idle_endpoint (void *_taskdata)
{
  tm_idle_t *taskdata = (tm_idle_t *) _taskdata;

  if (!taskdata->alive) {
    return 0;
  }

  return taskdata->userfn(taskdata);
}

void tm_idle_interrupt (void *_taskdata)
{
  tm_idle_t *taskdata = (tm_idle_t *) _taskdata;

  taskdata->alive = 0;
}

void tm_idle_start (tm_loop_t queue, int (*fn)(void *), void *data)//uint8_t *buf, size_t size)
{
  tm_idle_t *taskdata = calloc(1, sizeof(tm_idle_t));
  taskdata->alive = 1;
  taskdata->userfn = fn;
  taskdata->userdata = data;

  tm_push(queue, tm_create(tm_idle_endpoint, tm_idle_interrupt, taskdata));
}


/**
 * Timer
 */

int tm_timer_endpoint (void *_taskdata)
{
  tm_timer_t *taskdata = (tm_timer_t *) _taskdata;

  if (!taskdata->alive) {
    free(taskdata);
    return 0;
  }
  if (tm_uptime() < taskdata->time) {
    return 1;
  }

  taskdata->timerf(taskdata->userdata);
  if (taskdata->repeat) {
    taskdata->time = tm_uptime() + taskdata->repeat;
    return 1;
  }
  free(taskdata);
  return 0;
}

void tm_timer_interrupt (void *_taskdata)
{
  tm_timer_t *taskdata = (tm_timer_t *) _taskdata;

  taskdata->alive = 0;
}

void tm_timer_start (tm_loop_t queue, void (*f)(void *), int time, int repeat, void *data)//uint8_t *buf, size_t size)
{
  tm_timer_t *taskdata = calloc(1, sizeof(tm_timer_t));
  taskdata->timerf = f;
  taskdata->time = tm_uptime() + time;
  taskdata->repeat = repeat;
  taskdata->alive = 1;
  taskdata->userdata = data;

  tm_push(queue, tm_create(tm_timer_endpoint, tm_timer_interrupt, taskdata));
}


/**
 * Lua Parsing
 */

int tm_luaparse_endpoint (void *_data)
{
  tm_luaparse_endpoint_t *data = (tm_luaparse_endpoint_t *) _data;

  int ret_lb = luaL_loadbuffer(data->L, (char *) data->buf, data->size, "usercode");
  if (ret_lb != 0) {
  const char* err_str = luaL_checkstring(data->L, -1);
    if (ret_lb == 4) {
      printf("ERROR: Not enough memory to load code: %s\n", err_str);
    } else if (ret_lb == 3) {
      printf("ERROR: Syntax error: %s\n", err_str);
    } else {
      printf("ERROR: Could not load code (error #%d): %s\n", ret_lb, err_str);
    }
    lua_pop(data->L, 1);
  } else {
    int ref = luaL_ref(data->L, LUA_REGISTRYINDEX);
    TM_COMMAND('u', "Running script...");
    TM_COMMAND('S', "1");
    tm_lua_start(tm_default_loop(), data->L, ref, 1);
  }

  free(data);
  return 0;
}

void tm_luaparse_start (volatile tm_loop_t queue, lua_State *L, uint8_t *buf, size_t size)
{
  tm_luaparse_endpoint_t *data = calloc(1, sizeof(tm_luaparse_endpoint_t));

  data->size = size;
  data->buf = buf;
  data->L = L;

  tm_push(queue, tm_create(tm_luaparse_endpoint, NULL, data));
}


/**
 * Lua callback
 */

/* from lua.c */
static int traceback (lua_State *L) {
  if (!lua_isstring(L, 1))  /* 'message' not a string? */
    return 1;  /* keep it intact */
  lua_getglobal(L, "debug");
  if (!lua_istable(L, -1)) {
    lua_pop(L, 1);
    return 1;
  }
  lua_getfield(L, -1, "traceback");
  if (!lua_isfunction(L, -1)) {
    lua_pop(L, 2);
    return 1;
  }
  lua_pushvalue(L, 1);  /* pass error message */
  lua_pushinteger(L, 2);  /* skip this function and traceback */
  lua_call(L, 2, 1);  /* call debug.traceback */
  return 1;
}

int tm_lua_endpoint (void *_taskdata)
{
  tm_lua_endpoint_t *taskdata = (tm_lua_endpoint_t *) _taskdata;

  lua_pushcfunction(taskdata->L, traceback);
  lua_rawgeti(taskdata->L, LUA_REGISTRYINDEX, taskdata->ref);
  int error = 0;
  if (setjmp(taskdata->jmp) == 0) {
    error = lua_pcall(taskdata->L, 0, 0, -2);
  }
if (error != 0) {
  if (error == 4) {
    TM_COMMAND('u', "ERROR: Not enough memory to execute code.");
  } else if (error == 2) {
    TM_COMMAND('u', "ERROR: Thrown from code: %s", lua_tostring(taskdata->L, -1));
  } else {
    TM_COMMAND('u', "ERROR: Could not run code: %d", error);
  }
  lua_pop(taskdata->L, 1);
}
lua_pop(taskdata->L, 1);

  if (taskdata->dounref) {
    luaL_unref(taskdata->L, LUA_REGISTRYINDEX, taskdata->ref);
  }
  free(taskdata);
  return 0;
}

void tm_lua_interrupt_hook (lua_State* L, lua_Debug *ar)
{
  volatile tm_task_t *task = tm_current(tm_default_loop());
  tm_lua_endpoint_t *taskdata = (tm_lua_endpoint_t *) task->taskdata;
  // printf("WHAT IS TASKDATA %p\n", taskdata);

  // lua_sethook(taskdata->L, NULL, 0, 0);
  longjmp(taskdata->jmp, 1);
}

void tm_lua_interrupt (void *_taskdata)
{
  tm_lua_endpoint_t *taskdata = (tm_lua_endpoint_t *) _taskdata;

  lua_sethook(taskdata->L, tm_lua_interrupt_hook, LUA_MASKCOUNT, 1);
}

void tm_lua_start (volatile tm_loop_t queue, lua_State *L, int ref, int dounref)
{
  tm_lua_endpoint_t *taskdata = calloc(1, sizeof(tm_lua_endpoint_t));
  taskdata->ref = ref;
  taskdata->L = L;
  taskdata->dounref = dounref;
  tm_push(queue, tm_create(tm_lua_endpoint, tm_lua_interrupt, taskdata));
  //  tm_idle_start(queue, ); // creates new listener & callback.
}


/**
 * Collect streams
 */

//typedef struct {
//  size_t size;
//  size_t cur;
//  uint8_t *buf;
//} tm_collect_endpoint_t;
//
//int tm_collect_endpoint (void *_data)
//{
//  tm_collect_endpoint_t *data = (tm_collect_endpoint_t *) _data;
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
//void tm_collect_start (tm_loop_t queue, size_t bytes)
//{
//  tm_collect_endpoint_t *data = calloc(1, sizeof(tm_collect_endpoint_t));
//  data->size = bytes;
//  data->cur = 0;
//  data->buf = calloc(bytes, 1);
//
//  tm_task_t *task = tm_create();
//  task->data = data;
//  task->f = tm_collect_endpoint;
//  tm_push(queue, task);
//}
