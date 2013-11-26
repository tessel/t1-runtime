#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>

#include "tm.h"


/**
 * Filesystem
 */

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