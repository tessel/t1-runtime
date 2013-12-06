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
#include <stdlib.h>
#include <time.h>
#include <stdio.h>
#include <string.h>
#include <stdint.h>

#ifdef COLONY_PC
#include <sys/socket.h>
#include <arpa/inet.h> //inet_addr
#include <netdb.h>
#include <sys/types.h>
#include <unistd.h>
#include <sys/time.h>
#endif

// debug

#define TM_COMMAND(command, str, ...) printf("#&%c" str "\n", command, ##__VA_ARGS__)
#define TM_DEBUG(str, ...) TM_COMMAND('d', str, ##__VA_ARGS__)


// net

typedef int tm_socket_t;

tm_socket_t tm_udp_open ();
int tm_udp_close (int sock);
int tm_udp_listen (int ulSocket, int port);
int tm_udp_receive (int ulSocket, uint8_t *buf, unsigned long buf_len, uint32_t *ip);
int tm_udp_readable (tm_socket_t sock);
int tm_udp_send (int ulSocket, uint8_t ip0, uint8_t ip1, uint8_t ip2, uint8_t ip3, int port, uint8_t *buf, unsigned long buf_len);

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

#ifdef TM_FS_fat

#include "ff.h"
#include "diskio.h"

enum {
  TM_RDONLY = FA_READ,
  TM_WRONLY = FA_WRITE,
  TM_RDWR = FA_READ | FA_WRITE,
  TM_OPEN_EXISTING = FA_OPEN_EXISTING,
  TM_OPEN_ALWAYS = FA_OPEN_ALWAYS,
  TM_CREATE_NEW = FA_CREATE_NEW,
  TM_CREATE_ALWAYS = FA_CREATE_ALWAYS,

  TM_EXIST = FR_EXIST
};

typedef FIL tm_fs_t;

typedef struct {
  DIR dir;
  FILINFO info;
  char lfname[256];
} tm_fs_dir_t;

#else

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
  TM_CREATE_ALWAYS = O_TRUNC,

  TM_EXIST = EEXIST
};

typedef int tm_fs_t;
typedef DIR* tm_fs_dir_t;

#endif 

void tm_fs_init ();

int tm_fs_open (tm_fs_t* fd, const char *pathname, uint32_t flags);
int tm_fs_close (tm_fs_t* fd);
int tm_fs_read (tm_fs_t* fd, uint8_t *buf, size_t size, size_t* read);
int tm_fs_readable (tm_fs_t* fd);
int tm_fs_write (tm_fs_t* fd, uint8_t *buf, size_t size, size_t* read);

int tm_fs_dir_create (const char *pathname);
int tm_fs_dir_open (tm_fs_dir_t* dir, const char *pathname);
int tm_fs_dir_read (tm_fs_dir_t* dir, const char **strptr);
int tm_fs_dir_close (tm_fs_dir_t* dir);

#ifdef __cplusplus
}
#endif
#endif