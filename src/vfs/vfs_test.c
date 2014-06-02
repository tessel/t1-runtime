// Copyright 2014 Technical Machine, Inc. See the COPYRIGHT
// file at the top-level directory of this distribution.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

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
	tm_fs_ent* dir = tm_fs_dir_create();

	tm_fs_ent* file_foo = tm_fs_raw_file_create();

	const char* data = "hello";
	tm_fs_ent* file_bar = tm_fs_raw_file_from_buf((uint8_t*)data, strlen(data), 0);

	tm_fs_ent* subdir = tm_fs_dir_create();

	assert(tm_fs_dir_append(dir, "foo", file_foo) == 0);
	assert(tm_fs_dir_append(dir, "subdir", subdir) == 0);
	assert(tm_fs_dir_append(subdir, "bar", file_bar) == 0);

	tm_fs_ent* t = 0;

	assert(tm_fs_lookup(dir, ".", &t) == 0);
	assert(t == dir);

	assert(tm_fs_lookup(dir, "foo", &t) == 0);
	assert(t == file_foo);

	assert(tm_fs_lookup(dir, "./foo", &t) == 0);
	assert(t == file_foo);

	assert(tm_fs_lookup(dir, "/subdir/bar", &t) == 0);
	assert(t == file_bar);

	assert(tm_fs_lookup(dir, ".", &t) == 0);
	assert(t == dir);

	assert(tm_fs_lookup(dir, "..", &t) == -ENOENT);
	assert(t == NULL);

	assert(tm_fs_lookup(dir, "asdf", &t) == -ENOENT);
	assert(t == dir);

	assert(tm_fs_lookup(dir, "/subdir/asdf", &t) == -ENOENT);
	assert(t == subdir);

	assert(tm_fs_lookup(dir, "/subdir/asdf/", &t) == -ENOENT);
	assert(t == subdir);

	assert(tm_fs_lookup(dir, "/subir/noexist/asdf", &t) == -ENOENT);
	assert(t == NULL);

	assert(tm_fs_lookup(dir, "/subdir/..", &t) == 0);
	assert(t == dir);

	assert(tm_fs_lookup(dir, "/subdir/../foo", &t) == 0);
	assert(t == file_foo);

	tm_fs_destroy(dir);
}

tm_fs_enttype tm_fs_get_type(tm_fs_ent* root, const char* path) {
	tm_fs_ent* t;
	if (tm_fs_lookup(root, path, &t) == 0){
		return t->type;
	} else {
		return VFS_TYPE_INVALID;
	}
}

void test_insert() {
	tm_fs_ent* dir = tm_fs_dir_create();

	assert(tm_fs_dir_create(dir, "/foo") == 0);
	assert(tm_fs_get_type(dir, "foo") == VFS_TYPE_DIR);

	assert(tm_fs_dir_create(dir, "/foo") == 0);

	assert(tm_fs_dir_create(dir, "/bar/") == 0);
	assert(tm_fs_get_type(dir, "/bar/") == VFS_TYPE_DIR);

	assert(tm_fs_get_type(dir, "foo") == VFS_TYPE_DIR);

	assert(tm_fs_dir_create(dir, "/a/b") == -ENOENT);

	assert(tm_fs_insert(dir, "/bar/test.txt", tm_fs_raw_file_create()) == 0);
	assert(tm_fs_get_type(dir, "/bar/test.txt") == VFS_TYPE_RAW_FILE);

	tm_fs_ent* f = tm_fs_raw_file_create();
	assert(tm_fs_insert(dir, "/bar/test.txt", f) == -EEXIST);
	assert(tm_fs_insert(dir, "/a/test.txt", f) == -ENOENT);
	free(f);

	tm_fs_destroy(dir);
}

void test_rw() {
	tm_fs_ent* dir = tm_fs_dir_create();
	tm_fs_file_handle fd;
	uint8_t buf[64];
	size_t nread;

	assert(tm_fs_open(&fd, dir, "/noexist.txt", 0) == -ENOENT);

	assert(tm_fs_open(&fd, dir, "/test.txt", TM_CREAT) == 0);
	assert(tm_fs_write(&fd, (const uint8_t*)"test foo bar\n", 13));
	assert(tm_fs_write(&fd, (const uint8_t*)"line 2\n", 7));
	assert(tm_fs_length(&fd) == 13+7);
	assert(memcmp((const char*)tm_fs_contents(&fd), "test foo bar\nline 2\n", tm_fs_length(&fd)) == 0);
	assert(tm_fs_close(&fd) == 0);

	assert(tm_fs_open(&fd, dir, "/test.txt", (TM_CREAT | TM_EXCL)) == -EEXIST);

	assert(tm_fs_open(&fd, dir, "/test.txt", 0) == 0);
	assert(tm_fs_write(&fd, (const uint8_t*)"overwritten.\n", 13));
	assert(tm_fs_read(&fd, buf, 4, &nread) == 0);
	assert(nread == 4);
	assert(memcmp((const char*)buf, "line", nread) == 0);
	assert(tm_fs_read(&fd, buf, 64, &nread) == 0);
	assert(nread == 3);
	assert(memcmp((const char*)buf, " 2\n", nread) == 0);
	assert(tm_fs_length(&fd) == 13+7);
	assert(memcmp((const char*)tm_fs_contents(&fd), "overwritten.\nline 2\n", tm_fs_length(&fd)) == 0);
	assert(tm_fs_close(&fd) == 0);

	assert(tm_fs_read(&fd, buf, 64, &nread) == -EINVAL);

	assert(tm_fs_open(&fd, dir, "/test.txt", TM_TRUNC) == 0);
	assert(tm_fs_length(&fd) == 0);
	assert(tm_fs_close(&fd) == 0);

	tm_fs_dir_handle dfd;
	const char* name;
	assert(tm_fs_dir_open(&dfd, dir, ".") == 0);
	assert(tm_fs_dir_read(&dfd, &name) == 0);
	assert(strcmp(name, "test.txt") == 0);
	assert(tm_fs_dir_read(&dfd, &name) == 0);
	assert(name == 0);
	assert(tm_fs_dir_close(&dfd) == 0);

	tm_fs_destroy(dir);
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

	tm_fs_ent* dir = tm_fs_dir_create();
	assert(tm_fs_mount_tar(dir, ".", buffer, size) == 0);

	tm_fs_ent* ent;
	assert(tm_fs_lookup(dir, "a.txt", &ent) == 0);
	assert(ent->type == VFS_TYPE_RAW_FILE);
	assert(ent->file.length == 5);
	assert(memcmp(ent->file.data, "abcd\n", 5) == 0);

	assert(tm_fs_lookup(dir, "d", &ent) == 0);
	assert(ent->type == VFS_TYPE_DIR);

	assert(tm_fs_lookup(dir, "d/index.js", &ent) == 0);
	assert(ent->type == VFS_TYPE_RAW_FILE);

	tm_fs_destroy(dir);
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
