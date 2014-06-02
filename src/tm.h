// Copyright 2014 Technical Machine, Inc. See the COPYRIGHT
// file at the top-level directory of this distribution.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

#ifndef _TM_H_
#define _TM_H_
#ifdef __cplusplus
extern "C" {
#endif

#include <stdint.h>
#include <setjmp.h>
#include <stdio.h>
#include <math.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>  
#include <time.h>
#include <stdbool.h>

// logging
void tm_log(char level, const char* string, unsigned length);
void tm_logf(char level, const char* format, ...);

#define SYS_DBG 1
#define SYS_LOG 20
#define SYS_ERR 22

#define TM_DEBUG(str, ...) tm_logf(SYS_DBG, str, ##__VA_ARGS__)
#define TM_LOG(str, ...) tm_logf(SYS_LOG, str, ##__VA_ARGS__)
#define TM_ERR(str, ...) tm_logf(SYS_ERR, str, ##__VA_ARGS__)

// Events

struct tm_event;
typedef void (*tm_event_callback)(struct tm_event* data);

typedef struct tm_event {
  bool pending;
  bool ref;
  struct tm_event* next;
  tm_event_callback callback;
} tm_event;

#define TM_EVENT_INIT(cb) { .pending = false, .ref = false, .next = 0, .callback = cb }

// Mark an event as keeping the event loop alive
bool tm_event_ref(tm_event* event);

// Mark an event as not keeping the event loop alive
bool tm_event_unref(tm_event* event);

// Returns true if any events are outstanding
bool tm_events_active();

// Queue an event
void tm_event_trigger(tm_event* event);

// Process an event
void tm_event_process();

// Returns true if an event is ready to be handled
bool tm_events_pending();

// Hardware functions to acquire/release the lock on the event datastructures (e.g. disable/enable interrupts)
void tm_events_lock();
void tm_events_unlock();

// Run the script and then process events. Returns the exit code
int tm_runtime_run(const char* script, const char** argv, int argc);

// Causes tm_runtime_run to exit immediately with code. Does not return.
void tm_runtime_exit_longjmp(int code);

// Schedules the event loop to exit at its earliest convenience. Safe to call from ISR.
void tm_runtime_schedule_exit(int code);

// Called at each iteration of the event loop
void hw_wait_for_event();

// Timers

// The event triggered by the timer interrupt
extern tm_event tm_timer_event;

unsigned tm_settimeout(unsigned time, bool repeat, int lua_cb);
void tm_cleartimeout(unsigned id);

// Called by the runtime to tell the hardware to reconfigure the timer
void hw_timer_update_interrupt();

// Returns true if any timer event is queued
bool tm_timer_waiting();

// Get the time field of the first timer in the queue
unsigned tm_timer_head_time();

// Get the last timestamp at which timer events were processed. tm_timer_head_time is relative to this.
unsigned tm_timer_base_time();

// Clean up the timer queue
void tm_timer_cleanup();

// net

typedef int tm_socket_t;

// UDP

tm_socket_t tm_udp_open ();
int tm_udp_close (int sock);
int tm_udp_listen (int ulSocket, int port);
int tm_udp_receive (int ulSocket, uint8_t *buf, unsigned long buf_len, uint32_t *ip);
int tm_udp_readable (tm_socket_t sock);
int tm_udp_send (int ulSocket, uint8_t ip0, uint8_t ip1, uint8_t ip2, uint8_t ip3, int port, const uint8_t *buf, unsigned long buf_len);

// TCP

tm_socket_t tm_tcp_open ();
int tm_tcp_close ();
int tm_tcp_connect (tm_socket_t sock, uint8_t ip0, uint8_t ip1, uint8_t ip2, uint8_t ip3, uint16_t port);
int tm_tcp_write (tm_socket_t sock, const uint8_t *buf, size_t buflen);
int tm_tcp_read (tm_socket_t sock, uint8_t *buf, size_t buflen);
int tm_tcp_readable (tm_socket_t sock);
int tm_tcp_listen (tm_socket_t sock, uint16_t port);
tm_socket_t tm_tcp_accept (tm_socket_t sock, uint32_t *ip);

// DNS

uint32_t tm_hostname_lookup (const uint8_t *hostname);

// Random

int tm_entropy_seed (void);
int tm_entropy_add (const uint8_t* buf, size_t buf_size);
int tm_random_bytes (uint8_t* buf, size_t buf_size, size_t* read);

// SSL

#define SSL_SESSION_ID_SIZE                     32

typedef void* tm_ssl_ctx_t;
typedef void* tm_ssl_session_t;

int tm_ssl_context_create (tm_ssl_ctx_t* ctx);
int tm_ssl_context_free (tm_ssl_ctx_t *ctx);
int tm_ssl_session_create (tm_ssl_session_t* session, tm_ssl_ctx_t ctx, tm_socket_t client_fd);
int tm_ssl_session_free (tm_ssl_session_t *session);
ssize_t tm_ssl_write (tm_ssl_session_t ssl, uint8_t *buf, size_t buf_len);
ssize_t tm_ssl_read (tm_ssl_session_t ssl, uint8_t *buf, size_t buf_len);

// UPTIME

void tm_uptime_init ();
uint32_t tm_uptime_micro ();

// TIMESTAMP

double tm_timestamp ();
int tm_timestamp_update (double millis);

// BUFFER

typedef enum {
  BE = 0,
  LE
} tm_endian_t;

void tm_buffer_float_write (uint8_t* buf, size_t index, float value, tm_endian_t endianness);
void tm_buffer_double_write (uint8_t* buf, size_t index, double value, tm_endian_t endianness);

// ITOA

char* tm_itoa (long long i, char *s, unsigned int radix);

// fs

#ifdef TM_FS_vfs
#include "vfs/vfs.h"

typedef tm_fs_file_handle tm_fs_t;
typedef tm_fs_dir_handle tm_fs_dir_t;
extern tm_fs_ent* tm_fs_root;

#else

typedef enum {
  TM_FS_TYPE_INVALID = 0,
  TM_FS_TYPE_FILE,
  TM_FS_TYPE_DIR,
  TM_FS_TYPE_MOUNT_FAT,
} tm_fs_type_t;

#include <sys/stat.h> 
#include <fcntl.h>
#include <dirent.h>

// lowest common denominator: http://elm-chan.org/fsw/ff/en/open.html
enum {
  TM_RDONLY = O_RDONLY,
  TM_WRONLY = O_WRONLY,
  TM_RDWR = O_RDWR,
  TM_OPEN_EXISTING = 0,
  TM_OPEN_ALWAYS = O_CREAT,
  TM_CREATE_NEW = O_CREAT | O_EXCL,
  TM_CREATE_ALWAYS = O_CREAT | O_TRUNC,

  TM_EXIST = EEXIST
};

typedef int tm_fs_t;
typedef DIR* tm_fs_dir_t;

void tm_fs_init ();

int tm_fs_type (const char* pathname);

int tm_fs_open (tm_fs_t* fd, const char *pathname, uint32_t flags, uint32_t mode);
int tm_fs_close (tm_fs_t* fd);
int tm_fs_read (tm_fs_t* fd, uint8_t *buf, size_t size, size_t* read);
int tm_fs_readable (tm_fs_t* fd);
int tm_fs_write (tm_fs_t* fd, const uint8_t *buf, size_t size, size_t* read);
int tm_fs_destroy (const char *pathname);

int tm_fs_rename (const char* oldname, const char* newname);
ssize_t tm_fs_seek (tm_fs_t* fd, size_t position);
int tm_fs_truncate (tm_fs_t* fd);
ssize_t tm_fs_length (tm_fs_t* fd);

int tm_fs_dir_create (const char *pathname);
int tm_fs_dir_open (tm_fs_dir_t* dir, const char *pathname);
int tm_fs_dir_read (tm_fs_dir_t* dir, const char **strptr);
int tm_fs_dir_close (tm_fs_dir_t* dir);

#endif

#ifdef __cplusplus
}
#endif
#endif