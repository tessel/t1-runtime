#include <utf8proc.h>
#include <assert.h>

#include "tm.h"

ssize_t tm_utf8_toupper (const uint8_t *buf, ssize_t buf_len, uint8_t **dstptr)
{
	// This is silly, don't do this.
	if (buf_len < 0) {
		buf_len = strlen((char*) buf);
	}

	uint8_t* dest = malloc(buf_len);
	uint8_t* dest_ptr = dest;
	const uint8_t* ptr = buf;
	int32_t c = 0;
	while (buf_len > 0) {
		ssize_t bytes_read = utf8proc_iterate(ptr, buf_len, &c);
		if (c == -1) {
			return -1;
		}
		ptr += bytes_read;
		buf_len -= bytes_read;

		int32_t c_case = utf8proc_get_property(c)->uppercase_mapping;
		ssize_t bytes_written = utf8proc_encode_char(c_case == -1 ? c : c_case, dest_ptr);
		assert(bytes_written == bytes_read);
		dest_ptr += bytes_written;
	}
	*dstptr = dest;
	return 0;
}

ssize_t tm_utf8_tolower (const uint8_t *buf, ssize_t buf_len, uint8_t **dstptr)
{
	// This is silly, don't do this.
	if (buf_len < 0) {
		buf_len = strlen((char*) buf);
	}

	uint8_t* dest = malloc(buf_len);
	uint8_t* dest_ptr = dest;
	const uint8_t* ptr = buf;
	int32_t c = 0;
	while (buf_len > 0) {
		ssize_t bytes_read = utf8proc_iterate(ptr, buf_len, &c);
		if (c == -1) {
			return -1;
		}
		ptr += bytes_read;
		buf_len -= bytes_read;

		int32_t c_case = utf8proc_get_property(c)->lowercase_mapping;
		ssize_t bytes_written = utf8proc_encode_char(c_case == -1 ? c : c_case, dest_ptr);
		assert(bytes_written == bytes_read);
		dest_ptr += bytes_written;
	}
	*dstptr = dest;
	return 0;
}