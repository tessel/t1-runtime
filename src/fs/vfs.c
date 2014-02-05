#include "vfs.h"

vfs_ent* /* ~ */ vfs_dir_create(bool names_owned) {
	vfs_ent* ent = malloc(sizeof(vfs_ent));
	ent->type = VFS_TYPE_DIR;
	ent->dir.num_entries = 0;
	ent->dir.names_owned = names_owned;
	ent->dir.entries = 0;
	ent->dir.parent = ent;
	return ent;
}

int vfs_dir_append(vfs_ent* dir, const char* name, vfs_ent* ent) {
	if (dir->type != VFS_TYPE_DIR) {
		return -ENOTDIR;
	}

	dir->dir.num_entries += 1;
	dir->dir.entries = realloc(dir->dir.entries, dir->dir.num_entries*sizeof(vfs_direntry));
	vfs_direntry* entry = &dir->dir.entries[dir->dir.num_entries - 1];
	if (dir->dir.names_owned) {
		entry->name = strdup(name);
	} else {
		entry->name = name;
	}
	entry->ent = ent;

	if (ent->type == VFS_TYPE_DIR) {
		ent->dir.parent = dir;
	}

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

				if (ent->dir.names_owned) {
					free((void*) entry->name);
				}

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
	ent->file.length = 0;
	ent->file.data = 0;
	ent->file.data_owned = true;
	ent->file.mtime = 0; //TODO: now
	return ent;
}

vfs_ent* vfs_raw_file_from_buf(const uint8_t* buf, unsigned length, unsigned mtime) {
	vfs_ent* ent = malloc(sizeof(vfs_ent));
	ent->type = VFS_TYPE_RAW_FILE;
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

bool str_match_range(const char* start, const char* end, const char* ref) {
	while (start != end && *start) {
		if (*start++ != *ref++) return false;
	}
	return *ref == 0;
}

int vfs_lookup(vfs_ent* /*&mut 'fs*/ dir, const char** /* & */ path, bool create, vfs_ent** out_parent_dir, vfs_ent** out) {
	if (dir->type != VFS_TYPE_DIR) {
		return -ENOTDIR;
	}

	while ((*path)[0] == '/') {
		// Strip leading slashes
		(*path)++;
	}

	if ((*path)[0] == 0) {
		// Trailing slash
		if (out_parent_dir) *out_parent_dir = dir->dir.parent;
		if (out) *out = dir;
	}

	char* next = strchr(*path, '/');

	if (str_match_range(*path, next, ".")) {
		*path = next;
		return vfs_lookup(dir, path, create, out_parent_dir, out);
	} else if (str_match_range(*path, next, "..")) {
		*path = next;
		return vfs_lookup(dir->dir.parent, path, create, out_parent_dir, out);
	} else {
		if (out_parent_dir) *out_parent_dir = dir;
		for (unsigned i=0; i<dir->dir.num_entries; i++) {
			vfs_direntry* entry = &dir->dir.entries[i];
			if (str_match_range(*path, next, entry->name)) {
				if (next == 0) {
					if (out) *out = entry->ent;
					return 0;
				} else {
					*path = next;
					return vfs_lookup(entry->ent, path, create, out_parent_dir, out);
				}
			}
		}

		if (create && next == 0) {
			if (out) *out = NULL;
			return 0;
		} else {
			return -ENOENT;
		}
	}
}

int vfs_mount_tar(vfs_dir* /*&mut*/ root, char* /* & */ path, uint8_t* /* &'fs */ tar, unsigned size);
int vfs_mount_fat(vfs_dir* /*&mut*/ root, char* /* & */ path, unsigned fatfs_drivenum);

int vfs_open(vfs_file_handle* /* -> ~<'s> */ out, vfs_dir* root, char* /* & */ pathname, unsigned flags);
int vfs_close(vfs_file_handle* /* move */ handle);
int vfs_read (vfs_file_handle* fd, uint8_t *buf, size_t size, size_t* nread);
int vfs_write (vfs_file_handle* fd, uint8_t *buf, size_t size, size_t* nread);