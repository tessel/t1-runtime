#include <miniz.h>
#include <tm.h>
#include <errno.h>
#include <string.h>

#define MZ_MIN(a,b) (((a)<(b))?(a):(b))

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
  inflator->state = type == TM_GZIP ? TM_HEADER : TM_BODY;

  return 0;
}

int tm_inflate_write (tm_inflate_t _inflator, const uint8_t* in, size_t in_len, size_t* in_total, uint8_t* out, size_t out_len, size_t* out_total)
{
  _tm_inflate_t* inflator = (_tm_inflate_t*) _inflator;
  size_t in_read = in_len, out_written = lower_power_of_two(out_len);
  *in_total = 0;
  *out_total = 0;

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
  _tm_inflate_t* inflator = (_tm_inflate_t*) _inflator;
  size_t out_written = lower_power_of_two(out_len);
  *out_total = 0;

  if (inflator->state != TM_END) {
    return EPERM;
  }

  return 0;
}
