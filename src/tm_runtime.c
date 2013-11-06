#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>

#include "tm.h"


static void stackDump (lua_State *L)
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

// static int l_tm_net_udp_close_socket (lua_State* L)
// {
//   int socket = (int) lua_tonumber(L, 2);
//   int newsocket = tm_net_udp_close_socket(socket);

//   lua_pushnumber(L, newsocket);
//   return 1;
// }

// static int l_tm_net_udp_send (lua_State* L)
// {
//   int socket = (int) lua_tonumber(L, 2);
//   int ip0 = (int) lua_tonumber(L, 3);
//   int ip1 = (int) lua_tonumber(L, 4);
//   int ip2 = (int) lua_tonumber(L, 5);
//   int ip3 = (int) lua_tonumber(L, 6);
//   int port = (int) lua_tonumber(L, 7);
//   size_t len;
//   const char *text = lua_tolstring(L, 8, &len);

//   tm_net_udp_send(socket, ip0, ip1, ip2, ip3, port, (uint8_t *) text, len);
//   return 0;
// }

// static int l_tm_net_udp_listen (lua_State *L)
// {
//   int socket = (int) lua_tonumber(L, 2);
//   int port = (int) lua_tonumber(L, 3);

//   lua_pushnumber(L, tm_net_udp_listen(socket, port));

//   return 1;
// }

// static int l_tm_net_udp_receive (lua_State *L)
// {
//   int socket = (int) lua_tonumber(L, 2);

//   uint8_t buf[256];
//   sockaddr from;
//   socklen_t from_len;
//   size_t buf_len = tm_net_udp_receive(socket, buf, sizeof(buf), &from, &from_len);

//   lua_pushlstring(L, buf, buf_len);

//   return 1;
// }

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

  tm_tcp_connect(socket, ip0, ip1, ip2, ip3, port);
  return 0;
}


static int l_tm_tcp_write (lua_State* L)
{
  tm_socket_t socket = (tm_socket_t) lua_tonumber(L, 1);
  size_t len;
  const char *text = lua_tolstring(L, 2, &len);

  tm_tcp_write(socket, (uint8_t*) text, len);
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


/**
 * Uptime
 */


static int l_tm_uptime_init (lua_State* L)
{
  tm_uptime_init();
  return 0;
}


static int l_tm_uptime_micro (lua_State* L)
{
  lua_pushnumber(L, tm_uptime_micro());
  return 1;
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


/**
 * fs
 */

static int l_tm_fs_open (lua_State* L)
{
  const char *pathname = (const char *) lua_tostring(L, 1);
  uint32_t flags = (uint32_t) lua_tonumber(L, 2);

  tm_fs_t* fd = (tm_fs_t*) lua_newuserdata(L, sizeof(tm_fs_t));
  int res = tm_fs_open(fd, pathname, flags);
  lua_pushnumber(L, res);
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
    lua_pushlstring(L, (const char *) buf, nread);
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


static int l_tm_fs_dir_open (lua_State* L)
{
  const char *pathname = (const char *) lua_tostring(L, 1);

  tm_fs_dir_t* dir = (tm_fs_dir_t*) lua_newuserdata(L, sizeof(tm_fs_dir_t));
  memset(dir, 0, sizeof(tm_fs_dir_t));
  int ret = tm_fs_dir_open(dir, pathname);
  if (ret > 0) {
    lua_pop(L, 1);
    lua_pushnil(L);
  } else {
    lua_pushlightuserdata(L, dir);
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


/**
 * Load Colony.
 */

#define luaL_setfieldnumber(L, str, num) lua_pushnumber (L, num); lua_setfield (L, -2, str);

LUALIB_API int luaopen_tm (lua_State *L)
{
  lua_newtable (L);
  luaL_register(L, NULL, (luaL_reg[]) {

    // host
    { "hostname_lookup", l_tm_hostname_lookup },

    // net
    { "udp_open", l_tm_udp_open },
    { "tcp_open", l_tm_tcp_open },
    { "tcp_close", l_tm_tcp_close },
    { "tcp_connect", l_tm_tcp_connect },
    { "tcp_write", l_tm_tcp_write },
    { "tcp_read", l_tm_tcp_read },
    { "tcp_readable", l_tm_tcp_readable },
    { "tcp_listen", l_tm_tcp_listen },
    { "tcp_accept", l_tm_tcp_accept },

    // uptime
    { "uptime_init", l_tm_uptime_init },
    { "uptime_micro", l_tm_uptime_micro },

    // buffer
    { "buffer_create", l_tm_buffer_create },
    { "buffer_set", l_tm_buffer_set },
    { "buffer_get", l_tm_buffer_get },
    { "buffer_fill", l_tm_buffer_fill },
    { "buffer_copy", l_tm_buffer_copy },

    // fs
    { "fs_open", l_tm_fs_open },
    { "fs_close", l_tm_fs_close },
    { "fs_read", l_tm_fs_read },
    { "fs_readable", l_tm_fs_readable },
    { "fs_dir_open", l_tm_fs_dir_open },
    { "fs_dir_read", l_tm_fs_dir_read },
    { "fs_dir_close", l_tm_fs_dir_close },

    { NULL, NULL }
  });
  luaL_setfieldnumber(L, "RDONLY", TM_RDONLY);
  luaL_setfieldnumber(L, "WRONLY", TM_WRONLY);
  luaL_setfieldnumber(L, "RDWR", TM_RDWR);
  luaL_setfieldnumber(L, "OPEN_EXISTING", TM_OPEN_EXISTING);
  luaL_setfieldnumber(L, "OPEN_ALWAYS", TM_OPEN_ALWAYS);
  luaL_setfieldnumber(L, "CREATE_NEW", TM_CREATE_NEW);
  luaL_setfieldnumber(L, "CREATE_ALWAYS", TM_CREATE_ALWAYS);
  return 1;
}
