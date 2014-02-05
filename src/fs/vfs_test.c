//gcc -Wall -Werror -std=gnu99 -ggdb vfs.c vfs_test.c -o vfs; valgrind ./vfs

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
	vfs_ent* p = 0;
	const char* path = "/subdir/bar";

	assert(vfs_lookup(dir, &path, false, &p, &t) == 0);
	assert(strcmp(path, "bar") == 0);
	assert(p == subdir);
	assert(t == file_bar);

	path = "asdf";
	assert(vfs_lookup(dir, &path, false, &p, &t) == -ENOENT);
	path = "asdf";
	assert(vfs_lookup(dir, &path, true , &p, &t) == 0);
	assert(strcmp(path, "asdf") == 0);
	assert(p == dir);
	assert(t == 0);

	vfs_destroy(dir);
}

int main() {
	test_str_match_range();
	test_dir();
}