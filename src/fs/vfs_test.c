//gcc -Wall -Werror -std=gnu99 -ggdb vfs.c vfs_tar.c vfs_test.c -o vfs && valgrind ./vfs

#include <assert.h>
#include "vfs.h"
#include <stdio.h>

bool str_match_range(const char* start, const char* end, const char* ref);

void test_str_match_range() {
	const char* path = "/foo/bar/baz";
	const char* next = strchr(path, '/');

	assert(str_match_range(path, next, "") == true);
	assert(str_match_range(path, next, "foo") == false);

	path = next+1; next = strchr(path, '/');

	assert(str_match_range(path, next, "") == false);
	assert(str_match_range(path, next, "foo") == true);
	assert(str_match_range(path, next, "foo/bar/baz") == false);

	path = next+1; next = strchr(path, '/');

	assert(str_match_range(path, next, "") == false);
	assert(str_match_range(path, next, "qwerty") == false);
	assert(str_match_range(path, next, "bar") == true);

	path = next+1; next = strchr(path, '/');

	assert(str_match_range(path, next, "") == false);
	assert(str_match_range(path, next, "qwerty") == false);
	assert(str_match_range(path, next, "baz") == true);

	assert(next == 0);
}

char* filename(const char* start);
void test_filename() {
	char *f = filename("asdf.txt");
	assert(strcmp(f, "asdf.txt") == 0);
	free(f);

	f = filename("/foo/bar/asdf.txt");
	assert(strcmp(f, "asdf.txt") == 0);
	free(f);

	f = filename("/foo/bar/");
	assert(strcmp(f, "bar") == 0);
	free(f);

	f = filename(".");
	assert(f == NULL);

	f = filename("..");
	assert(f == NULL);

	f = filename("/foo/bar/.");
	assert(f == NULL);

	f = filename("/foo/bar/..");
	assert(f == NULL);
}

void test_lookup() {
	vfs_ent* dir = vfs_dir_create();

	vfs_ent* file_foo = vfs_raw_file_create();

	const char* data = "hello";
	vfs_ent* file_bar = vfs_raw_file_from_buf((uint8_t*)data, strlen(data), 0);

	vfs_ent* subdir = vfs_dir_create();

	assert(vfs_dir_append(dir, "foo", file_foo) == 0);
	assert(vfs_dir_append(dir, "subdir", subdir) == 0);
	assert(vfs_dir_append(subdir, "bar", file_bar) == 0);

	vfs_ent* t = 0;

	assert(vfs_lookup(dir, "/subdir/bar", &t) == 0);
	assert(t == file_bar);

	assert(vfs_lookup(dir, ".", &t) == 0);
	assert(t == dir);

	assert(vfs_lookup(dir, "..", &t) == -ENOENT);
	assert(t == NULL);

	assert(vfs_lookup(dir, "asdf", &t) == -ENOENT);
	assert(t == dir);

	assert(vfs_lookup(dir, "/subdir/asdf", &t) == -ENOENT);
	assert(t == subdir);

	assert(vfs_lookup(dir, "/subdir/asdf/", &t) == -ENOENT);
	assert(t == subdir);

	assert(vfs_lookup(dir, "/subir/noexist/asdf", &t) == -ENOENT);
	assert(t == NULL);

	assert(vfs_lookup(dir, "/subdir/..", &t) == 0);
	assert(t == dir);

	assert(vfs_lookup(dir, "/subdir/../foo", &t) == 0);
	assert(t == file_foo);

	vfs_destroy(dir);
}

vfs_enttype vfs_get_type(vfs_ent* root, const char* path) {
	vfs_ent* t;
	if (vfs_lookup(root, path, &t) == 0){
		return t->type;
	} else {
		return VFS_TYPE_INVALID;
	}
}

void test_insert() {
	vfs_ent* dir = vfs_dir_create();

	assert(vfs_mkdir(dir, "/foo") == 0);
	assert(vfs_get_type(dir, "foo") == VFS_TYPE_DIR);

	assert(vfs_mkdir(dir, "/foo") == 0);

	assert(vfs_mkdir(dir, "/bar/") == 0);
	assert(vfs_get_type(dir, "/bar/") == VFS_TYPE_DIR);

	assert(vfs_get_type(dir, "foo") == VFS_TYPE_DIR);

	assert(vfs_mkdir(dir, "/a/b") == -ENOENT);

	assert(vfs_insert(dir, "/bar/test.txt", vfs_raw_file_create()) == 0);
	assert(vfs_get_type(dir, "/bar/test.txt") == VFS_TYPE_RAW_FILE);

	vfs_ent* f = vfs_raw_file_create();
	assert(vfs_insert(dir, "/bar/test.txt", f) == -EEXIST);
	assert(vfs_insert(dir, "/a/test.txt", f) == -ENOENT);
	free(f);

	vfs_destroy(dir);
}

void test_rw() {
	vfs_ent* dir = vfs_dir_create();
	vfs_file_handle fd;
	uint8_t buf[64];
	size_t nread;

	assert(vfs_open(&fd, dir, "/noexist.txt", 0) == -ENOENT);

	assert(vfs_open(&fd, dir, "/test.txt", VFS_O_CREAT) == 0);
	assert(vfs_write(&fd, (const uint8_t*)"test foo bar\n", 13));
	assert(vfs_write(&fd, (const uint8_t*)"line 2\n", 7));
	assert(vfs_length(&fd) == 13+7);
	assert(memcmp((const char*)vfs_contents(&fd), "test foo bar\nline 2\n", vfs_length(&fd)) == 0);
	assert(vfs_close(&fd) == 0);

	assert(vfs_open(&fd, dir, "/test.txt", 0) == 0);
	assert(vfs_write(&fd, (const uint8_t*)"overwritten.\n", 13));
	assert(vfs_read(&fd, buf, 4, &nread) == 0);
	assert(nread == 4);
	assert(memcmp((const char*)buf, "line", nread) == 0);
	assert(vfs_read(&fd, buf, 64, &nread) == 0);
	assert(nread == 3);
	assert(memcmp((const char*)buf, " 2\n", nread) == 0);
	assert(vfs_length(&fd) == 13+7);
	assert(memcmp((const char*)vfs_contents(&fd), "overwritten.\nline 2\n", vfs_length(&fd)) == 0);
	assert(vfs_close(&fd) == 0);

	assert(vfs_read(&fd, buf, 64, &nread) == -EINVAL);

	assert(vfs_open(&fd, dir, "/test.txt", VFS_O_TRUNC) == 0);
	assert(vfs_length(&fd) == 0);
	assert(vfs_close(&fd) == 0);

	vfs_destroy(dir);
}

void test_tar() {
	FILE *fp = fopen ("test.tar" , "rb");
	assert(fp);

	fseek(fp, 0L, SEEK_END);
	long size = ftell( fp );
	rewind(fp);

	uint8_t *buffer = malloc(size);
	fread(buffer, size, 1 , fp);

	fclose(fp);

	vfs_ent* dir = vfs_dir_create();
	assert(vfs_mount_tar(dir, ".", buffer, size) == 0);

	vfs_ent* ent;
	assert(vfs_lookup(dir, "a.txt", &ent) == 0);
	assert(ent->type == VFS_TYPE_RAW_FILE);
	assert(ent->file.length == 5);
	assert(memcmp(ent->file.data, "abcd\n", 5) == 0);

	assert(vfs_lookup(dir, "d", &ent) == 0);
	assert(ent->type == VFS_TYPE_DIR);

	assert(vfs_lookup(dir, "d/index.js", &ent) == 0);
	assert(ent->type == VFS_TYPE_RAW_FILE);

	vfs_destroy(dir);
	free(buffer);
}

int main() {
	test_str_match_range();
	test_filename();
	test_lookup();
	test_insert();
	test_rw();
	test_tar();
}
