#include <utf8proc.h>
#include <assert.h>

#include "tm.h"

ssize_t tm_utf8_char_encode (const uint32_t c, uint8_t* buf)
{
	return utf8proc_encode_char(c, buf);
}

inline int32_t tm_utf8_char_toupper (const uint32_t c)
{
	int32_t c_case = utf8proc_get_property(c)->uppercase_mapping;
	return c_case == -1 ? c : c_case;
}

ssize_t tm_utf8_str_toupper (const uint8_t *buf, ssize_t buf_len, uint8_t **dstptr)
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
			free(dest);
			return -1;
		}
		ptr += bytes_read;
		buf_len -= bytes_read;

		ssize_t bytes_written = utf8proc_encode_char(tm_utf8_char_toupper(c), dest_ptr);
		assert(bytes_written == bytes_read);
		dest_ptr += bytes_written;
	}
	*dstptr = dest;
	return 0;
}

inline int32_t tm_utf8_char_tolower (const uint32_t c)
{
	int32_t c_case = utf8proc_get_property(c)->lowercase_mapping;
	return c_case == -1 ? c : c_case;
}

ssize_t tm_utf8_str_tolower (const uint8_t *buf, ssize_t buf_len, uint8_t **dstptr)
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
			free(dest);
			return -1;
		}
		ptr += bytes_read;
		buf_len -= bytes_read;

		ssize_t bytes_written = utf8proc_encode_char(tm_utf8_char_tolower(c), dest_ptr);
		assert(bytes_written == bytes_read);
		dest_ptr += bytes_written;
	}
	*dstptr = dest;
	return 0;
}

#define IS_LEAD(uchar) (uchar > 0xD800 && uchar < 0xDC00)
#define IS_TRAIL(uchar) (uchar > 0xDC00 && uchar <= 0xDFFF)

size_t tm_str_to_utf8 (const uint8_t* buf, size_t buf_len, const uint8_t ** const dstptr) {
  uint8_t* utf8 = malloc(buf_len);    // NOTE: we know utf8 always same or shorter
  size_t utf8_len = 0;
  
  int32_t hchar = 0;    // stores half of surrogate pair
  ssize_t buf_pos = 0;
  while (buf_pos < buf_len) {
    int32_t uchar;
		buf_pos += utf8proc_iterate(buf + buf_pos, buf_len - buf_pos, &uchar);
    assert(uchar >= 0);     // internal strings should never be malformed, 0xFFFD replacement increases length
    // NOTE: this follows new behavior http://blog.nodejs.org/2014/06/16/openssl-and-breaking-utf-8-change/
    if (hchar) {
      if (IS_TRAIL(uchar)) {
        // proper case — combine lead+trail into non-surrogate
        uchar = hchar + (uchar & 0x03FF);
      } else {
        // emit (preceding) unpaired lead as unknown character
        utf8_len += utf8proc_encode_char(0xFFFD, utf8 + utf8_len);
      }
      hchar = 0;
    }
    if (IS_LEAD(uchar)) {
      // lead surrogate — don't emit, but store
      hchar = 0x010000 + ((uchar & 0x03FF) << 10);
    } else {
      utf8_len += utf8proc_encode_char(IS_TRAIL(uchar) ? 0xFFFD : uchar, utf8 + utf8_len);
    }
  }
  assert(!hchar);   // NOTE: we assume buf ends in '\0' to emit any mismatched lead surrogate
  *dstptr = utf8;
  return utf8_len;
}

size_t tm_str_from_utf8 (const uint8_t* buf, size_t buf_len, const uint8_t ** const dstptr) {
  // TODO: this is no-op stub, implement for realsies!
  *dstptr = buf;
  return buf_len;
}
