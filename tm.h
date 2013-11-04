#ifndef _TM_H_
#define _TM_H_
#ifdef __cplusplus
extern "C" {
#endif


#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>

#include <stdint.h>
#include <setjmp.h>
#include <stdio.h>
#include <math.h>
#include <stdlib.h>
#include <string.h>


// debug

#define TM_COMMAND(command, str, ...) printf("#&%c" str "\n", command, ##__VA_ARGS__)
#define TM_DEBUG(str, ...) TM_COMMAND('d', str, ##__VA_ARGS__)


// net

typedef int tm_socket_t;
#define TM_SOCKET_INVALID NULL

tm_socket_t tm_udp_open ();
tm_socket_t tm_tcp_open ();
int tm_tcp_connect (tm_socket_t sock, uint8_t ip0, uint8_t ip1, uint8_t ip2, uint8_t ip3, uint16_t port);
int tm_tcp_write (tm_socket_t sock, uint8_t *buf, size_t buflen);
int tm_tcp_read (tm_socket_t sock, uint8_t *buf, size_t buflen);
int tm_tcp_readable (tm_socket_t sock);
int tm_tcp_listen (tm_socket_t sock, int port);
int tm_tcp_accept (tm_socket_t sock, uint32_t *ip);

uint32_t tm_hostname_lookup (const uint8_t *hostname);

void tm_uptime_init ();
uint32_t tm_uptime_micro ();


// fs

#include "dirent.h"
void *tm_fs_dir_open (const char *path);
const char *tm_fs_dir_next (void *dir);
void tm_fs_dir_close (void *dir);


// runtime

void luaopen_tm (lua_State *L);

#ifdef __cplusplus
}
#endif
#endif