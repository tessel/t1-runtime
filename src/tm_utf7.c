#include <assert.h>

#include "tm.h"

size_t tm_str_to_ascii (const uint8_t* buf, size_t buf_len, const uint8_t ** const dstptr) {
  uint8_t* ascii_buf = malloc(buf_len);    // NOTE: we know ascii will be this size or less
  size_t ascii_len = 0;
  
  size_t buf_pos = 0;
  while (buf_pos < buf_len) {
    uint32_t uchar;
    buf_pos += tm_utf8_decode(buf + buf_pos, buf_len - buf_pos, &uchar);
    assert(uchar != TM_UTF8_DECODE_ERROR);     // internal strings should never be malformed, 0xFFFD replacement increases length
    assert(uchar < 0x10000);                   // internal strings should only include BMP codepoints
    ascii_buf[ascii_len] = (uint8_t) uchar & 0xFF;    // yes 0xFF, despite node.js doc insinuation!
    ascii_len += 1;
  }
  *dstptr = ascii_buf;
  return ascii_len;
}

size_t tm_str_from_ascii (const uint8_t* ascii_buf, size_t ascii_len, const uint8_t ** const dstptr) {
  uint8_t* buf = malloc(ascii_len);
  
  size_t pos = 0;
  while (pos < ascii_len) {
    buf[pos] = ascii_buf[pos] & 0x7F;
    ++pos;
  }
  *dstptr = buf;
  return pos;
}

size_t tm_str_to_binary (const uint8_t* buf, size_t buf_len, const uint8_t ** const dstptr) {
  uint8_t* binary_buf = malloc(buf_len);    // NOTE: we know binary will be this size or less
  size_t binary_len = 0;
  
  size_t buf_pos = 0;
  while (buf_pos < buf_len) {
    uint32_t uchar;
    buf_pos += tm_utf8_decode(buf + buf_pos, buf_len - buf_pos, &uchar);
    assert(uchar != TM_UTF8_DECODE_ERROR);     // internal strings should never be malformed, 0xFFFD replacement increases length
    assert(uchar < 0x10000);                   // internal strings should only include BMP codepoints
    binary_buf[binary_len] = (uint8_t) uchar & 0xFF;
    binary_len += 1;
  }
  *dstptr = binary_buf;
  return binary_len;
}

size_t tm_str_from_binary (const uint8_t* binary, size_t binary_len, const uint8_t ** const dstptr) {
  uint8_t* str = calloc(binary_len, 2);   // NOTE: size could at most double if every incoming byte is > 127
  
  size_t str_pos = 0;
  size_t binary_pos = 0;
  while (binary_pos < binary_len) {
    str_pos += tm_utf8_encode(str + str_pos, 2, binary[binary_pos]);
    binary_pos += 1;
  }
  *dstptr = str;
  return str_pos;
}
