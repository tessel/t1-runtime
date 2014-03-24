#include <utf8proc.h>

#include "tm.h"

size_t tm_ucs2_length (const uint8_t* buf, ssize_t buf_len)
{
	// This is silly, don't do this.
	if (buf_len < 0) {
		buf_len = strlen((char*) buf);
	}

	const uint8_t* ptr = buf;
	uint8_t truelen = 0;
	int32_t dst = 0;
	for (;;) {
		ssize_t bytes_read = utf8proc_iterate(ptr, buf_len, &dst);
		if (dst == -1) {
			break;
		}
		ptr += bytes_read;
		buf_len -= bytes_read;
		truelen += dst & 0x10000 ? 2 : 1;
	}
	return truelen;
}

int32_t tm_ucs2_charat (const uint8_t* buf, ssize_t buf_len, ssize_t index)
{
	// This is silly, don't do this.
	if (buf_len < 0) {
		buf_len = strlen((char*) buf);
	}

	const uint8_t* ptr = buf;
	int32_t dst = 0;
	while (index >= 0) {
		ssize_t bytes_read = utf8proc_iterate(ptr, buf_len, &dst);
		if (dst == -1) {
			return dst;
		}
		ptr += bytes_read;
		buf_len -= bytes_read;
		index -= dst & 0x10000 ? 2 : 1;
	}

	return index == -2
		? (dst - 0x10000) / 0x400 + 0xD800
		: dst > 0xFFFF
			? (dst - 0x10000) % 0x400 + 0xDC00
			: dst & 0xFFFF;
}