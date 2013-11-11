#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>
// #include <luajit.h>

#include <stdlib.h>
#include <string.h>

#include "tm.h"
#include "colony.h"


/**
 * Populate FatFS
 */

#ifdef COLONY_FATFS

#include "ff.h"

void populate_fs_file (const char *pathname, const uint8_t *src, size_t len)
{
  FIL fd;
  UINT written;
  int res_open = f_open(&fd, "/~index.colony", TM_RDWR | FA_CREATE_ALWAYS);
  int res_write = f_write(&fd, src, len, &written);
  int res_close = f_close(&fd);
  printf("populate --> %d %d %d\n", res_open, res_write, res_close);
}

const char jscode[] = "return function () console:log('hi'); end";


#include "internal.h"
#include <sys/stat.h> 
#include <fcntl.h>

int populate_fs ()
{
  FATFS fs;
  int res_mount = f_mount(&fs, "", 0);  /* Register work area to the logical drive 0 */
  int res_mkfs = f_mkfs("", 1, 0);         /* Create FAT volume on the logical drive 0. 2nd argument is ignored. */
  // f_mount(NULL, "", 0);
  f_mount(&fs, "", 0);
  // printf("populate --> %d %d\n", res_mount, res_mkfs);


  TAR *t;

#ifdef DEBUG
  puts("opening tarfile...");
#endif
  if (tar_open(&t, "coolarchive.tar",
         NULL,
         O_RDONLY, 0,
         (0 ? TAR_VERBOSE : 0)
         | (1 ? TAR_GNU : 0)) == -1)
  {
    fprintf(stderr, "tar_open(): %s\n", strerror(errno));
    return -1;
  }

#ifdef DEBUG
  puts("extracting tarfile...");
#endif
  if (tar_extract_all(t, "/") != 0)
  {
    fprintf(stderr, "tar_extract_all(): %s\n", strerror(errno));
    return -1;
  }

#ifdef DEBUG
  puts("closing tarfile...");
#endif
  if (tar_close(t) != 0)
  {
    fprintf(stderr, "tar_close(): %s\n", strerror(errno));
    return -1;
  }

  // Add index.js file
  // populate_fs_file("/~index.colony", (const uint8_t*) jscode, strlen(jscode));

  f_mount(NULL, "", 0); // unmount

  return 0;
}

#else

void populate_fs ()
{
  // noop
}

#endif

/**
 * Run
 */

int main (int argc, char *argv[])
{
  lua_State* L;
  // populate_fs();

  populate_fs();
  tm_fs_init();

  // WHY IS FILESYSTEM OUT OF SYNC???
  tm_fs_init();
  tm_fs_dir_t dir;
  tm_fs_dir_open(&dir, "");
  tm_fs_dir_close(&dir);

  colony_runtime_open(&L);
  int ret = colony_runtime_run(&L, argv[1], argv, argc);
  colony_runtime_close(&L);
  return ret;
}
