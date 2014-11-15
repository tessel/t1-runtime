#include <assert.h>

#include "tm.h"


size_t _tm_str_to_8bit (const uint8_t* buf, size_t buf_len, const uint8_t ** const dstptr, uint8_t mask) {
  uint8_t* ascii_buf = malloc(buf_len);    // NOTE: we know ascii will be this size or less
  size_t ascii_len = 0;
  
  size_t buf_pos = 0;
  while (buf_pos < buf_len) {
    uint32_t uchar;
    buf_pos += tm_utf8_decode(buf + buf_pos, buf_len - buf_pos, &uchar);
    assert(uchar != TM_UTF8_DECODE_ERROR);     // internal strings should never be malformed, 0xFFFD replacement increases length
    assert(uchar < 0x10000);                   // internal strings should only include BMP codepoints
    ascii_buf[ascii_len] = (uint8_t) uchar & mask;
    printf("%x @ %lu <%lu\n", uchar, ascii_len, buf_pos);
    ascii_len += 1;
  }
  *dstptr = ascii_buf;
  return ascii_len;
}

size_t _tm_str_from_8bit (const uint8_t* ascii_buf, size_t ascii_len, const uint8_t ** const dstptr, uint8_t mask) {
  uint8_t* buf = malloc(ascii_len);
  
  size_t pos = 0;
  while (pos < ascii_len) {
    buf[pos] = ascii_buf[pos] & mask;
    ++pos;
  }
  *dstptr = buf;
  return pos;
}
