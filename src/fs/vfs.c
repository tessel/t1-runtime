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

int vfs_mount_tar(vfs_dir* /*&mut*/ root, char* /* & */ path, uint8_t* /* &'fs */ tar, unsigned size);
int vfs_mount_fat(vfs_dir* /*&mut*/ root, char* /* & */ path, unsigned fatfs_drivenum);

int vfs_open(vfs_file_handle* /* -> ~<'s> */ out, vfs_dir* root, char* /* & */ pathname, unsigned flags);
int vfs_close(vfs_file_handle* /* move */ handle);
int vfs_read (vfs_file_handle* fd, uint8_t *buf, size_t size, size_t* nread);
int vfs_write (vfs_file_handle* fd, uint8_t *buf, size_t size, size_t* nread);