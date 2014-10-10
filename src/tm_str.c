#include <assert.h>

#include "tm.h"

uint32_t tm_str_codeat (const uint8_t* buf, size_t buf_len, size_t index)
{
	const uint8_t* ptr = buf;
	uint32_t dst = 0;
  index += 2;
	while (index >= 2) {
		size_t bytes_read = tm_utf8_decode(ptr, buf_len, &dst);
		assert(dst != TM_UTF8_DECODE_ERROR);      // internal strings should never be malformed
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
	return tm_utf8_encode(buf, 3, c);
}

// convert UCS-2 index to offset in CESU-8 string
size_t tm_str_lookup_JsToLua (const uint8_t* buf, size_t len, size_t ucs2_index, size_t* seq_len)
{
  const uint8_t* const orig_buf = buf;
  size_t bytes_read;
  size_t ucs2_position = 0;
	while (ucs2_position <= ucs2_index) {        // NOTE: we read _past_ ucs2_index to get seq_len
    if (len == 0) {
      bytes_read = 0;
      break;
    }
    uint32_t uchar;
		bytes_read = tm_utf8_decode(buf, len, &uchar);
    assert(uchar != TM_UTF8_DECODE_ERROR);      // internal strings should never be malformed
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
    uint32_t uchar;
		size_t bytes_read = tm_utf8_decode(buf, len, &uchar);
    assert(uchar != TM_UTF8_DECODE_ERROR);      // internal strings should never be malformed
		buf += bytes_read;
		len -= bytes_read;
    ucs2_position += (uchar > 0xFFFF) ? 2 : 1;
	}
	return ucs2_position;
}
