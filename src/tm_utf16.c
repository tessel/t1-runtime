#include <assert.h>

#include "tm.h"

// NOTE: Ideally these would deal with native uint16_t arrays, and have separate uint16_t<->uint8_t endian helper.
//       But it doesn't seem worth the extra pain and potential performance hit right now.

#define IS_BIG_ENDIAN 0     // TODO

size_t tm_str_to_utf16le (const uint8_t* buf, size_t buf_len, const uint8_t ** const dstptr) {
  uint16_t* utf16 = calloc(buf_len, 2);    // NOTE: we know utf16 will be this size or less
  size_t utf16_len = 0;
  
  size_t buf_pos = 0;
  while (buf_pos < buf_len) {
    uint32_t uchar;
    buf_pos += tm_utf8_decode(buf + buf_pos, buf_len - buf_pos, &uchar);
    assert(uchar != TM_UTF8_DECODE_ERROR);     // internal strings should never be malformed, 0xFFFD replacement increases length
    assert(uchar < 0x10000);                   // internal strings should only include BMP codepoints
    #if IS_BIG_ENDIAN
    utf16[utf16_len] = __builtin_bswap16((uint16_t) uchar);
    #else
    utf16[utf16_len] = (uint16_t) uchar;
    #endif
    utf16_len += 1;
  }
  *dstptr = (uint8_t*) utf16;
  return (utf16_len << 1) - 1;        // include only single null *byte* (for consistency with others)
}

size_t tm_str_from_utf16le (const uint8_t* _utf16, size_t _utf16_len, const uint8_t ** const dstptr) {
  const uint16_t* utf16 = (const uint16_t*) _utf16;
  size_t utf16_len = _utf16_len >> 1;
  
  uint8_t* buf = calloc(utf16_len, 3);      // each incoming codepoint could require up to 3 bytes to represent
  
  size_t buf_pos = 0;
  size_t utf16_pos = 0;
  while (utf16_pos < utf16_len) {
    uint16_t uchar = utf16[utf16_pos];
    buf_pos += tm_utf8_encode(buf + buf_pos, 3, uchar);
    utf16_pos += 1;
  }
  *dstptr = buf;
  return buf_pos;
}
