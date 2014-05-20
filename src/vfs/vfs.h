#pragma once

#include <stdint.h>
#include <stdbool.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>

struct tm_fs_ent;

typedef enum {
	VFS_TYPE_INVALID,
	VFS_TYPE_RAW_FILE,
	VFS_TYPE_DIR,
	VFS_TYPE_FAT_MOUNT,
} tm_fs_enttype;

typedef struct tm_fs_direntry {
	const char* name;
	struct tm_fs_ent* ent;
} tm_fs_direntry;

typedef struct tm_fs_dir {
	unsigned num_entries;
	tm_fs_direntry* /* ~ */ entries;
} tm_fs_dir;

typedef struct tm_fs_raw_file {
	bool data_owned;
	unsigned mtime;
	unsigned length;
	uint8_t* /* ~ / &mut */ data;
} tm_fs_raw_file;

typedef struct tm_fs_fat_mountpt {
	unsigned fatfs_drivenum;
} tm_fs_fat_mountpt;

typedef struct tm_fs_file_handle {
	struct tm_fs_ent* ent;
	unsigned position;
} tm_fs_file_handle;

typedef tm_fs_file_handle tm_fs_dir_handle;

typedef struct tm_fs_ent {
	tm_fs_enttype type;
	struct tm_fs_ent* parent;
	union {
		tm_fs_dir dir;
		tm_fs_raw_file file;
		tm_fs_fat_mountpt fat_mountpt;
	};
} tm_fs_ent;

tm_fs_ent* /* ~ */ tm_fs_dir_create();
void tm_fs_destroy(/* ~ */ tm_fs_ent* ent);

tm_fs_ent* tm_fs_raw_file_create();
tm_fs_ent* tm_fs_raw_file_from_buf(const uint8_t* buf, unsigned length, unsigned mtime);
void tm_fs_raw_file_destroy(tm_fs_raw_file* file);

int tm_fs_dir_append(tm_fs_ent* dir, const char* name, tm_fs_ent* ent);


/// Lookup `path` rooted at `dir`
/// If `dir` is not a directory, returns -ENOTDIR
/// If the file is not found, returns -ENOENT.
/// In that case, if the parent directory exists, `out` is set to the parent directory, otherwise NULL.
int tm_fs_lookup(tm_fs_ent* /*&mut 'fs*/ dir, const char* /* & */ path, tm_fs_ent** out);

int tm_fs_mount_tar(tm_fs_ent* /*&mut*/ root, char* /* & */ path, uint8_t* /* &'fs */ tar, unsigned size);
int tm_fs_mount_fat(tm_fs_ent* /*&mut*/ root, char* /* & */ path, unsigned fatfs_drivenum);

int tm_fs_mkdir(tm_fs_ent* root, const char* path);
int tm_fs_insert(tm_fs_ent* root, const char* path, tm_fs_ent* ent);

#define TM_RDONLY           (1<<0)
#define TM_WRONLY           (1<<1)
#define TM_RDWR             (TM_RDONLY | TM_WRONLY)
#define TM_CREAT            (1<<2)
#define TM_TRUNC            (1<<3)
#define TM_EXCL             (1<<4)
#define TM_OPEN_EXISTING    0
#define TM_OPEN_ALWAYS      TM_CREAT
#define TM_CREATE_NEW       (TM_CREAT | TM_EXCL)
#define TM_CREATE_ALWAYS    (TM_CREAT | TM_TRUNC)

int tm_fs_open(tm_fs_file_handle* /* -> ~<'s> */ out, tm_fs_ent* /* &'s */ root, const char* /* & */ pathname, unsigned flags);
int tm_fs_close(tm_fs_file_handle* /* move */ handle);
int tm_fs_read (tm_fs_file_handle* fd, uint8_t *buf, size_t size, size_t* nread);
int tm_fs_write (tm_fs_file_handle* fd, const uint8_t *buf, size_t size);
int tm_fs_readable (tm_fs_file_handle* fd);

int tm_fs_dir_open(tm_fs_file_handle* out, tm_fs_ent* root, const char* pathname);
int tm_fs_dir_close(tm_fs_file_handle* fd);
int tm_fs_dir_read(tm_fs_file_handle* fd, const char** out);

int tm_fs_rename (tm_fs_ent* root, const char* oldname, const char* newname);
unsigned tm_fs_seek(tm_fs_file_handle* fd, unsigned position);
unsigned tm_fs_length(tm_fs_file_handle* fd);
const uint8_t* tm_fs_contents(tm_fs_file_handle* fd);
