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

int tm_fs_type (const char *pathname)
{
  int status;
  struct stat st_buf;

  status = stat(pathname, &st_buf);
  if (status != 0) {
      return -errno;
  }

  if (S_ISREG (st_buf.st_mode)) {
    return TM_FS_TYPE_FILE;
  }
  if (S_ISDIR (st_buf.st_mode)) {
    return TM_FS_TYPE_DIR;
  }
  return TM_FS_TYPE_INVALID;
}


int tm_fs_open (tm_fs_t* fd, const char *pathname, uint32_t flags, uint32_t mode)
{
  *fd = open(pathname, flags, mode);
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


int tm_fs_write (tm_fs_t* fd, const uint8_t *buf, size_t size, size_t* nread)
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

#define _XOPEN_SOURCE 500
#include <stdio.h>
#include <ftw.h>
#include <unistd.h>

static int unlink_cb(const char *fpath, const struct stat *sb, int typeflag, struct FTW *ftwbuf)
{
    int rv = remove(fpath);

    if (rv)
        perror(fpath);

    return rv;
}

static int rmrf(const char *path)
{
    return nftw(path, unlink_cb, 64, FTW_DEPTH | FTW_PHYS);
}


int tm_fs_destroy (const char *pathname)
{
  int status;
  struct stat st_buf;

  status = stat(pathname, &st_buf);
  if (status != 0) {
    return 0;
  }

  // Directory
  if (S_ISDIR (st_buf.st_mode)) {
    return rmrf(pathname);
  }

  // File
  ssize_t ret = unlink(pathname);
  return ret < 0 ? errno : 0;
}


ssize_t tm_fs_seek (tm_fs_t* fd, size_t position)
{
  off_t ret = lseek(*fd, position, SEEK_SET);
  return (ssize_t) ret;
}


ssize_t tm_fs_length (tm_fs_t* fd)
{
  int status;
  struct stat st_buf;

  status = fstat(*fd, &st_buf);
  return (ssize_t) st_buf.st_size;
}


int tm_fs_rename (const char* oldname, const char* newname)
{
  int ret = rename(oldname, newname);
  return ret < 0 ? errno : 0;
}


// truncate to current cursor in file
int tm_fs_truncate (tm_fs_t* fd)
{
  size_t length = lseek(*fd, 0, SEEK_CUR);
  int ret = ftruncate(*fd, length);
  return ret < 0 ? errno : length;
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