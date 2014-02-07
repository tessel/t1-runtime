#pragma once

#include <stdint.h>
#include <stdbool.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>

typedef struct vfs_ent vfs_ent;
typedef struct vfs_dir vfs_dir;

typedef enum {
	VFS_TYPE_INVALID,
	VFS_TYPE_RAW_FILE,
	VFS_TYPE_DIR,
	VFS_TYPE_FAT_MOUNT,
} vfs_enttype;

typedef struct vfs_direntry {
	const char* name;
	vfs_ent* ent;
} vfs_direntry;

typedef struct vfs_dir {
	unsigned num_entries;
	vfs_direntry* /* ~ */ entries;
} vfs_dir;

typedef struct vfs_raw_file {
	bool data_owned;
	unsigned mtime;
	unsigned length;
	uint8_t* /* ~ / &mut */ data;
} vfs_raw_file;

typedef struct vfs_fat_mountpt {
	unsigned fatfs_drivenum;
} vfs_fat_mountpt;

typedef struct vfs_file_handle {
	vfs_ent* ent;
	unsigned position;
} vfs_file_handle;

typedef struct vfs_dir_handle {
	vfs_dir* /* & */ dir;
	unsigned position;
} vfs_dir_handle;

typedef struct vfs_ent {
	vfs_enttype type;
	vfs_ent* parent;
	union {
		vfs_dir dir;
		vfs_raw_file file;
		vfs_fat_mountpt fat_mountpt;
	};
} vfs_ent;

vfs_ent* /* ~ */ vfs_dir_create();
void vfs_destroy(/* ~ */ vfs_ent* ent);

vfs_ent* vfs_raw_file_create();
vfs_ent* vfs_raw_file_from_buf(const uint8_t* buf, unsigned length, unsigned mtime);
void vfs_raw_file_destroy(vfs_raw_file* file);

int vfs_dir_append(vfs_ent* dir, const char* name, vfs_ent* ent);


/// Lookup `path` rooted at `dir`
/// If `dir` is not a directory, returns -ENOTDIR
/// If the file is not found, returns -ENOENT.
/// In that case, if the parent directory exists, `out` is set to the parent directory, otherwise NULL.
int vfs_lookup(vfs_ent* /*&mut 'fs*/ dir, const char* /* & */ path, vfs_ent** out);

int vfs_mount_tar(vfs_ent* /*&mut*/ root, char* /* & */ path, uint8_t* /* &'fs */ tar, unsigned size);
int vfs_mount_fat(vfs_ent* /*&mut*/ root, char* /* & */ path, unsigned fatfs_drivenum);

int vfs_mkdir(vfs_ent* root, const char* path);
int vfs_insert(vfs_ent* root, const char* path, vfs_ent* ent);

#define VFS_O_WRITE (1<<0)
#define VFS_O_CREAT (1<<1)
#define VFS_O_TRUNC (1<<2)

int vfs_open(vfs_file_handle* /* -> ~<'s> */ out, vfs_ent* /* &'s */ root, char* /* & */ pathname, unsigned flags);
int vfs_close(vfs_file_handle* /* move */ handle);
int vfs_read (vfs_file_handle* fd, uint8_t *buf, size_t size, size_t* nread);
int vfs_write (vfs_file_handle* fd, const uint8_t *buf, size_t size);

unsigned vfs_length(vfs_file_handle* fd);
const uint8_t* vfs_contents(vfs_file_handle* fd);
