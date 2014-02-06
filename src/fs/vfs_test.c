//gcc -Wall -Werror -std=gnu99 -ggdb vfs.c vfs_test.c -o vfs && valgrind ./vfs

#include <assert.h>
#include "vfs.h"

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

void test_dir() {
	vfs_ent* dir = vfs_dir_create(true);

	vfs_ent* file_foo = vfs_raw_file_create();

	const char* data = "hello";
	vfs_ent* file_bar = vfs_raw_file_from_buf((uint8_t*)data, strlen(data), 0);

	vfs_ent* subdir = vfs_dir_create(true);

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

	assert(vfs_lookup(dir, "/subir/noexist/asdf", &t) == -ENOENT);
	assert(t == NULL);

	assert(vfs_lookup(dir, "/subdir/..", &t) == 0);
	assert(t == dir);

	assert(vfs_lookup(dir, "/subdir/../foo", &t) == 0);
	assert(t == file_foo);

	vfs_destroy(dir);
}

int main() {
	test_str_match_range();
	test_dir();
}