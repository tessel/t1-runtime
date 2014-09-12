// Copyright 2014 Technical Machine, Inc. See the COPYRIGHT
// file at the top-level directory of this distribution.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

#include "vfs.h"

bool str_match_range(const char* start, const char* end, const char* ref) {
	while (start != end && *start) {
		if (*start++ != *ref++) return false;
	}
	return *ref == 0;
}

char* str_range_copy(const char* start, const char* end) {
	unsigned len = end-start;
	char* val = malloc(len + 1);
	memcpy(val, start, len);
	val[len] = 0;
	return val;
}

char* filename(const char* start) {
	const char* end = start;

	while (*end) {
		if (*end == '/') {
			if (*(end+1) == 0) break;
			start = end+1;
		}
		end++;
	}

	if (str_match_range(start, end, "") || str_match_range(start, end, ".") || str_match_range(start, end, "..")) {
		return NULL;
	}

	return str_range_copy(start, end);
}

tm_fs_ent* /* ~ */ tm_fs_dir_create_entry() {
	tm_fs_ent* ent = malloc(sizeof(tm_fs_ent));
	ent->type = VFS_TYPE_DIR;
	ent->parent = 0;
	ent->dir.num_entries = 0;
	ent->dir.entries = 0;
	return ent;
}

int tm_fs_dir_append(tm_fs_ent* dir, const char* name, tm_fs_ent* ent) {
	if (dir->type != VFS_TYPE_DIR) {
		return -ENOTDIR;
	}

	char* fname = filename(name);
	if (!fname) {
		return -EINVAL;
	}

	dir->dir.num_entries += 1;
	dir->dir.entries = realloc(dir->dir.entries, dir->dir.num_entries*sizeof(tm_fs_direntry));
	tm_fs_direntry* entry = &dir->dir.entries[dir->dir.num_entries - 1];
	entry->name = fname;
	entry->ent = ent;
	ent->parent = dir;

	return 0;
}

static int tm_fs_dir_remove(tm_fs_ent* dir, tm_fs_ent* file) {
	if (dir->type != VFS_TYPE_DIR) {
		return -ENOTDIR;
	}

	dir->dir.num_entries -= 1;
	size_t i = 0;
	for (tm_fs_direntry* entry = dir->dir.entries; i < dir->dir.num_entries; i++) {
		if (entry[i].ent == file) {
			memcpy(&entry[i], &entry[i+1], (dir->dir.num_entries - 1)*sizeof(tm_fs_direntry));
			dir->dir.entries = realloc(dir->dir.entries, dir->dir.num_entries*sizeof(tm_fs_direntry));
			return 0;
		}
	}
	return -ENOENT;
}

void tm_fs_destroy(tm_fs_ent* /* ~ */ ent) {
	switch (ent->type) {
		case VFS_TYPE_RAW_FILE:
			if (ent->parent) {
				tm_fs_dir_remove(ent->parent, ent);
			}
			if (ent->file.data_owned) {
				free(ent->file.data);
			}
			break;
		case VFS_TYPE_DIR:
			if (ent->parent) {
				tm_fs_dir_remove(ent->parent, ent);
			}
			for (unsigned i=0; i<ent->dir.num_entries; i++) {
				tm_fs_direntry* entry = &ent->dir.entries[i];
				free((void*) entry->name);
				tm_fs_destroy(entry->ent);
			}
			free(ent->dir.entries);
			break;
		case VFS_TYPE_MOUNT_FAT:
			//TODO
			break;
		case VFS_TYPE_INVALID:
			break;
	}
	free(ent);
}

tm_fs_ent* tm_fs_raw_file_create() {
	tm_fs_ent* ent = malloc(sizeof(tm_fs_ent));
	ent->type = VFS_TYPE_RAW_FILE;
	ent->parent = NULL;
	ent->file.length = 0;
	ent->file.data = 0;
	ent->file.data_owned = true;
	ent->file.mtime = 0; //TODO: now
	return ent;
}

tm_fs_ent* tm_fs_raw_file_from_buf(const uint8_t* buf, unsigned length, unsigned mtime) {
	tm_fs_ent* ent = malloc(sizeof(tm_fs_ent));
	ent->type = VFS_TYPE_RAW_FILE;
	ent->parent = NULL;
	ent->file.length = length;
	ent->file.data = (uint8_t*) buf;
	ent->file.data_owned = false;
	ent->file.mtime = mtime;
	return ent;
}

void tm_fs_raw_file_destroy(tm_fs_raw_file* file) {
	if (file->data_owned) {
		free(file->data);
	}
	free(file);
}


void tm_fs_raw_file_read(tm_fs_raw_file* file, unsigned offset, unsigned length);
void tm_fs_raw_file_write();

int tm_fs_lookup(tm_fs_ent* /*&mut 'fs*/ dir, const char* /* & */ path, tm_fs_ent** out) {
	if (path == 0) {
		if (out) *out = dir;
		return 0;
	}

	if (out) *out = NULL;

	if (dir->type != VFS_TYPE_DIR) {
		return -ENOTDIR;
	}

	while (path[0] == '/') path++; // Strip leading slashes

	char* next = strchr(path, '/');

	if (path[0] == 0 || str_match_range(path, next, ".")) {
		return tm_fs_lookup(dir, next, out);
	} else if (str_match_range(path, next, "..")) {
		if (dir->parent) {
			return tm_fs_lookup(dir->parent, next, out);
		} else {
			return -ENOENT;
		}
	} else {
		for (unsigned i=0; i<dir->dir.num_entries; i++) {
			tm_fs_direntry* entry = &dir->dir.entries[i];
			if (str_match_range(path, next, entry->name)) {
				return tm_fs_lookup(entry->ent, next, out);
			}
		}

		if (next) {
			while (next[0] == '/') next++; // Strip trailing slashes
		}

		if (next == 0 || next[0] == 0) {
			// No more path components; this is the parent of the requested directory
			if (out) *out = dir;
		}
		return -ENOENT;
	}
}

int tm_fs_dir_create(tm_fs_ent* root, const char* path) {
	tm_fs_ent* ent = 0;
	int r = tm_fs_lookup(root, path, &ent);

	if (r == -ENOENT && ent != 0) {
		// Directory doesn't exist, but its parent does
		tm_fs_ent* dir = tm_fs_dir_create_entry();
		return tm_fs_dir_append(ent, path, dir);
	} else if (r == 0) {
		if (ent->type == VFS_TYPE_DIR) {  // like mkdir -p, but only for one level
			return 0;
		} else {
			return -EEXIST;
		}
	}
	return r;
}

int tm_fs_insert(tm_fs_ent* root, const char* path, tm_fs_ent* ent) {
	tm_fs_ent* parent = 0;
	int r = tm_fs_lookup(root, path, &parent);

	if (r == -ENOENT && parent != 0) {
		return tm_fs_dir_append(parent, path, ent);
	} else if (r == 0) {
		return -EEXIST;
	}

	return r;
}

int tm_fs_type (tm_fs_ent* root, const char* path) {
	tm_fs_ent* ent = 0;
	int r = tm_fs_lookup(root, path, &ent);

	if (r == 0) {
		return ent->type;
	}
	return r;
}

int tm_fs_open(tm_fs_file_handle* /* -> ~<'s> */ out, tm_fs_ent* /* &'s */ root, const char* /* & */ pathname, unsigned flags) {
	tm_fs_ent* ent = 0;
	int r = tm_fs_lookup(root, pathname, &ent);
	if ((flags & TM_CREAT) && r == -ENOENT && ent != 0) {
		tm_fs_ent* parent = ent;
		ent = tm_fs_raw_file_create();
		r = tm_fs_dir_append(parent, pathname, ent);
		if (r) {
			tm_fs_destroy(ent);
			return r;
		}
	} else if (r != 0) {
		return r;
	} else if (flags & TM_EXCL) {
		return -EEXIST;
	}

	switch (ent->type) {
		case VFS_TYPE_RAW_FILE:
			if (flags & TM_TRUNC) {
				free(ent->file.data);
				ent->file.length = 0;
				ent->file.data = 0;
			}
			out->ent = ent;
			out->position = 0;
			return 0;
		case VFS_TYPE_DIR:
			return -EISDIR;
		default:
			return -EINVAL;
	}
}

int tm_fs_close(tm_fs_file_handle* /* move */ handle) {
	handle->ent = 0;
	return 0;
}

int tm_fs_read (tm_fs_file_handle* fd, uint8_t *buf, size_t size, size_t* nread) {
	if (!fd->ent) return -EINVAL;
	switch (fd->ent->type) {
		case VFS_TYPE_RAW_FILE:
			if (fd->position + size > fd->ent->file.length) {
				size = fd->ent->file.length - fd->position;
			}
			memcpy(buf, fd->ent->file.data+fd->position, size);
			fd->position += size;
			*nread = size;
			return 0;
		default:
			return -EINVAL;
	}
}

int tm_fs_write (tm_fs_file_handle* fd, const uint8_t *buf, size_t size) {
	if (!fd->ent) return -EINVAL;
	switch (fd->ent->type) {
		case VFS_TYPE_RAW_FILE:
			if (!fd->ent->file.data_owned) {
				return -EROFS;
			}
			if (fd->position + size > fd->ent->file.length) {
				fd->ent->file.length = fd->position + size;
				fd->ent->file.data = realloc(fd->ent->file.data, fd->ent->file.length);
			}
			memcpy(fd->ent->file.data+fd->position, buf, size);
			fd->position += size;
			return 0;
		default:
			return -EINVAL;
	}
}

int tm_fs_readable (tm_fs_file_handle* fd) {
	if (!fd->ent) return 0;
		switch (fd->ent->type) {
		case VFS_TYPE_RAW_FILE:
			return 1;
		default:
			return 0;
	}
}

int tm_fs_seek(tm_fs_file_handle* fd, unsigned position) {
	if (!fd->ent) return 0;
	switch (fd->ent->type) {
		case VFS_TYPE_RAW_FILE:
			fd->position = (position > fd->ent->file.length) ? fd->ent->file.length : position;
			return fd->position;
		default:
			return 0;
	}
}

int tm_fs_truncate(tm_fs_file_handle* fd) {
	if (!fd->ent) return 0;
	switch (fd->ent->type) {
		case VFS_TYPE_RAW_FILE:
			fd->ent->file.data = realloc(fd->ent->file.data, fd->position);
			fd->ent->file.length = fd->position;
			return fd->position;
		default:
			return 0;
	}
}

unsigned tm_fs_length(tm_fs_file_handle* fd) {
	if (!fd->ent) return 0;
	switch (fd->ent->type) {
		case VFS_TYPE_RAW_FILE:
			return fd->ent->file.length;
		default:
			return 0;
	}
}

const uint8_t* tm_fs_contents(tm_fs_file_handle* fd) {
	if (!fd->ent) return 0;
	switch (fd->ent->type) {
		case VFS_TYPE_RAW_FILE:
			return fd->ent->file.data;
		default:
			return 0;
	}
}

static const char* tm_fs_basename (const char* pathname)
{
	return strrchr(pathname, '/') + 1;
}

int tm_fs_rename (tm_fs_ent* root, const char* oldname, const char* newname)
{
	int r = 0;

	// Lookup old file
	tm_fs_ent* oldent = 0;
	r = tm_fs_lookup(root, oldname, &oldent); 
	if (r != 0) {
		return r;
	}

	// Lookup and possibly new file location.
	tm_fs_ent* newdir = 0;
	r = tm_fs_lookup(root, newname, &newdir);
	if (r == 0) {
		tm_fs_ent* overwritten = newdir;
		newdir = overwritten->parent;
		tm_fs_destroy(overwritten);
	} else if (r == -ENOENT && newdir != 0) {
		// noop, folder exists
	} else {
		return -ENOENT;
	}

	tm_fs_dir_remove(oldent->parent, oldent);
	tm_fs_dir_append(newdir, tm_fs_basename(newname), oldent);
	return 0;
}

int tm_fs_dir_open(tm_fs_dir_handle* out, tm_fs_ent* root, const char* pathname) {
	tm_fs_ent* ent = 0;
	int r = tm_fs_lookup(root, pathname, &ent);
	if (r != 0) {
		return r;
	}

	switch (ent->type) {
		case VFS_TYPE_DIR:
			out->ent = ent;
			out->position = 0;
			return 0;
		default:
			return -ENOTDIR;
	}
}

int tm_fs_dir_close(tm_fs_dir_handle* handle) {
	handle->ent = 0;
	return 0;
}

int tm_fs_dir_read(tm_fs_dir_handle* fd, const char** out) {
	*out = NULL;
	if (!fd->ent) return -EINVAL;
	switch (fd->ent->type) {
		case VFS_TYPE_DIR:
			if (fd->position < fd->ent->dir.num_entries) {
				*out = fd->ent->dir.entries[fd->position].name;
				fd->position += 1;
			}
			return 0;
		default:
			return -EINVAL;
	}
}
