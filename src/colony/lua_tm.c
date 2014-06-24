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

#include "tm.h"
#include "colony.h"
#include "order32.h"

#ifdef ENABLE_TLS
#include <sha2.h>
#include <crypto.h>
#endif


inline static void stackDump (lua_State *L)
{
  int i;
  int top = lua_gettop(L);
  for (i = 1; i <= top; i++) {  /* repeat for each level */
    int t = lua_type(L, i);
    switch (t) {

      case LUA_TSTRING:  /* strings */
        printf("`%s'", lua_tostring(L, i));
        break;

      case LUA_TBOOLEAN:  /* booleans */
        printf(lua_toboolean(L, i) ? "true" : "false");
        break;

      case LUA_TNUMBER:  /* numbers */
        printf("%g", lua_tonumber(L, i));
        break;

      default:  /* other values */
        printf("%s", lua_typename(L, t));
        break;

    }
    printf("  ");  /* put a separator */
  }
  printf("\n");  /* end the listing */
}

#ifndef CONFIG_PLATFORM_EMBED
#include <unistd.h>
#endif

static int l_tm_cwd(lua_State* L)
{
  #ifdef CONFIG_PLATFORM_EMBED
  lua_pushstring(L, "/app");
  #else
  char *cwd = getcwd(NULL, 0);
  lua_pushstring(L, cwd);
  free(cwd);
  #endif
  return 1;
}


static int l_tm_exit(lua_State* L)
{
  const char code = lua_tonumber(L, 1);
  tm_runtime_exit_longjmp(code);
  return 0;
}

static int l_tm_log(lua_State* L)
{
  const char level = lua_tonumber(L, 1);
  size_t buf_len = 0;
  const char* buf = (const char*) colony_toconstdata(L, 2, &buf_len);
  tm_log(level, buf, buf_len);
  return 0;
}

/**
 * Net
 */

static int l_tm_hostname_lookup (lua_State* L)
{
  const uint8_t *lookup = (const uint8_t *) lua_tostring(L, 1);

  uint32_t ip = tm_hostname_lookup(lookup);
  lua_pushnumber(L, ip);
  return 1;
}



static int l_tm_udp_open (lua_State* L)
{
  tm_socket_t socket = tm_udp_open();

  lua_pushnumber(L, socket);
  return 1;
}

static int l_tm_udp_close (lua_State* L)
{
  int socket = (int) lua_tonumber(L, 1);
  int res = tm_udp_close(socket);

  lua_pushnumber(L, res);
  return 1;
}

static int l_tm_udp_send (lua_State* L)
{
  int socket = (int) lua_tonumber(L, 1);
  int ip0 = (int) lua_tonumber(L, 2);
  int ip1 = (int) lua_tonumber(L, 3);
  int ip2 = (int) lua_tonumber(L, 4);
  int ip3 = (int) lua_tonumber(L, 5);
  int port = (int) lua_tonumber(L, 6);
  size_t len;
  const uint8_t* buf = colony_toconstdata(L, 7, &len);

  tm_udp_send(socket, ip0, ip1, ip2, ip3, port, buf, len);
  return 0;
}

static int l_tm_udp_listen (lua_State *L)
{
  int socket = (int) lua_tonumber(L, 1);
  int port = (int) lua_tonumber(L, 2);

  lua_pushnumber(L, tm_udp_listen(socket, port));

  return 1;
}

static int l_tm_udp_receive (lua_State *L)
{
  int socket = (int) lua_tonumber(L, 1);

  // TODO is max buf size 256?
  uint8_t* buf = colony_createbuffer(L, 256);
  uint32_t from;
  size_t buf_len = tm_udp_receive(socket, buf, 256, &from);

  lua_pushnumber(L, buf_len);
  lua_pushnumber(L, from);

  return 3;
}


static int l_tm_udp_readable (lua_State* L)
{
  tm_socket_t socket = (tm_socket_t) lua_tonumber(L, 1);

  lua_pushnumber(L, tm_udp_readable(socket));
  return 1;
}



static int l_tm_tcp_open (lua_State* L)
{
  tm_socket_t socket = tm_tcp_open();

  lua_pushnumber(L, socket);
  return 1;
}

static int l_tm_tcp_close (lua_State* L)
{
  tm_socket_t socket = (tm_socket_t) lua_tonumber(L, 1);
  int res = tm_tcp_close(socket);

  lua_pushnumber(L, res);
  return 1;
}

static int l_tm_tcp_connect (lua_State* L)
{
  tm_socket_t socket = (tm_socket_t) lua_tonumber(L, 1);
  uint8_t ip0 = (uint8_t) lua_tonumber(L, 2);
  uint8_t ip1 = (uint8_t) lua_tonumber(L, 3);
  uint8_t ip2 = (uint8_t) lua_tonumber(L, 4);
  uint8_t ip3 = (uint8_t) lua_tonumber(L, 5);
  uint16_t port = (uint16_t) lua_tonumber(L, 6);

  lua_pushnumber(L, tm_tcp_connect(socket, ip0, ip1, ip2, ip3, port));
  return 1;
}


static int l_tm_tcp_write (lua_State* L)
{
  tm_socket_t socket = (tm_socket_t) lua_tonumber(L, 1);
  size_t len;
  const uint8_t* buf = colony_toconstdata(L, 2, &len);

  tm_tcp_write(socket, buf, len);
  return 0;
}


static int l_tm_tcp_read (lua_State* L)
{
  tm_socket_t socket = (tm_socket_t) lua_tonumber(L, 1);

  uint8_t buf[512];
  size_t buf_len = tm_tcp_read(socket, buf, sizeof(buf));

  lua_pushlstring(L, (char *) buf, buf_len);
  return 1;
}


static int l_tm_tcp_readable (lua_State* L)
{
  tm_socket_t socket = (tm_socket_t) lua_tonumber(L, 1);

  lua_pushnumber(L, tm_tcp_readable(socket));
  return 1;
}


static int l_tm_tcp_listen (lua_State* L)
{
  tm_socket_t socket = (tm_socket_t) lua_tonumber(L, 1);
  uint16_t port = (uint16_t) lua_tonumber(L, 2);

  lua_pushnumber(L, tm_tcp_listen(socket, port));
  return 1;
}


static int l_tm_tcp_accept (lua_State* L)
{
  uint32_t addr;
  tm_socket_t socket = (tm_socket_t) lua_tonumber(L, 1);

  lua_pushnumber(L, tm_tcp_accept(socket, &addr));
  lua_pushnumber(L, addr);
  return 2;
}

#ifdef ENABLE_TLS

static int l_tm_ssl_context_create (lua_State* L)
{
  tm_ssl_ctx_t ctx;

  int res = tm_ssl_context_create(&ctx);

  if (res != 0) {
    lua_pushnil(L);
  } else {
    lua_pushlightuserdata(L, ctx);
  }
  return 1;
}


static int l_tm_ssl_context_free (lua_State* L)
{
  tm_ssl_ctx_t ctx = (tm_ssl_ctx_t) lua_touserdata(L, 1);

  int res = tm_ssl_context_free(&ctx);

  lua_pushnumber(L, res);
  return 1;
}

static int l_tm_ssl_session_create (lua_State* L)
{
  tm_ssl_session_t session;

  tm_ssl_ctx_t ctx = (tm_ssl_ctx_t) lua_touserdata(L, 1);
  tm_socket_t sock = (tm_socket_t) lua_tonumber(L, 2);
  const char* host_name = NULL;
  if (!lua_isnil(L, 3)) {
    host_name = lua_tostring(L, 3);
  }

  int res = tm_ssl_session_create(&session, ctx, sock, host_name);

  lua_pushlightuserdata(L, session);
  lua_pushnumber(L, res);
  return 2;
}

static int l_tm_ssl_session_altname (lua_State* L)
{
  tm_ssl_session_t session = (tm_ssl_session_t) lua_touserdata(L, 1);
  size_t index = (size_t) lua_tonumber(L, 2);

  const char* altname = NULL;
  int res = tm_ssl_session_altname(&session, index, &altname);

  if (altname == NULL) {
    lua_pushnil(L);
  } else {
    lua_pushstring(L, altname);
  }
  lua_pushnumber(L, res);
  return 2;
}

static int l_tm_ssl_session_cn (lua_State* L)
{
  tm_ssl_session_t session = (tm_ssl_session_t) lua_touserdata(L, 1);

  const char* cn = NULL;
  int res = tm_ssl_session_cn(&session, &cn);

  if (cn == NULL) {
    lua_pushnil(L);
  } else {
    lua_pushstring(L, cn);
  }
  lua_pushnumber(L, res);
  return 2;
}

static int l_tm_ssl_session_free (lua_State* L)
{
  tm_ssl_session_t session = (tm_ssl_session_t) lua_touserdata(L, 1);

  int res = tm_ssl_session_free(&session);

  lua_pushnumber(L, res);
  return 1;
}


static int l_tm_ssl_write (lua_State* L)
{
  tm_ssl_session_t session = (tm_ssl_session_t) lua_touserdata(L, 1);
  size_t len;
  const uint8_t *text = colony_toconstdata(L, 2, &len);

  int ret = tm_ssl_write(session, (uint8_t*) text, len);

  lua_pushnumber(L, ret);
  return 1;
}


static int l_tm_ssl_read (lua_State* L)
{
  tm_ssl_session_t session = (tm_ssl_session_t) lua_touserdata(L, 1);

  uint8_t buf[20000];
  ssize_t buf_len = tm_ssl_read(session, buf, sizeof(buf));

  if (buf_len <= 0) {
    lua_pushstring(L, "");
  } else {
    lua_pushlstring(L, (char *) buf, buf_len);
  }
  return 1;
}

#endif

/**
 * Uptime
 */


static int l_tm_uptime_init (lua_State* L)
{
  (void) L;
  tm_uptime_init();
  return 0;
}


static int l_tm_uptime_micro (lua_State* L)
{
  lua_pushnumber(L, tm_uptime_micro());
  return 1;
}


/**
 * date
 */

static int l_tm_timestamp (lua_State* L)
{
  lua_pushnumber(L, tm_timestamp());
  return 1;
}


static int l_tm_timestamp_update (lua_State* L)
{
  double timestamp = (double) lua_tonumber(L, 1);
  lua_pushnumber(L, tm_timestamp_update(timestamp));
  return 1;
}


/**
 * Timers
 */

static int l_tm_set_raw_timeout (lua_State* L) {
  unsigned timeout = (unsigned) (lua_tonumber(L, 1) * 1000.0);
  int repeat = lua_toboolean(L, 2);
  int callback_ref = luaL_ref(L, LUA_REGISTRYINDEX);
  unsigned id = tm_settimeout(timeout, repeat, callback_ref);
  lua_pushnumber(L, id);
  return 1;
}

static int l_tm_clear_raw_timeout (lua_State* L) {
  unsigned id = (unsigned) lua_tonumber(L, 1);
  tm_cleartimeout(id);
  return 0;
}


/**
 * Buffer
 */

static int l_tm_buffer_create (lua_State *L)
{
  size_t n = (size_t) lua_tonumber(L, 1);
  lua_newuserdata(L, n);
  return 1;
}

static int l_tm_buffer_index (lua_State *L)
{
  uint8_t *ud = (uint8_t *) lua_touserdata(L, 1);
  size_t index = (size_t) lua_tonumber(L, 2);
  lua_pushlightuserdata(L, &ud[index]);
  return 1;
}


static int l_tm_buffer_set (lua_State *L)
{
  uint8_t *ud = (uint8_t *) lua_touserdata(L, 1);
  size_t index = (size_t) lua_tonumber(L, 2);
  uint8_t newvalue = (uint8_t) lua_tonumber(L, 3);

  ud[index] = newvalue;
  return 0;
}


static int l_tm_buffer_get (lua_State *L)
{
  uint8_t *ud = (uint8_t *) lua_touserdata(L, 1);
  size_t index = (size_t) lua_tonumber(L, 2);
  lua_pushnumber(L, ud[index]);
  return 1;
}

#define READ_BUFFER(N, T) static int N (lua_State *L) \
  { \
    uint8_t *ud = (uint8_t *) lua_touserdata(L, 1); \
    size_t index = (size_t) lua_tonumber(L, 2); \
    uint8_t *a = &ud[index]; \
    lua_pushnumber(L, T); \
    return 1; \
  }

#define TO_16(a, b) ((a << 8) | b)
#define TO_32(a, b, c, d) ((a << 24) | (b << 16) | (c << 8) | d)

#define WRITE_BUFFER(N, T) static int N (lua_State *L) \
{ \
  uint8_t *ud = (uint8_t *) lua_touserdata(L, 1); \
  size_t index = (size_t) lua_tonumber(L, 2); \
  uint32_t value = (uint32_t) lua_tonumber(L, 3); \
  uint8_t *a = &ud[index]; \
  T; \
  return 0; \
}

#define WRITE_8(V, a) a = V & 0xFF;
#define WRITE_16(V, a, b) a = (V >> 8) & 0xFF; b = V & 0xFF;
#define WRITE_32(V, a, b, c, d) a = (V >> 24) & 0xFF; b = (V >> 16) & 0xFF; c = (V >> 8) & 0xFF; d = V & 0xFF;

READ_BUFFER(l_tm_buffer_read_uint8, (uint8_t) a[0]);
READ_BUFFER(l_tm_buffer_read_uint16le, (uint16_t) TO_16(a[1], a[0]));
READ_BUFFER(l_tm_buffer_read_uint16be, (uint16_t) TO_16(a[0], a[1]));
READ_BUFFER(l_tm_buffer_read_uint32le, (uint32_t) TO_32(a[3], a[2], a[1], a[0]));
READ_BUFFER(l_tm_buffer_read_uint32be, (uint32_t) TO_32(a[0], a[1], a[2], a[3]));
READ_BUFFER(l_tm_buffer_read_int8, (int8_t) a[0]);
READ_BUFFER(l_tm_buffer_read_int16le, (int16_t) TO_16(a[1], a[0]));
READ_BUFFER(l_tm_buffer_read_int16be, (int16_t) TO_16(a[0], a[1]));
READ_BUFFER(l_tm_buffer_read_int32le, (int32_t) TO_32(a[3], a[2], a[1], a[0]));
READ_BUFFER(l_tm_buffer_read_int32be, (int32_t) TO_32(a[0], a[1], a[2], a[3]));

WRITE_BUFFER(l_tm_buffer_write_uint8, WRITE_8((uint8_t) value, a[0]));
WRITE_BUFFER(l_tm_buffer_write_uint16le, WRITE_16((uint16_t) value, a[1], a[0]));
WRITE_BUFFER(l_tm_buffer_write_uint16be, WRITE_16((uint16_t) value, a[0], a[1]));
WRITE_BUFFER(l_tm_buffer_write_uint32le, WRITE_32((uint32_t) value, a[3], a[2], a[1], a[0]));
WRITE_BUFFER(l_tm_buffer_write_uint32be, WRITE_32((uint32_t) value, a[0], a[1], a[2], a[3]));
WRITE_BUFFER(l_tm_buffer_write_int8, WRITE_8((int8_t) value, a[0]));
WRITE_BUFFER(l_tm_buffer_write_int16le, WRITE_16((int16_t) value, a[1], a[0]));
WRITE_BUFFER(l_tm_buffer_write_int16be, WRITE_16((int16_t) value, a[0], a[1]));
WRITE_BUFFER(l_tm_buffer_write_int32le, WRITE_32((int32_t) value, a[3], a[2], a[1], a[0]));
WRITE_BUFFER(l_tm_buffer_write_int32be, WRITE_32((int32_t) value, a[0], a[1], a[2], a[3]));

static int l_tm_buffer_read_float (lua_State *L)
{
  uint8_t *ud = (uint8_t *) lua_touserdata(L, 1);
  size_t index = (size_t) lua_tonumber(L, 2);
  uint8_t le = (int) lua_tonumber(L, 3);

  uint8_t *a = &ud[index];
  float out = 0;
  char* temp = (char*) &out;
  if (le ^ (O32_HOST_ORDER == O32_BIG_ENDIAN)) {
    temp[0] = a[0]; temp[1] = a[1]; temp[2] = a[2]; temp[3] = a[3];
  } else {
    temp[0] = a[3]; temp[1] = a[2]; temp[2] = a[1]; temp[3] = a[0];
  }
  lua_pushnumber(L, out);
  return 1;
}

static int l_tm_buffer_read_double (lua_State *L)
{
  uint8_t *ud = (uint8_t *) lua_touserdata(L, 1);
  size_t index = (size_t) lua_tonumber(L, 2);
  uint8_t le = (int) lua_tonumber(L, 3);

  uint8_t *a = &ud[index];
  double out = 0;
  char* temp = (char*) &out;
  if (le ^ (O32_HOST_ORDER == O32_BIG_ENDIAN)) {
    temp[0] = a[0]; temp[1] = a[1]; temp[2] = a[2]; temp[3] = a[3]; temp[4] = a[4]; temp[5] = a[5]; temp[6] = a[6]; temp[7] = a[7];
  } else {
    temp[0] = a[7]; temp[1] = a[6]; temp[2] = a[5]; temp[3] = a[4]; temp[4] = a[3]; temp[5] = a[2]; temp[6] = a[1]; temp[7] = a[0];
  }
  lua_pushnumber(L, out);
  return 1;
}

static int l_tm_buffer_write_float (lua_State *L)
{
  uint8_t *ud = (uint8_t *) lua_touserdata(L, 1);
  size_t index = (size_t) lua_tonumber(L, 2);
  float value = (float) lua_tonumber(L, 3);
  uint8_t le = (int) lua_tonumber(L, 4);

  uint8_t *a = &ud[index];
  char* temp = (char*) &value;
  if (le ^ (O32_HOST_ORDER == O32_BIG_ENDIAN)) {
    a[0] = temp[0]; a[1] = temp[1]; a[2] = temp[2]; a[3] = temp[3];
  } else {
    a[0] = temp[3]; a[1] = temp[2]; a[2] = temp[1]; a[3] = temp[0];
  }
  return 0;
}

static int l_tm_buffer_write_double (lua_State *L)
{
  uint8_t *ud = (uint8_t *) lua_touserdata(L, 1);
  size_t index = (size_t) lua_tonumber(L, 2);
  double value = (double) lua_tonumber(L, 3);
  uint8_t le = (int) lua_tonumber(L, 4);

  uint8_t *a = &ud[index];
  char* temp = (char*) &value;
  if (le ^ (O32_HOST_ORDER == O32_BIG_ENDIAN)) {
    a[0] = temp[0]; a[1] = temp[1]; a[2] = temp[2]; a[3] = temp[3]; a[4] = temp[4]; a[5] = temp[5]; a[6] = temp[6]; a[7] = temp[7];
  } else {
    a[0] = temp[7]; a[1] = temp[6]; a[2] = temp[5]; a[3] = temp[4]; a[4] = temp[3]; a[5] = temp[2]; a[6] = temp[1]; a[7] = temp[0];
  }
  return 0;
}


static int l_tm_buffer_fill (lua_State *L)
{
  uint8_t *a = (uint8_t *) lua_touserdata(L, 1);
  uint8_t value = (uint8_t) lua_tonumber(L, 2);
  int start = (int) lua_tonumber(L, 3);
  int end = (int) lua_tonumber(L, 4);

  for (int i = start; i < end; i++) {
    a[i] = value;
  }
  return 0;
}

static int l_tm_buffer_copy (lua_State *L)
{
  uint8_t *source = (uint8_t *) lua_touserdata(L, 1);
  uint8_t *target = (uint8_t *) lua_touserdata(L, 2);
  int targetStart = (int) lua_tonumber(L, 3);
  int sourceStart = (int) lua_tonumber(L, 4);
  int sourceEnd = (int) lua_tonumber(L, 5);

  for (int i = 0; i < sourceEnd - sourceStart; i++) {
    target[targetStart + i] = source[sourceStart + i];
  }
  return 0;
}

static int l_tm_buffer_tostring (lua_State *L)
{
  uint8_t *source = (uint8_t *) lua_touserdata(L, 1);
  size_t source_len = (int) lua_tonumber(L, 2);

  lua_pushlstring(L, (char *) source, source_len);
  return 1;
}


/**
 * fs
 */


static int l_tm_fs_type (lua_State* L)
{
  const char *pathname = (const char *) lua_tostring(L, 1);

  #ifdef TM_FS_vfs
  int ret = tm_fs_type(tm_fs_root, pathname);
  #else
  int ret = tm_fs_type(pathname);
  #endif
  lua_pushnumber(L, ret);
  return 1;
}


static int l_tm_fs_open (lua_State* L)
{
  const char *pathname = (const char *) lua_tostring(L, 1);
  uint32_t flags = (uint32_t) lua_tonumber(L, 2);
  uint32_t mode = (uint32_t) lua_tonumber(L, 3);

  tm_fs_t* fd = (tm_fs_t*) lua_newuserdata(L, sizeof(tm_fs_t));

  #ifdef TM_FS_vfs
  (void) mode;
  int ret = tm_fs_open(fd, tm_fs_root, pathname, flags);
  #else
  int ret = tm_fs_open(fd, pathname, flags, mode);
  #endif

  if (ret > 0) {
    lua_pop(L, 1);
    lua_pushnil(L);
  }
  lua_pushnumber(L, ret);
  return 2;
}


static int l_tm_fs_close (lua_State* L)
{
  tm_fs_t* fd = (tm_fs_t*) lua_touserdata(L, 1);

  int ret = tm_fs_close(fd);
  lua_pushnumber(L, ret);
  return 1;
}


static int l_tm_fs_read (lua_State* L)
{
  tm_fs_t* fd = (tm_fs_t*) lua_touserdata(L, 1);
  size_t size = (size_t) lua_tonumber(L, 2);

  uint8_t *buf = (uint8_t *) malloc(size);
  size_t nread;
  int ret = tm_fs_read(fd, buf, size, &nread);
  if (ret == 0 && nread > 0) {
    uint8_t* luabuf = colony_createbuffer(L, nread);
    memcpy(luabuf, buf, nread);
  } else {
    lua_pushnil(L);
  }

  lua_pushnumber(L, ret);
  free(buf);
  return 2;
}


static int l_tm_fs_readable (lua_State* L)
{
  tm_fs_t* fd = (tm_fs_t*) lua_touserdata(L, 1);

  int readable = tm_fs_readable(fd);
  lua_pushnumber(L, readable);
  return 1;
}


static int l_tm_fs_write (lua_State* L)
{
  tm_fs_t* fd = (tm_fs_t*) lua_touserdata(L, 1);
  size_t size = (size_t) lua_tonumber(L, 3);

  size_t buf_len = 0;
  const uint8_t* buf = (const uint8_t*) colony_tobuffer(L, 2, &buf_len);
  #ifdef TM_FS_vfs
  int ret = tm_fs_write(fd, buf, size);
  #else
  size_t nwritten;
  int ret = tm_fs_write(fd, buf, size, &nwritten);
  #endif

  lua_pushnumber(L, ret);
  return 1;
}


static int l_tm_fs_destroy (lua_State* L)
{
  const char *pathname = (const char *) lua_tostring(L, 1);

  #ifdef TM_FS_vfs
  tm_fs_ent* ent = NULL;
  int r = tm_fs_lookup(tm_fs_root, pathname, &ent);
  if (r != ENOENT) {
    ent->file.data_owned = 0;
    // ent->file.data = malloc(0);
    tm_fs_destroy(ent);
  }
  int ret = -r;
  #else
  int ret = tm_fs_destroy(pathname);
  #endif

  lua_pushnumber(L, ret);
  return 1;
}


static int l_tm_fs_rename (lua_State* L)
{
  const char *oldname = (const char *) lua_tostring(L, 1);
  const char *newname = (const char *) lua_tostring(L, 2);

  #ifdef TM_FS_vfs
  int ret = tm_fs_rename(tm_fs_root, oldname, newname);
  #else
  int ret = tm_fs_rename(oldname, newname);
  #endif

  lua_pushnumber(L, ret);
  return 1;
}


static int l_tm_fs_seek (lua_State* L)
{
  tm_fs_t* fd = (tm_fs_t*) lua_touserdata(L, 1);
  size_t position = (size_t) lua_tonumber(L, 2);

  ssize_t length = tm_fs_seek(fd, position);
  lua_pushnumber(L, length);
  return 1;
}


static int l_tm_fs_truncate (lua_State* L)
{
  tm_fs_t* fd = (tm_fs_t*) lua_touserdata(L, 1);

  int ret = tm_fs_truncate(fd);
  lua_pushnumber(L, ret);
  return 1;
}


static int l_tm_fs_length (lua_State* L)
{
  tm_fs_t* fd = (tm_fs_t*) lua_touserdata(L, 1);

  ssize_t length = tm_fs_length(fd);
  lua_pushnumber(L, length);
  return 1;
}


static int l_tm_fs_dir_create (lua_State* L)
{
  const char *pathname = (const char *) lua_tostring(L, 1);

  #ifdef TM_FS_vfs
  int ret = tm_fs_dir_create(tm_fs_root, pathname);
  #else
  int ret = tm_fs_dir_create(pathname);
  #endif

  lua_pushnumber(L, ret);
  return 1;
}


static int l_tm_fs_dir_open (lua_State* L)
{
  const char *pathname = (const char *) lua_tostring(L, 1);

  tm_fs_dir_t* dir = (tm_fs_dir_t*) lua_newuserdata(L, sizeof(tm_fs_dir_t));

  #ifdef TM_FS_vfs
  int ret = tm_fs_dir_open(dir, tm_fs_root, pathname);
  #else
  memset(dir, 0, sizeof(tm_fs_dir_t));
  int ret = tm_fs_dir_open(dir, pathname);
  #endif

  if (ret > 0) {
    lua_pop(L, 1);
    lua_pushnil(L);
  }
  lua_pushnumber(L, ret);
  return 2;
}

static int l_tm_fs_dir_read (lua_State* L)
{
  tm_fs_dir_t* dir = (tm_fs_dir_t*) lua_touserdata(L, 1);

  const char *pathname;
  int ret = tm_fs_dir_read(dir, &pathname);
  if (pathname == NULL) {
    lua_pushnil(L);
  } else {
    lua_pushstring(L, pathname == NULL ? "" : pathname);
  }
  lua_pushnumber(L, ret);
  return 2;
}

static int l_tm_fs_dir_close (lua_State* L)
{
  tm_fs_dir_t* dir = (tm_fs_dir_t*) lua_touserdata(L, 1);

  int ret = tm_fs_dir_close(dir);
  lua_pushnumber(L, ret);
  return 1;
}


uint32_t tm__sync_gethostbyname (const char *domain);

static int l_tm__sync_gethostbyname (lua_State* L)
{
  const char *host = lua_tostring(L, 1);

  lua_pushnumber(L, tm__sync_gethostbyname(host));
  return 1;
}

static int l_tm_itoa (lua_State* L)
{
  long long value = (long long) lua_tonumber(L, 1);
  unsigned int radix = (unsigned int) lua_tonumber(L, 2);

  // TODO ensure colony_itoa can never go over 255 bytes
  char buf[256] = { 0 };
  tm_itoa(value, buf, radix == 0 ? 10 : radix);
  buf[255] = 0;

  lua_pushstring(L, buf);
  return 1;
}

/**
 * deflate / inflate
 */

static int l_tm_deflate_start_gzip (lua_State *L)
{
  size_t level = (size_t) lua_tonumber(L, 1);

  tm_deflate_t deflate = (tm_deflate_t) lua_newuserdata(L, tm_deflate_alloc_size());

  size_t out_len = 16*1024, out_total = 0;
  uint8_t* out = colony_createbuffer(L, out_len);

  int status = tm_deflate_start_gzip(deflate, level, out, out_len, &out_total);
  lua_pushnumber(L, out_total);

  lua_pushnumber(L, status);
  return 4;
}

static int l_tm_deflate_write (lua_State *L)
{
  tm_deflate_t deflate = (tm_deflate_t) lua_touserdata(L, 1);
  size_t out_len = 0;
  uint8_t* out = colony_tobuffer(L, 2, &out_len);
  size_t out_total = (size_t) lua_tonumber(L, 3);

  size_t in_len = 0;
  const uint8_t* in = colony_toconstdata(L, 4, &in_len);
  size_t in_total = (size_t) lua_tonumber(L, 5);

  // TODO check for < half of buffer available

  size_t out_written = 0, in_written = 0;
  int status = tm_deflate_write(deflate, &in[in_total], in_len - in_total, &in_written, &out[out_total], out_len - out_total, &out_written);

  lua_pushvalue(L, 2);
  lua_pushnumber(L, out_total + out_written);

  lua_pushvalue(L, 4);
  lua_pushnumber(L, in_total + in_written);

  lua_pushnumber(L, status);
  return 5;
}

static int l_tm_deflate_end_gzip (lua_State *L)
{
  tm_deflate_t deflate = (tm_deflate_t) lua_touserdata(L, 1);
  size_t out_len = 0;
  uint8_t* out = colony_tobuffer(L, 2, &out_len);
  size_t out_total = (size_t) lua_tonumber(L, 3);

  // TODO check for < half of buffer available

  size_t out_written = 0;
  int status = tm_deflate_end_gzip(deflate, &out[out_total], out_len - out_total, &out_written);

  lua_pushvalue(L, 2);
  lua_pushnumber(L, out_total + out_written);

  lua_pushnumber(L, status);
  return 3;
}

// int tm_deflate_start_gzip (tm_deflate_t deflator, size_t level, uint8_t* out, size_t out_len, size_t* out_total);
// int tm_deflate_write (tm_deflate_t deflator, const uint8_t* in, size_t in_len, size_t* in_total, uint8_t* out, size_t out_len, size_t* out_total);
// int tm_deflate_end_gzip (tm_deflate_t deflator, uint8_t* out, size_t out_len, size_t* out_total);
//
// size_t tm_inflate_alloc_size ();
// int tm_inflate_alloc (tm_inflate_t* inflator);
// int tm_inflate_start_gzip (tm_inflate_t inflator, uint8_t* out, size_t out_len, size_t* out_total);
// int tm_inflate_write (tm_inflate_t inflator, const uint8_t* in, size_t in_len, size_t* in_total, uint8_t* out, size_t out_len, size_t* out_total);
// int tm_inflate_end_gzip (tm_inflate_t _inflator, uint8_t* out, size_t out_len, size_t* out_total);

/**
 * Random
 */

static int l_tm_random_bytes (lua_State *L)
{
  uint8_t *a = (uint8_t *) lua_touserdata(L, 1);
  size_t start = (size_t) lua_tonumber(L, 2);
  size_t end = (size_t) lua_tonumber(L, 3);

  size_t len = (end - start) > 0 ? end - start : 0;
  size_t read = 0;
  lua_pushnumber(L, tm_random_bytes(&a[start], len, &read));
  lua_pushnumber(L, read);
  return 2;
}

#ifdef ENABLE_TLS

static int l_tm_hmac_sha1 (lua_State *L)
{
  size_t key_len = 0;
  uint8_t *key = (uint8_t *) colony_toconstdata(L, 1, &key_len);
  size_t msg_len = 0;
  uint8_t *msg = (uint8_t *) colony_toconstdata(L, 2, &msg_len);

  SHA1_CTX context;

  if (key_len > 64) {
    uint8_t* hashedkey = lua_newuserdata(L, 64);
    SHA1_Init(&context);
    SHA1_Update(&context, key, key_len);
    SHA1_Final(hashedkey, &context);
    key_len = 20;
    key = hashedkey;
  }

  uint8_t* sha1 = colony_createbuffer(L, 20);
  hmac_sha1(msg, msg_len, key, key_len, sha1);

  return 1;
}

#define L_TM_HASH(x, X) static int l_tm_hash_##x##_create (lua_State *L) \
  { \
    X##_CTX* ctx = (X##_CTX *) lua_newuserdata(L, sizeof(X##_CTX)); \
    X##_Init(ctx); \
    return 1; \
  } \
  \
  static int l_tm_hash_##x##_update (lua_State *L) \
  { \
    X##_CTX *ctx = (X##_CTX *) lua_touserdata(L, 1); \
    size_t msg_len = 0; \
    uint8_t *msg = (uint8_t *) colony_toconstdata(L, 2, &msg_len); \
  \
    X##_Update(ctx, msg, msg_len); \
    return 0; \
  } \
  \
  static int l_tm_hash_##x##_digest (lua_State *L) \
  { \
    X##_CTX *ctx = (X##_CTX *) lua_touserdata(L, 1); \
    \
    uint8_t* digest = colony_createbuffer(L, X##_SIZE); \
    X##_Final(digest, ctx); \
    return 1; \
  }

L_TM_HASH(md5, MD5);
L_TM_HASH(sha1, SHA1);
#define SHA224_SIZE SHA224_DIGEST_LENGTH
L_TM_HASH(sha224, SHA224);
#define SHA256_SIZE SHA256_DIGEST_LENGTH
L_TM_HASH(sha256, SHA256);
#define SHA384_SIZE SHA384_DIGEST_LENGTH
L_TM_HASH(sha384, SHA384);
#define SHA512_SIZE SHA512_DIGEST_LENGTH
L_TM_HASH(sha512, SHA512);


#else

static int l_tm_hmac_sha1 (lua_State *L)
{
  lua_pushnil(L);
  return 1;
}

static int l_tm_hash_md5_create (lua_State *L)
{
  lua_pushnil(L);
  return 1;
}

static int l_tm_hash_md5_update (lua_State *L)
{
  lua_pushnil(L);
  return 1;
}

static int l_tm_hash_md5_digest (lua_State *L)
{
  lua_pushnil(L);
  return 1;
}

#endif


/**
 * Load Colony.
 */

#define luaL_setfieldnumber(L, str, num) lua_pushnumber (L, num); lua_setfield (L, -2, str);

#define L_TM_HASH_ENTRIES(x) { "hash_" #x "_create", l_tm_hash_##x##_create }, \
  { "hash_" #x "_update", l_tm_hash_##x##_update }, \
  { "hash_" #x "_digest", l_tm_hash_##x##_digest }

LUALIB_API int luaopen_tm (lua_State *L)
{
  lua_newtable (L);
  luaL_register(L, NULL, (luaL_reg[]) {
    { "cwd", l_tm_cwd },
    { "exit", l_tm_exit },

    // log
    { "log", l_tm_log },

    // host
    { "hostname_lookup", l_tm_hostname_lookup },

    // net
    { "udp_open", l_tm_udp_open },
    { "udp_close", l_tm_udp_close },
    { "udp_listen", l_tm_udp_listen },
    { "udp_receive", l_tm_udp_receive },
    { "udp_readable", l_tm_udp_readable },
    { "udp_send", l_tm_udp_send },

    { "tcp_open", l_tm_tcp_open },
    { "tcp_close", l_tm_tcp_close },
    { "tcp_connect", l_tm_tcp_connect },
    { "tcp_write", l_tm_tcp_write },
    { "tcp_read", l_tm_tcp_read },
    { "tcp_readable", l_tm_tcp_readable },
    { "tcp_listen", l_tm_tcp_listen },
    { "tcp_accept", l_tm_tcp_accept },

#ifdef ENABLE_TLS
    { "ssl_context_create", l_tm_ssl_context_create },
    { "ssl_context_free", l_tm_ssl_context_free },
    { "ssl_session_create", l_tm_ssl_session_create },
    { "ssl_session_altname", l_tm_ssl_session_altname },
    { "ssl_session_cn", l_tm_ssl_session_cn },
    { "ssl_session_free", l_tm_ssl_session_free },
    { "ssl_write", l_tm_ssl_write },
    { "ssl_read", l_tm_ssl_read },
#endif

    // uptime
    { "uptime_init", l_tm_uptime_init },
    { "uptime_micro", l_tm_uptime_micro },

    // timer
    { "set_raw_timeout", l_tm_set_raw_timeout },
    { "clear_raw_timeout", l_tm_clear_raw_timeout },

    // buffer
    { "buffer_create", l_tm_buffer_create },
    { "buffer_index", l_tm_buffer_index },
    { "buffer_set", l_tm_buffer_set },
    { "buffer_get", l_tm_buffer_get },
    { "buffer_fill", l_tm_buffer_fill },
    { "buffer_copy", l_tm_buffer_copy },
    { "buffer_tostring", l_tm_buffer_tostring },
    { "buffer_read_uint8", l_tm_buffer_read_uint8 },
    { "buffer_read_uint16le", l_tm_buffer_read_uint16le },
    { "buffer_read_uint16be", l_tm_buffer_read_uint16be },
    { "buffer_read_uint32le", l_tm_buffer_read_uint32le },
    { "buffer_read_uint32be", l_tm_buffer_read_uint32be },
    { "buffer_read_int8", l_tm_buffer_read_int8 },
    { "buffer_read_int16le", l_tm_buffer_read_int16le },
    { "buffer_read_int16be", l_tm_buffer_read_int16be },
    { "buffer_read_int32le", l_tm_buffer_read_int32le },
    { "buffer_read_int32be", l_tm_buffer_read_int32be },
    { "buffer_write_uint8", l_tm_buffer_write_uint8 },
    { "buffer_write_uint16le", l_tm_buffer_write_uint16le },
    { "buffer_write_uint16be", l_tm_buffer_write_uint16be },
    { "buffer_write_uint32le", l_tm_buffer_write_uint32le },
    { "buffer_write_uint32be", l_tm_buffer_write_uint32be },
    { "buffer_write_int8", l_tm_buffer_write_int8 },
    { "buffer_write_int16le", l_tm_buffer_write_int16le },
    { "buffer_write_int16be", l_tm_buffer_write_int16be },
    { "buffer_write_int32le", l_tm_buffer_write_int32le },
    { "buffer_write_int32be", l_tm_buffer_write_int32be },
    { "buffer_read_float", l_tm_buffer_read_float },
    { "buffer_read_double", l_tm_buffer_read_double },
    { "buffer_write_float", l_tm_buffer_write_float },
    { "buffer_write_double", l_tm_buffer_write_double },

    // fs
    { "fs_type", l_tm_fs_type },
    { "fs_open", l_tm_fs_open },
    { "fs_close", l_tm_fs_close },
    { "fs_read", l_tm_fs_read },
    { "fs_readable", l_tm_fs_readable },
    { "fs_write", l_tm_fs_write },
    { "fs_destroy", l_tm_fs_destroy },
    { "fs_rename", l_tm_fs_rename },
    { "fs_seek", l_tm_fs_seek },
    { "fs_truncate", l_tm_fs_truncate },
    { "fs_length", l_tm_fs_length },

    { "fs_dir_create", l_tm_fs_dir_create },
    { "fs_dir_open", l_tm_fs_dir_open },
    { "fs_dir_read", l_tm_fs_dir_read },
    { "fs_dir_close", l_tm_fs_dir_close },

    // deflate
    { "deflate_start_gzip", l_tm_deflate_start_gzip },
    { "deflate_write", l_tm_deflate_write },
    { "deflate_end_gzip", l_tm_deflate_end_gzip },

    // random
    { "random_bytes", l_tm_random_bytes },
    { "hmac_sha1", l_tm_hmac_sha1 },
    L_TM_HASH_ENTRIES(md5),
    L_TM_HASH_ENTRIES(sha1),
    L_TM_HASH_ENTRIES(sha224),
    L_TM_HASH_ENTRIES(sha256),
    L_TM_HASH_ENTRIES(sha384),
    L_TM_HASH_ENTRIES(sha512),

    // timestamp
    { "timestamp", l_tm_timestamp },
    { "timestamp_update", l_tm_timestamp_update },

    // itoa
    { "itoa", l_tm_itoa },

    { "_sync_gethostbyname", l_tm__sync_gethostbyname },

    { NULL, NULL }
  });

  luaL_setfieldnumber(L, "FS_TYPE_INVALID", TM_FS_TYPE_INVALID);
  luaL_setfieldnumber(L, "FS_TYPE_FILE", TM_FS_TYPE_FILE);
  luaL_setfieldnumber(L, "FS_TYPE_DIR", TM_FS_TYPE_DIR);
  luaL_setfieldnumber(L, "FS_TYPE_MOUNT_FAT", TM_FS_TYPE_MOUNT_FAT);

  luaL_setfieldnumber(L, "RDONLY", TM_RDONLY);
  luaL_setfieldnumber(L, "WRONLY", TM_WRONLY);
  luaL_setfieldnumber(L, "RDWR", TM_RDWR);
  luaL_setfieldnumber(L, "OPEN_EXISTING", TM_OPEN_EXISTING);
  luaL_setfieldnumber(L, "OPEN_ALWAYS", TM_OPEN_ALWAYS);
  luaL_setfieldnumber(L, "CREATE_NEW", TM_CREATE_NEW);
  luaL_setfieldnumber(L, "CREATE_ALWAYS", TM_CREATE_ALWAYS);

  #ifdef ENABLE_TLS
  luaL_setfieldnumber(L, "TLS_ENABLED", 1);
  #else
  luaL_setfieldnumber(L, "TLS_ENABLED", 0);
  #endif
  return 1;
}
