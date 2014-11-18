#include <assert.h>

#include "tm.h"

size_t tm_utf8_decode(const uint8_t* buf, size_t buf_len, uint32_t* uc) {
  #define EXPECTSONE (buf[0] & 0x80 && buf[0] & (0x80 >> 1))      // proper lead byte of sequence
  #define EXPECTS(n) (buf[0] & (0x80 >> n))                       // sequence of at least n bytes
  #define CONTAINS(n) (buf_len > n && (buf[n] & 0xC0) == 0x80)    // valid continuation byte at n
  if (buf_len > 0) {
    if (EXPECTSONE) { if (CONTAINS(1)) {
        if (EXPECTS(2)) { if (CONTAINS(2)) {
            if (EXPECTS(3)) { if (CONTAINS(3)) {
                if (EXPECTS(4)) {
                  // unexpectedly long sequence for a Unicode character, fall down to below
                } else {
                  *uc = ((buf[0] & 0x07) << 18) | ((buf[1] & 0x3F) << 12) | ((buf[2] & 0x3F) << 6) | (buf[3] & 0x3F);
                  return 4;
                }
              }
            } else {
              *uc = ((buf[0] & 0x0F) << 12) | ((buf[1] & 0x3F) << 6) | (buf[2] & 0x3F);
              return 3;
            }
          }
        } else {
          *uc = ((buf[0] & 0x1F) << 6) | (buf[1] & 0x3F);
          return 2;
        }
      }
    } else if (buf[0] < 0x80) {
      *uc = buf[0];
      return 1;
    }
  }
  *uc = TM_UTF8_DECODE_ERROR;
  return 0;
}

inline size_t tm_utf8_encode(uint8_t* buf, size_t buf_len, uint32_t uc) {
  if (uc < 0x80 && buf_len > 0) {
    buf[0] = uc;
    return 1;
  } else if (uc < 0x800 && buf_len > 1) {
    buf[0] = 0xC0 + (uc >> 6);
    buf[1] = 0x80 + (uc & 0x3F);
    return 2;
  } else if (uc < 0x10000 && buf_len > 2) {
    buf[0] = 0xE0 + (uc >> 12);
    buf[1] = 0x80 + ((uc >> 6) & 0x3F);
    buf[2] = 0x80 + (uc & 0x3F);
    return 3;
  } else if (uc < 0x110000 && buf_len > 3) {
    buf[0] = 0xF0 + (uc >> 18);
    buf[1] = 0x80 + ((uc >> 12) & 0x3F);
    buf[2] = 0x80 + ((uc >> 6) & 0x3F);
    buf[3] = 0x80 + (uc & 0x3F);
    return 4;
  } else {
    return 0;
  }
}

#define IS_LEAD(uchar) (uchar > 0xD800 && uchar < 0xDC00)
#define IS_TRAIL(uchar) (uchar > 0xDC00 && uchar <= 0xDFFF)

size_t tm_str_to_utf8 (const uint8_t* buf, size_t buf_len, const uint8_t ** const dstptr) {
  uint8_t* utf8 = malloc(buf_len);    // NOTE: we know utf8 always same or shorter
  size_t utf8_len = 0;
  
  int32_t hchar = 0;    // stores half of surrogate pair
  size_t buf_pos = 0;
  while (buf_pos < buf_len) {
    uint32_t uchar;
    buf_pos += tm_utf8_decode(buf + buf_pos, buf_len - buf_pos, &uchar);
    assert(uchar != TM_UTF8_DECODE_ERROR);     // internal strings should never be malformed, 0xFFFD replacement increases length
    // NOTE: this follows new behavior http://blog.nodejs.org/2014/06/16/openssl-and-breaking-utf-8-change/
    if (hchar) {
      if (IS_TRAIL(uchar)) {
        // proper case — combine lead+trail into non-surrogate
        uchar = hchar + (uchar & 0x03FF);
      } else {
        // emit (preceding) unpaired lead as unknown character
        utf8_len += tm_utf8_encode(utf8 + utf8_len, 3, 0xFFFD);
      }
      hchar = 0;
    }
    if (IS_LEAD(uchar)) {
      // lead surrogate — don't emit, but store
      hchar = 0x010000 + ((uchar & 0x03FF) << 10);
    } else {
      utf8_len += tm_utf8_encode(utf8 + utf8_len, 4, IS_TRAIL(uchar) ? 0xFFFD : uchar);
    }
  }
  assert(!hchar);   // NOTE: we assume buf ends in '\0' to emit any mismatched lead surrogate
  *dstptr = utf8;
  return utf8_len;
}

size_t tm_str_from_utf8 (const uint8_t* utf8, size_t utf8_len, const uint8_t ** const dstptr) {
  size_t buf_len = utf8_len;
  // TODO: increase buf_len to fit actual split pairs (4 bytes become 6) and replaced non-characters (3 bytes per byte in bad sequence)
  buf_len += utf8_len / 2 + 6;    // HACK: this is just a glorified/dynamic fudge factor
  // ugh, test/suite/crypto.js does toString on a 4K buffer of random bytes …PLS TO ADD MOAR FUDGERS!!1!
  buf_len += utf8_len;
  uint8_t* buf = malloc(buf_len);
  
  size_t buf_pos = 0;
  size_t utf8_pos = 0;
  while (utf8_pos < utf8_len) {
    assert(buf_pos + 6 < buf_len);        // bail if fudge factor was insufficiently generous
    uint32_t uchar;
    size_t bytes_read = tm_utf8_decode(utf8 + utf8_pos, utf8_len - utf8_pos, &uchar);
    if (uchar == TM_UTF8_DECODE_ERROR) {
      bytes_read = 1;
      uchar = 0xFFFD;
    }
    if (bytes_read < 4) {
      buf_pos += tm_utf8_encode(buf + buf_pos, 3, uchar);
    } else {
      uchar -= 0x010000;
      buf_pos += tm_utf8_encode(buf + buf_pos, 3, 0xD800 + (uchar >> 10));
      buf_pos += tm_utf8_encode(buf + buf_pos, 3, 0xDC00 + (uchar & 0x03FF));
    }
    utf8_pos += bytes_read;
  }
  *dstptr = buf;
  return buf_pos;
}
