#include "tm.h"
#include <stdio.h>
#include <stdarg.h>

#ifdef COLONY_PC
#include <unistd.h>
void tm_log(char level, const char* string, unsigned length) {
	int r = write(0, string, length);
	(void) r;
}
#endif

void tm_logf(char level, const char* format, ...) {
	va_list args;
	va_start(args, format);
	char buf[256];
	int len = vsnprintf(buf, sizeof(buf), format, args);
	va_end (args);
	tm_log(level, buf, len);
}
