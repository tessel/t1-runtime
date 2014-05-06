#include "tm.h"

#include <poll.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <dirent.h>

/**
 * Filesystem
 */

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
    return ufds[0].revents & POLLIN ? 1 : 0;
  }
  return 0;
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