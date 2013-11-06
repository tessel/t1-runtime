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
#include <errno.h>  


// debug

#define TM_COMMAND(command, str, ...) printf("#&%c" str "\n", command, ##__VA_ARGS__)
#define TM_DEBUG(str, ...) TM_COMMAND('d', str, ##__VA_ARGS__)


// net

typedef int tm_socket_t;

tm_socket_t tm_udp_open ();
tm_socket_t tm_tcp_open ();
int tm_tcp_close ();
int tm_tcp_connect (tm_socket_t sock, uint8_t ip0, uint8_t ip1, uint8_t ip2, uint8_t ip3, uint16_t port);
int tm_tcp_write (tm_socket_t sock, uint8_t *buf, size_t buflen);
int tm_tcp_read (tm_socket_t sock, uint8_t *buf, size_t buflen);
int tm_tcp_readable (tm_socket_t sock);
int tm_tcp_listen (tm_socket_t sock, uint16_t port);
tm_socket_t tm_tcp_accept (tm_socket_t sock, uint32_t *ip);

uint32_t tm_hostname_lookup (const uint8_t *hostname);

void tm_uptime_init ();
uint32_t tm_uptime_micro ();


// fs

#if 0
#include <poll.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <dirent.h>

// lowest common denominator: http://elm-chan.org/fsw/ff/en/open.html
enum {
  TM_RDONLY = O_RDONLY,
  TM_WRONLY = O_WRONLY,
  TM_RDWR = O_RDWR,
  TM_OPEN_EXISTING = 0,
  TM_OPEN_ALWAYS = O_CREAT,
  TM_CREATE_NEW = O_CREAT | O_EXCL,
  TM_CREATE_ALWAYS = O_TRUNC
};

// TM_CLOEXEC = O_CLOEXEC
// TM_DIRECTORY = O_DIRECTORY,
// TM_EXCL = O_EXCL,
// TM_NOCTTY = O_NOCTTY,
// TM_NOFOLLOW = O_NOFOLLOW,
// TM_TRUNC = O_TRUNC,
// TM_TTY_INIT = O_TTY_INIT

typedef int tm_fs_t;

tm_fs_t tm_fs_open (const char *pathname, uint32_t flags);
int tm_fs_close (tm_fs_t fd);
ssize_t tm_fs_read (int fd, uint8_t *buf, size_t size);
int tm_fs_readable (tm_fs_t fd);

typedef DIR* tm_fs_dir_t;

int tm_fs_dir_open (const char *pathname, tm_fs_dir_t* dirptr);
int tm_fs_dir_read (tm_fs_dir_t dir, const char **strptr);
int tm_fs_dir_close (tm_fs_dir_t dir);
#endif

#include "ff.h"
#include "diskio.h"

#define FA_WRITE 0
#define FA_OPEN_ALWAYS 0
#define FA_CREATE_NEW 0
#define FA_CREATE_ALWAYS 0

enum {
  TM_RDONLY = FA_READ,
  TM_WRONLY = FA_WRITE,
  TM_RDWR = FA_READ | FA_WRITE,
  TM_OPEN_EXISTING = FA_OPEN_EXISTING,
  TM_OPEN_ALWAYS = FA_OPEN_ALWAYS,
  TM_CREATE_NEW = FA_CREATE_NEW,
  TM_CREATE_ALWAYS = FA_CREATE_ALWAYS
};

void tm_fs_init ();

typedef FIL tm_fs_t;

int tm_fs_open (tm_fs_t* fd, const char *pathname, uint32_t flags);
int tm_fs_close (tm_fs_t* fd);
int tm_fs_read (tm_fs_t* fd, uint8_t *buf, size_t size, size_t* read);
int tm_fs_readable (tm_fs_t* fd);

typedef struct {
  DIR dir;
  FILINFO info;
  char lfname[256];
} tm_fs_dir_t;

int tm_fs_dir_open (tm_fs_dir_t* dir, const char *pathname);
int tm_fs_dir_read (tm_fs_dir_t* dir, const char **strptr);
int tm_fs_dir_close (tm_fs_dir_t* dir);


// runtime

LUALIB_API int luaopen_tm (lua_State *L);

#ifdef __cplusplus
}
#endif
#endif