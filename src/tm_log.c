// Copyright 2014 Technical Machine, Inc. See the COPYRIGHT
// file at the top-level directory of this distribution.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

#include "tm.h"
#include <stdio.h>
#include <stdarg.h>

#ifdef COLONY_PC
#include <unistd.h>
void tm_log(char level, const char* string, unsigned length) {
	char linebreak = '\n';
	if (level == 30) {
		// raw stdout
		(void) fwrite(string, 1, length, stdout);
	} else if (level == 31) {
		// raw stderr
		(void) fwrite(string, 1, length, stderr);
	} else if (level != 13) {
		int r = fwrite(string, 1, length, stdout);
		r = fwrite(&linebreak, 1, 1, stdout);
		(void) r;
	} else {
		int r = fwrite(string, 1, length, stderr);
		r = fwrite(&linebreak, 1, 1, stderr);
		(void) r;
	}
}
#endif

#define BUF_SIZE 256

void tm_logf(char level, const char* format, ...) {
	va_list args;
	va_start(args, format);
	char buf[BUF_SIZE];
	int len = vsnprintf(buf, sizeof(buf), format, args);
	if (len > BUF_SIZE) len = BUF_SIZE;
	va_end (args);
	tm_log(level, buf, len);
}
