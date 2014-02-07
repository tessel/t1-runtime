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

vfs_ent* /* ~ */ vfs_dir_create() {
	vfs_ent* ent = malloc(sizeof(vfs_ent));
	ent->type = VFS_TYPE_DIR;
	ent->parent = 0;
	ent->dir.num_entries = 0;
	ent->dir.entries = 0;
	return ent;
}

int vfs_dir_append(vfs_ent* dir, const char* name, vfs_ent* ent) {
	if (dir->type != VFS_TYPE_DIR) {
		return -ENOTDIR;
	}

	char* fname = filename(name);
	if (!fname) {
		return -EINVAL;
	}

	dir->dir.num_entries += 1;
	dir->dir.entries = realloc(dir->dir.entries, dir->dir.num_entries*sizeof(vfs_direntry));
	vfs_direntry* entry = &dir->dir.entries[dir->dir.num_entries - 1];
	entry->name = fname;
	entry->ent = ent;
	ent->parent = dir;

	return 0;
}

void vfs_destroy(vfs_ent* /* ~ */ ent) {
	switch (ent->type) {
		case VFS_TYPE_RAW_FILE:
			if (ent->file.data_owned) {
				free(ent->file.data);
			}
			break;
		case VFS_TYPE_DIR:
			for (unsigned i=0; i<ent->dir.num_entries; i++) {
				vfs_direntry* entry = &ent->dir.entries[i];
				free((void*) entry->name);
				vfs_destroy(entry->ent);
			}
			free(ent->dir.entries);
			break;
		case VFS_TYPE_FAT_MOUNT:
			//TODO
			break;
		case VFS_TYPE_INVALID:
			break;
	}
	free(ent);
}

vfs_ent* vfs_raw_file_create() {
	vfs_ent* ent = malloc(sizeof(vfs_ent));
	ent->type = VFS_TYPE_RAW_FILE;
	ent->parent = NULL;
	ent->file.length = 0;
	ent->file.data = 0;
	ent->file.data_owned = true;
	ent->file.mtime = 0; //TODO: now
	return ent;
}

vfs_ent* vfs_raw_file_from_buf(const uint8_t* buf, unsigned length, unsigned mtime) {
	vfs_ent* ent = malloc(sizeof(vfs_ent));
	ent->type = VFS_TYPE_RAW_FILE;
	ent->parent = NULL;
	ent->file.length = length;
	ent->file.data = (uint8_t*) buf;
	ent->file.data_owned = false;
	ent->file.mtime = mtime;
	return ent;
}

void vfs_raw_file_destroy(vfs_raw_file* file) {
	if (file->data_owned) {
		free(file->data);
	}
	free(file);
}


void vfs_raw_file_read(vfs_raw_file* file, unsigned offset, unsigned length);
void vfs_raw_file_write();

int vfs_lookup(vfs_ent* /*&mut 'fs*/ dir, const char* /* & */ path, vfs_ent** out) {
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
		return vfs_lookup(dir, next, out);
	} else if (str_match_range(path, next, "..")) {
		if (dir->parent) {
			return vfs_lookup(dir->parent, next, out);
		} else {
			return -ENOENT;
		}
	} else {
		for (unsigned i=0; i<dir->dir.num_entries; i++) {
			vfs_direntry* entry = &dir->dir.entries[i];
			if (str_match_range(path, next, entry->name)) {
				return vfs_lookup(entry->ent, next, out);
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

int vfs_mkdir(vfs_ent* root, const char* path) {
	vfs_ent* ent = 0;
	int r = vfs_lookup(root, path, &ent);

	if (r == -ENOENT && ent != 0) {
		// Directory doesn't exist, but its parent does
		vfs_ent* dir = vfs_dir_create();
		return vfs_dir_append(ent, path, dir);
	} else if (r == 0) {
		if (ent->type == VFS_TYPE_DIR) {  // like mkdir -p, but only for one level
			return 0;
		} else {
			return -EEXIST;
		}
	}
	return r;
}

int vfs_insert(vfs_ent* root, const char* path, vfs_ent* ent) {
	vfs_ent* parent = 0;
	int r = vfs_lookup(root, path, &parent);

	if (r == -ENOENT && parent != 0) {
		return vfs_dir_append(parent, path, ent);
	} else if (r == 0) {
		return -EEXIST;
	}

	return r;
}

int vfs_open(vfs_file_handle* /* -> ~<'s> */ out, vfs_ent* /* &'s */ root, char* /* & */ pathname, unsigned flags) {
	vfs_ent* ent = 0;
	int r = vfs_lookup(root, pathname, &ent);
	if ((flags & VFS_O_CREAT) && r == -ENOENT && ent != 0) {
		vfs_ent* parent = ent;
		ent = vfs_raw_file_create();
		r = vfs_dir_append(parent, pathname, ent);
		if (r) {
			vfs_destroy(ent);
			return r;
		}
	} else if (r != 0) {
		return r;
	}

	switch (ent->type) {
		case VFS_TYPE_RAW_FILE:
			if (flags & VFS_O_TRUNC) {
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

int vfs_close(vfs_file_handle* /* move */ handle) {
	handle->ent = 0;
	return 0;
}

int vfs_read (vfs_file_handle* fd, uint8_t *buf, size_t size, size_t* nread) {
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

int vfs_write (vfs_file_handle* fd, const uint8_t *buf, size_t size) {
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
		default:
			return -EINVAL;
	}
}

unsigned vfs_length(vfs_file_handle* fd) {
	if (!fd->ent) return 0;
	switch (fd->ent->type) {
		case VFS_TYPE_RAW_FILE:
			return fd->ent->file.length;
		default:
			return 0;
	}
}

const uint8_t* vfs_contents(vfs_file_handle* fd) {
	if (!fd->ent) return 0;
	switch (fd->ent->type) {
		case VFS_TYPE_RAW_FILE:
			return fd->ent->file.data;
		default:
			return 0;
	}
}
