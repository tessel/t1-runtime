#include <miniz.h>
#include <tm.h>
#include <errno.h>
#include <string.h>

#define MZ_MIN(a,b) (((a)<(b))?(a):(b))

// full set of 64 zlib headers
// from https://groups.google.com/forum/#!msg/comp.compression/_y2Wwn_Vq_E/EymIVcQ52cEJ
// Common:
// 78 01, 78 5e, 78 9c, 78 da
// Rare:
// 08 1d, 08 5b, 08 99, 08 d7, 18 19, 18 57, 18 95, 18 d3,
// 28 15, 28 53, 28 91, 28 cf, 38 11, 38 4f, 38 8d, 38 cb,
// 48 0d, 48 4b, 48 89, 48 c7, 58 09, 58 47, 58 85, 58 c3,
// 68 05, 68 43, 68 81, 68 de
// Very rare:
// 08 3c, 08 7a, 08 b8, 08 f6, 18 38, 18 76, 18 b4, 18 f2,
// 28 34, 28 72, 28 b0, 28 ee, 38 30, 38 6e, 38 ac, 38 ea,
// 48 2c, 48 6a, 48 a8, 48 e6, 58 28, 58 66, 58 a4, 58 e2,
// 68 24, 68 62, 68 bf, 68 fd, 78 3f, 78 7d, 78 bb, 78 f9
#define IS_ZLIB_HEADER(a) (a == 30721 || a == 30814 || a == 30876 || a == 30938 || a == 2077 || a == 2139 || a == 2201 || a == 2263 || a == 6169 || a == 6231 || a == 6293 || a == 6355 || a == 10261 || a == 10323 || a == 10385 || a == 10447 || a == 14353 || a == 14415 || a == 14477 || a == 14539 || a == 18445 || a == 18507 || a == 18569 || a == 18631 || a == 22537 || a == 22599 || a == 22661 || a == 22723 || a == 26629 || a == 26691 || a == 26753 || a == 26846 || a == 2108 || a == 2170 || a == 2232 || a == 2294 || a == 6200 || a == 6262 || a == 6324 || a == 6386 || a == 10292 || a == 10354 || a == 10416 || a == 10478 || a == 14384 || a == 14446 || a == 14508 || a == 14570 || a == 18476 || a == 18538 || a == 18600 || a == 18662 || a == 22568 || a == 22630 || a == 22692 || a == 22754 || a == 26660 || a == 26722 || a == 26815 || a == 26877 || a == 30783 || a == 30845 || a == 30907 || a == 30969 )

static unsigned long lower_power_of_two(unsigned long v)
{
    v--;
    v |= v >> 1;
    v |= v >> 2;
    v |= v >> 4;
    v |= v >> 8;
    v |= v >> 16;
    v++;
    return v >> 1;
}

static void tm_buffer_write_uint32le (uint8_t *p, uint32_t n)
{
  p[0] = n >>  0;
  p[1] = n >>  8;
  p[2] = n >> 16;
  p[3] = n >> 24;
}

static uint32_t tm_buffer_read_uint32le (const uint8_t *p)
{
  return
    (p[3] << 24) |
    (p[2] << 16) |
    (p[1] <<  8) |
    (p[0] <<  0);
}


typedef struct _tm_deflate {
  tdefl_compressor c;
  uint8_t type;
  uint8_t state;
  uint32_t crc32;
  uint32_t length;
} _tm_deflate_t;

typedef struct _tm_inflate {
  tinfl_decompressor c;
  uint8_t type;
  uint8_t state;
  uint32_t crc32;
  uint32_t length;
} _tm_inflate_t;

enum {
  TM_UNZIP_CHECK,
  TM_HEADER,
  TM_BODY,
  TM_TRAILER,
  TM_END
} tm_flate_state_t;


/**
 * Deflate
 */

size_t tm_deflate_alloc_size ()
{
  return sizeof(_tm_deflate_t);
}

int tm_deflate_alloc (tm_deflate_t* deflator)
{
  *deflator = (tm_deflate_t) calloc(1, tm_deflate_alloc_size());
  return 0;
}

int tm_deflate_start (tm_deflate_t _deflator, uint8_t type, size_t level)
{
  _tm_deflate_t* deflator = (_tm_deflate_t*) _deflator;

  // The number of dictionary probes to use at each compression level (0-10). 0=implies fastest/minimal possible probing.
  static const mz_uint s_tdefl_num_probes[11] = { 0, 1, 6, 32,  16, 32, 128, 256,  512, 768, 1500 };

  tdefl_status status;

  // create tdefl() compatible flags (we have to compose the low-level flags ourselves, or use tdefl_create_comp_flags_from_zip_params() but that means MINIZ_NO_ZLIB_APIS can't be defined).
  mz_uint comp_flags = s_tdefl_num_probes[MZ_MIN(10, level)] | ((level <= 3) ? TDEFL_GREEDY_PARSING_FLAG : 0) | (type == TM_ZLIB ? TDEFL_WRITE_ZLIB_HEADER : 0);
  if (!level)
    comp_flags |= TDEFL_FORCE_ALL_RAW_BLOCKS;

  // Initialize the low-level compressor.
  status = tdefl_init(&deflator->c, NULL, NULL, comp_flags);
  if (status != TDEFL_STATUS_OKAY) {
    return EPERM;
  }

  deflator->type = type;
  deflator->state = type == TM_GZIP ? TM_HEADER : TM_BODY;
  deflator->crc32 = MZ_CRC32_INIT;
  deflator->length = 0;

  return 0;
}

int tm_deflate_write (tm_deflate_t _deflator, const uint8_t* in, size_t in_len, size_t* in_total, uint8_t* out, size_t out_len, size_t* out_total)
{
  _tm_deflate_t* deflator = (_tm_deflate_t*) _deflator;
  size_t in_read = in_len, out_written = out_len;
  *in_total = 0;
  *out_total = 0;

  if (deflator->state == TM_HEADER && deflator->type == TM_GZIP) {
    // Minimum chunk value is 10 bytes
    if (in_len < 10) {
      return EINVAL;
    }

    uint8_t hdr[10] = {
      0x1F, 0x8B,	/* magic */
      8,		/* z method */
      0,		/* flags */
      0,0,0,0,	/* mtime */
      0,		/* xfl */
      0xFF,		/* OS */
    };

    memcpy(out, hdr, 10);
    out_written = 10;
    *out_total += out_written;

    deflator->state = TM_BODY;
  }

  if (deflator->state == TM_BODY) {
    int status = tdefl_compress(&deflator->c, in, &in_read, out, &out_written, TDEFL_NO_FLUSH);
    *in_total += in_read;
    *out_total += out_written;

    if (deflator->type == TM_GZIP) {
      deflator->crc32 = (uint32_t) mz_crc32(deflator->crc32, in, in_read);
    }
    deflator->length += in_read;

    return status;
  }

  return EPERM;
}

int tm_deflate_end (tm_deflate_t _deflator, uint8_t* out, size_t out_len, size_t* out_total)
{
  _tm_deflate_t* deflator = (_tm_deflate_t*) _deflator;
  size_t out_written = out_len, in_read = 0;
  *out_total = 0;

  if (deflator->state == TM_BODY) {
    int status = tdefl_compress(&deflator->c, NULL, &in_read, &out[*out_total], &out_written, TDEFL_FINISH);
    *out_total += out_written;
    if (status == TDEFL_STATUS_OKAY) {
      return ENOSPC;
    } else if (status != TDEFL_STATUS_DONE) {
      return EPERM;
    }

    deflator->state = deflator->type == TM_GZIP ? TM_TRAILER : TM_END;
  }

  if (deflator->state == TM_TRAILER) {
    if (out_len - *out_total < 8) {
      return ENOSPC;
    }

    tm_buffer_write_uint32le(&out[*out_total + 0], deflator->crc32);
    tm_buffer_write_uint32le(&out[*out_total + 4], deflator->length);
    *out_total += 8;

    deflator->state = TM_END;
  }

  return deflator->state == TM_END ? 0 : EPERM;
}


/**
 * Inflate
 */

size_t tm_inflate_alloc_size ()
{
  return sizeof(_tm_inflate_t);
}

int tm_inflate_alloc (tm_inflate_t* inflate)
{
  *inflate = (tm_inflate_t) calloc(1, tm_inflate_alloc_size());
  return 0;
}

int tm_inflate_start (tm_inflate_t _inflator, uint8_t type)
{
  _tm_inflate_t* inflator = (_tm_inflate_t*) _inflator;

  // Initialize the low-level compressor.
  tinfl_init(&inflator->c);

  inflator->type = type;
  inflator->crc32 = MZ_CRC32_INIT;
  inflator->length = 0;

  // state can be gzip, zlib, or unzip which needs to read tm_inflate_write in order to figure out which
  if (type == TM_GZIP) {
    inflator->state = TM_HEADER;
  } else if (type == TM_UNZIP) {
    inflator->state = TM_UNZIP_CHECK;
  } else {
    inflator->state = TM_BODY;
  }

  return 0;
}

int tm_inflate_write (tm_inflate_t _inflator, const uint8_t* in, size_t in_len, size_t* in_total, uint8_t* out, size_t out_len, size_t* out_total)
{
  _tm_inflate_t* inflator = (_tm_inflate_t*) _inflator;
  size_t in_read = in_len, out_written = lower_power_of_two(out_len);
  *in_total = 0;
  *out_total = 0;

  // if the state is TM_UNZIP check to see if the filtype is a gzip
  if (inflator->state == TM_UNZIP_CHECK && inflator->type == TM_UNZIP) {
    if (in_len >= 10) {
      // check for the magic number, 0x1F, 0x8B
      if (in[0] == 0x1F && in[1] == 0x8B) {
        inflator->state = TM_HEADER;
        inflator->type = TM_GZIP;
      } else if (IS_ZLIB_HEADER( (in[0] << 8) + in[1] )){ // check for zlib magic numbers
        inflator->state = TM_BODY;
        inflator->type = TM_ZLIB;
      } else {
        return EINVAL;
      }
    } else if (in_len >= 2 && IS_ZLIB_HEADER( (in[0] << 8) + in[1] )) {
      // assume it's not a gzip file
      inflator->state = TM_BODY;
      inflator->type = TM_ZLIB;
    } else {
      return EINVAL;
    }
  }

  if (inflator->state == TM_HEADER && inflator->type == TM_GZIP) {
    // Minimum chunk value is 10 bytes
    if (in_len < 10) {
      return EINVAL;
    }

    in = &in[10];
    in_read -= 10;
    *in_total += 10;

    *out_total = 0;

    inflator->state = TM_BODY;
  }

  if (inflator->state == TM_TRAILER && inflator->type == TM_GZIP) {
    // Minimum chunk value is 8 bytes
    if (in_len < 8) {
      return EINVAL;
    }

    // Checks crc32.
    uint32_t crc = tm_buffer_read_uint32le(&in[0]);
    if (crc != inflator->crc32) {
      return EINVAL;
    }

    // Checks length.
    uint32_t length = tm_buffer_read_uint32le(&in[4]);
    if (length != inflator->length) {
      return EINVAL;
    }

    *in_total += 8;
    *out_total += 0;

    inflator->state = TM_END;

    return 0;
  }

  if (inflator->state == TM_BODY) {
    int status = tinfl_decompress(&inflator->c, in, &in_read, out, out, &out_written, TINFL_FLAG_HAS_MORE_INPUT | (inflator->type == TM_ZLIB ? TINFL_FLAG_PARSE_ZLIB_HEADER : 0));
    *in_total += in_read;
    *out_total += out_written;

    if (status == -1) {
      printf("okay %d\n", status);
    }

    if (inflator->type == TM_GZIP) {
      inflator->crc32 = (uint32_t) mz_crc32(inflator->crc32, out, out_written);
    }
    inflator->length += out_written;

    if (status == TINFL_STATUS_DONE) {
      inflator->state = inflator->type == TM_GZIP ? TM_TRAILER : TM_END;
    } else if (status > 0) {
      status = 0;
    }

    return -status;
  }

  return -1;
}

int tm_inflate_end (tm_inflate_t _inflator, uint8_t* out, size_t out_len, size_t* out_total)
{
  (void) out;
  (void) out_len;

  _tm_inflate_t* inflator = (_tm_inflate_t*) _inflator;
  *out_total = 0;

  if (inflator->state != TM_END) {
    return EPERM;
  }

  return 0;
}
