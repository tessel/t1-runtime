#include <miniz.h>
#include <tm.h>
#include <errno.h>
#include <string.h>

#define MZ_MIN(a,b) (((a)<(b))?(a):(b))

static void tm_buffer_write_uint32le (uint8_t *p, uint32_t n)
{
  p[0] = n >>  0;
  p[1] = n >>  8;
  p[2] = n >> 16;
  p[3] = n >> 24;
}

typedef struct _tm_deflate {
  tdefl_compressor c;
  uint32_t crc32;
} _tm_deflate_t;

int tm_deflate_alloc (tm_deflate_t* deflator)
{
  *deflator = (tm_deflate_t) calloc(1, sizeof(_tm_deflate_t));
  return 0;
}

int tm_deflate_start_gzip (tm_deflate_t _deflator, size_t level, uint8_t* out, size_t out_len, size_t* out_total)
{
  _tm_deflate_t* deflator = (_tm_deflate_t*) _deflator;
  size_t out_written = out_len;
  *out_total = 0;

  // The number of dictionary probes to use at each compression level (0-10). 0=implies fastest/minimal possible probing.
  static const mz_uint s_tdefl_num_probes[11] = { 0, 1, 6, 32,  16, 32, 128, 256,  512, 768, 1500 };

  tdefl_status status;

  // create tdefl() compatible flags (we have to compose the low-level flags ourselves, or use tdefl_create_comp_flags_from_zip_params() but that means MINIZ_NO_ZLIB_APIS can't be defined).
  mz_uint comp_flags = s_tdefl_num_probes[MZ_MIN(10, level)] | ((level <= 3) ? TDEFL_GREEDY_PARSING_FLAG : 0);
  if (!level)
    comp_flags |= TDEFL_FORCE_ALL_RAW_BLOCKS;

  // Initialize the low-level compressor.
  status = tdefl_init(&deflator->c, NULL, NULL, comp_flags);
  if (status != TDEFL_STATUS_OKAY) {
    return EPERM;
  }

  if (out_len - *out_total < 10) {
    return ENOSPC;
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

  deflator->crc32 = MZ_CRC32_INIT;

  return 0;
}

int tm_deflate_write (tm_deflate_t _deflator, const uint8_t* in, size_t in_len, size_t* in_total, uint8_t* out, size_t out_len, size_t* out_total)
{
  _tm_deflate_t* deflator = (_tm_deflate_t*) _deflator;
  size_t in_read = in_len, out_written = out_len;
  *in_total = 0;
  *out_total = 0;

  int status = tdefl_compress(&deflator->c, in, &in_read, out, &out_written, TDEFL_NO_FLUSH);
  *in_total += in_read;
  *out_total += out_written;

  deflator->crc32 = (uint32_t) mz_crc32(deflator->crc32, in, in_read);

  return status;
}

int tm_deflate_end_gzip (tm_deflate_t _deflator, uint8_t* out, size_t out_len, size_t* out_total)
{
  _tm_deflate_t* deflator = (_tm_deflate_t*) _deflator;
  size_t out_written = out_len;
  *out_total = 0;

  int status = tdefl_compress(&deflator->c, NULL, 0, &out[*out_total], &out_written, TDEFL_FINISH);
  *out_total += out_written;
  if (status == TDEFL_STATUS_OKAY) {
    return ENOSPC;
  } else if (status != TDEFL_STATUS_DONE) {
    return EPERM;
  }

  if (out_len - *out_total < 8) {
    return ENOSPC;
  }

  tm_buffer_write_uint32le(&out[*out_total + 0], deflator->crc32);
  tm_buffer_write_uint32le(&out[*out_total + 4], 0x0c + 1);
  *out_total += 8;

  return 0;
}
