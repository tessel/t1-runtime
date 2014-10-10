#include <utf8proc.h>

#include "tm.h"

uint32_t tm_str_codeat (const uint8_t* buf, size_t buf_len, size_t index)
{
	const uint8_t* ptr = buf;
	int32_t dst = 0;
  index += 2;
	while (index >= 2) {
		ssize_t bytes_read = utf8proc_iterate(ptr, buf_len, &dst);
		if (dst == -1) {
			return dst;
		}
		ptr += bytes_read;
		buf_len -= bytes_read;
		index -= dst & 0x10000 ? 2 : 1;
	}

	return index == 0
		? (dst - 0x10000) / 0x400 + 0xD800
		: dst > 0xFFFF
			? (dst - 0x10000) % 0x400 + 0xDC00
			: dst & 0xFFFF;
}

size_t tm_str_fromcode (uint32_t c, uint8_t* buf)
{
	return utf8proc_encode_char(c, buf);
}

// convert UCS-2 index to offset in CESU-8 string
size_t tm_str_lookup_JsToLua (const uint8_t* buf, size_t len, size_t ucs2_index, size_t* seq_len)
{
  const uint8_t* const orig_buf = buf;
  ssize_t bytes_read;
  size_t ucs2_position = 0;
	while (ucs2_position <= ucs2_index) {        // NOTE: we read _past_ ucs2_index to get seq_len
    if (len == 0) {
      bytes_read = 0;
      break;
    }
    int32_t uchar;
		bytes_read = utf8proc_iterate(buf, len, &uchar);
    if (uchar < 0) {      // NOTE: it seems colony-compiler is sanitizing, so (currently) this shouldn't happen
      // "replace" ptr[0]
      uchar = 0xFFFD;
      bytes_read = 1;
    }
		buf += bytes_read;
		len -= bytes_read;
    ucs2_position += (uchar > 0xFFFF) ? 2 : 1;
	}
  *seq_len = bytes_read;
	return (buf - bytes_read) - orig_buf;
}


// convert offset in UTF-8/CESU-8 string to UCS-2 index [converts lengths, really]
size_t tm_str_lookup_LuaToJs (const uint8_t* buf, size_t len)
{
  size_t ucs2_position = 0;
	while (len) {
    int32_t uchar;
		ssize_t bytes_read = utf8proc_iterate(buf, len, &uchar);
    if (uchar < 0) {
      // "convert" ptr[0] to noncharacter
      uchar = 0xFFFF;
      bytes_read = 1;
    }
		buf += bytes_read;
		len -= bytes_read;
    ucs2_position += (uchar > 0xFFFF) ? 2 : 1;
	}
	return ucs2_position;
}
