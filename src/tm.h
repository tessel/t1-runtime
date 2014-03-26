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

// logging
void tm_log(char level, const char* string, unsigned length);
void tm_logf(char level, const char* format, ...);

#define SYS_DBG 1
#define SYS_LOG 20
#define SYS_ERR 22

#define TM_DEBUG(str, ...) tm_logf(SYS_DBG, str, ##__VA_ARGS__)
#define TM_LOG(str, ...) tm_logf(SYS_LOG, str, ##__VA_ARGS__)
#define TM_ERR(str, ...) tm_logf(SYS_ERR, str, ##__VA_ARGS__)

// net

typedef int tm_socket_t;

// UDP

tm_socket_t tm_udp_open ();
int tm_udp_close (int sock);
int tm_udp_listen (int ulSocket, int port);
int tm_udp_receive (int ulSocket, uint8_t *buf, unsigned long buf_len, uint32_t *ip);
int tm_udp_readable (tm_socket_t sock);
int tm_udp_send (int ulSocket, uint8_t ip0, uint8_t ip1, uint8_t ip2, uint8_t ip3, int port, uint8_t *buf, unsigned long buf_len);

// TCP

tm_socket_t tm_tcp_open ();
int tm_tcp_close ();
int tm_tcp_connect (tm_socket_t sock, uint8_t ip0, uint8_t ip1, uint8_t ip2, uint8_t ip3, uint16_t port);
int tm_tcp_write (tm_socket_t sock, uint8_t *buf, size_t buflen);
int tm_tcp_read (tm_socket_t sock, uint8_t *buf, size_t buflen);
int tm_tcp_readable (tm_socket_t sock);
int tm_tcp_listen (tm_socket_t sock, uint16_t port);
tm_socket_t tm_tcp_accept (tm_socket_t sock, uint32_t *ip);

// DNS
uint32_t tm_hostname_lookup (const uint8_t *hostname);

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
  TM_CREATE_ALWAYS = O_TRUNC,

  TM_EXIST = EEXIST
};

typedef int tm_fs_t;
typedef DIR* tm_fs_dir_t;

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

#endif

#ifdef __cplusplus
}
#endif
#endif