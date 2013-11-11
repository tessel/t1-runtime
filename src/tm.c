#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>

#include "tm.h"


/**
 * Net
 */

#ifdef COLONY_PC
uint32_t tm_hostname_lookup (const uint8_t *hostname)
{
  struct hostent *h;

  /* get the host info */
  if ((h = gethostbyname((const char *) hostname)) == NULL) {
    herror("gethostbyname(): ");
    return 0;
  }
  return ((struct in_addr *)h->h_addr)->s_addr;
}

tm_socket_t tm_udp_open ()
{
    return socket(AF_INET, SOCK_STREAM, 0);
}


tm_socket_t tm_tcp_open ()
{
    return socket(AF_INET, SOCK_STREAM, 0);
}

int tm_tcp_close (tm_socket_t sock)
{
    return shutdown(sock, SHUT_WR) == 0 ? 0 : -errno;
    // return close(sock);
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

int tm_tcp_listen (tm_socket_t sock, uint16_t port)
{
  // CC3000_START;

  struct sockaddr localSocketAddr;
  localSocketAddr.sa_family = AF_INET;
  localSocketAddr.sa_data[0] = (port & 0xFF00) >> 8; //ascii_to_char(0x01, 0x01);
  localSocketAddr.sa_data[1] = (port & 0x00FF); //ascii_to_char(0x05, 0x0c);
  localSocketAddr.sa_data[2] = 0;
  localSocketAddr.sa_data[3] = 0;
  localSocketAddr.sa_data[4] = 0;
  localSocketAddr.sa_data[5] = 0;

  // Bind socket
  // TM_COMMAND('w', "Binding local socket...");
  int sockStatus;
  if ((sockStatus = bind(sock, &localSocketAddr, sizeof(struct sockaddr))) != 0) {
    // TM_COMMAND('w', "binding failed: %d", sockStatus);
    // CC3000_END;
    return -1;
  }

  // TM_DEBUG("Listening on local socket...");
  int listenStatus = listen(sock, 1);
  if (listenStatus != 0) {
    // TM_COMMAND('w', "cannot listen to socket: %d", listenStatus);
    // CC3000_END;
    return -1;
  }

  // CC3000_END;
  return 0;
}

// Returns -1 on error or no socket.
// Returns -2 on pending connection.
// Returns >= 0 for socket descriptor.
tm_socket_t tm_tcp_accept (tm_socket_t sock, uint32_t *ip)
{
  struct sockaddr addrClient;
  socklen_t addrlen;
  int res = accept(sock, &addrClient, &addrlen);
  *ip = ((struct sockaddr_in *) &addrClient)->sin_addr.s_addr;
  return res;
}
#endif


#if COLONY_EMBED

uint32_t tm_hostname_lookup (const uint8_t *hostname)
{
  return 0;
}

tm_socket_t tm_udp_open ()
{
    return 0;
}


tm_socket_t tm_tcp_open ()
{
    return 0;
}

int tm_tcp_close (tm_socket_t sock)
{
    return 0;
}

int tm_tcp_connect (tm_socket_t sock, uint8_t ip0, uint8_t ip1, uint8_t ip2, uint8_t ip3, uint16_t port)
{
    return 0;
}

// http://publib.boulder.ibm.com/infocenter/iseries/v5r3/index.jsp?topic=%2Frzab6%2Frzab6xnonblock.htm

int tm_tcp_write (tm_socket_t sock, uint8_t *buf, size_t buflen)
{
    return 0;
}

int tm_tcp_read (tm_socket_t sock, uint8_t *buf, size_t buflen)
{
    return 0;
}

int tm_tcp_readable (tm_socket_t sock)
{
    return 0;
}

int tm_tcp_listen (tm_socket_t sock, uint16_t port)
{
  return 0;
}

// Returns -1 on error or no socket.
// Returns -2 on pending connection.
// Returns >= 0 for socket descriptor.
tm_socket_t tm_tcp_accept (tm_socket_t sock, uint32_t *ip)
{
  return 0;
}

#endif


/**
 * Uptime
 */

void tm_uptime_init ()
{
  // nop
}

uint32_t tm_uptime_micro ()
{
  // struct timeval tv;
  // gettimeofday(&tv, NULL);

  // double time_in_mill = (tv.tv_sec) * 1000 + (tv.tv_usec) / 1000;
  // return (uint32_t) (time_in_mill * 1000);
  return 0;
}


/**
 * Filesystem
 */

#if !COLONY_FATFS

void tm_fs_init (void *data)
{
  // nop
}


int tm_fs_open (tm_fs_t* fd, const char *pathname, uint32_t flags)
{
  *fd = open(pathname, flags);
  return *fd < 0 ? errno : 0;
}


int tm_fs_close (tm_fs_t* fd)
{
  return close(*fd) < 0 ? errno : 0;
}


int tm_fs_read (tm_fs_t* fd, uint8_t *buf, size_t size, size_t* nread)
{
  ssize_t ret = read(*fd, buf, size);
  *nread = ret > 0 ? ret : 0;
  return ret < 0 ? errno : 0;
}


int tm_fs_write (tm_fs_t* fd, uint8_t *buf, size_t size, size_t* nread)
{
  ssize_t ret = write(*fd, buf, size);
  *nread = ret > 0 ? ret : 0;
  return ret < 0 ? errno : 0;
}

// returns > 0 if readable
int tm_fs_readable (tm_fs_t* fd)
{
  struct pollfd ufds[1];
  ufds[0].fd = *fd;
  ufds[0].events = POLLIN;
  if (poll(ufds, 1, 0) > 0) {
    return ufds[0].revents & POLLIN ? 0 : 1;
  }
  return 1;
}

int tm_fs_dir_create (const char *pathname)
{
  return mkdir(pathname, 0755) < 0 ? errno : 0;
}

int tm_fs_dir_open (tm_fs_dir_t* dir, const char *pathname)
{
  *dir = opendir(pathname);
  return *dir == NULL ? errno : 0;
}

int tm_fs_dir_read (tm_fs_dir_t* dir, const char **strptr)
{
  struct dirent *ret = readdir(*dir);
  if (ret != NULL) {
    *strptr = ret->d_name;
  } else {
    *strptr = NULL;
  }
  return ret != NULL ? 0 : errno;
}

int tm_fs_dir_close (tm_fs_dir_t* dir)
{
  int ret = closedir(*dir);
  return ret < 0 ? errno : 0;
}

#else

FATFS fs;

void tm_fs_init ()
{
  int res = f_mount(&fs, "", 0);
  if (res) { printf("fail mount with %d\n", res); }
}


int tm_fs_open (tm_fs_t* fd, const char* pathname, uint32_t flags)
{
  return f_open(fd, pathname, flags);
}


int tm_fs_close (tm_fs_t *fd)
{
  return f_close(fd);
}

int tm_fs_read (tm_fs_t* fd, uint8_t* buf, size_t size, size_t* nread)
{
  uint nread_u;
  int ret = f_read(fd, buf, size, &nread_u);
  *nread = nread_u;
  return ret;
}

int tm_fs_write (tm_fs_t* fd, uint8_t* buf, size_t size, size_t* nread)
{
  uint nread_u;
  int ret = f_write(fd, buf, size, &nread_u);
  *nread = nread_u;
  return ret;
}

int tm_fs_readable (tm_fs_t* fd)
{
  return 0;
}

int tm_fs_dir_create (const char *pathname)
{
  return f_mkdir(pathname);
}

int tm_fs_dir_open (tm_fs_dir_t* dir, const char *pathname)
{
  dir->info.lfname = (TCHAR*) &dir->lfname;
  dir->info.lfsize = sizeof dir->lfname;
  return f_opendir(&dir->dir, pathname);
}

int tm_fs_dir_read (tm_fs_dir_t* dir, const char **strptr)
{
  int res = f_readdir(&dir->dir, &dir->info);
  *strptr = NULL;
  if (res == 0 && dir->info.fname[0] != 0) {
    *strptr = *dir->info.lfname ? (const char *) (dir->info.lfname) : (const char *) &(dir->info.fname);
  }
  return res;
}

int tm_fs_dir_close (tm_fs_dir_t* dir)
{
  return f_closedir(&dir->dir);
}

#endif


/*

  typedef long ssize_t;
  typedef unsigned long size_t;
  typedef uint32_t uid_t;
  typedef uint32_t gid_t;
  typedef uint16_t mode_t;
  typedef uint8_t sa_family_t;
  typedef uint32_t dev_t;
  typedef int64_t blkcnt_t;
  typedef int32_t blksize_t;
  typedef int32_t suseconds_t;
  typedef uint16_t nlink_t;
  typedef uint64_t ino_t; // at least on recent desktop; TODO define as ino64_t
  typedef long time_t;
  typedef int32_t daddr_t;
  typedef unsigned long clock_t;
  typedef unsigned int nfds_t;

  typedef long int off_t;

  struct timeval {
    time_t tv_sec;
    suseconds_t tv_usec;
  };
  struct timespec {
    time_t tv_sec;
    long   tv_nsec;
  };
  struct utimbuf {
    time_t actime;       // access time 
    time_t modtime;      // modification time 
  };

  struct stat {
    dev_t           st_dev;
    mode_t          st_mode;
    nlink_t         st_nlink;
    ino_t           st_ino;
    uid_t           st_uid;
    gid_t           st_gid;
    dev_t           st_rdev;
    struct timespec st_atimespec;
    struct timespec st_mtimespec;
    struct timespec st_ctimespec;
    struct timespec st_birthtimespec;
    off_t           st_size;
    blkcnt_t        st_blocks;
    blksize_t       st_blksize;
    uint32_t        st_flags;
    uint32_t        st_gen;
    int32_t         st_lspare;
    int64_t         st_qspare[2];
  };

  ssize_t sendfile(int out_fd, int in_fd, off_t *offset, size_t count);
  int stat(const char *path, struct stat *buf);
  int fstat(int fd, struct stat *buf);
  int lstat(const char *path, struct stat *buf);
  int ftruncate(int fildes, off_t length);
  int truncate(const char *path, off_t length);
  int utime(const char *filename, const struct utimbuf *times);
  int futimes(int fd, const struct timeval tv[2]);
  int chmod(const char *path, mode_t mode);
  int fchmod(int fd, mode_t mode);
  int fsync(int fd);
  int fdatasync(int fd);
  int unlink(const char *pathname);
  int rmdir(const char *pathname);
  int mkdir(const char *pathname, mode_t mode);
  int rename(const char *oldpath, const char *newpath);
  int getdirentries(int fd, char *buf, int nbytes, long *basep);

  int link(const char *oldpath, const char *newpath);
  int symlink(const char *oldpath, const char *newpath);
  int chown(const char *path, uid_t owner, gid_t group);
  int fchown(int fd, uid_t owner, gid_t group);

*/

/*
UV_FS_OPEN,
UV_FS_CLOSE,
UV_FS_READ,
UV_FS_WRITE,
UV_FS_SENDFILE,
UV_FS_STAT,
UV_FS_LSTAT,
UV_FS_FSTAT,
UV_FS_FTRUNCATE,
UV_FS_UTIME,
UV_FS_FUTIME,
UV_FS_CHMOD,
UV_FS_FCHMOD,
UV_FS_FSYNC,
UV_FS_FDATASYNC,
UV_FS_UNLINK,
UV_FS_RMDIR,
UV_FS_MKDIR,
UV_FS_RENAME,
UV_FS_READDIR,
UV_FS_LINK,
UV_FS_SYMLINK,
UV_FS_READLINK,
UV_FS_CHOWN,
UV_FS_FCHOWN
*/