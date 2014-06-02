// Copyright 2014 Technical Machine, Inc. See the COPYRIGHT
// file at the top-level directory of this distribution.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

#include "tm.h"
#include "order32.h"

/*
#define READ_BUFFER(N, T) static int N (lua_State *L) \
  { \
    uint8_t *ud = (uint8_t *) lua_touserdata(L, 1); \
    size_t index = (size_t) lua_tonumber(L, 2); \
    uint8_t *a = &ud[index]; \
    lua_pushnumber(L, T); \
    return 1; \
  }

#define TO_16(a, b) ((a << 8) | b)
#define TO_32(a, b, c, d) ((a << 24) | (b << 16) | (c << 8) | d)

#define WRITE_BUFFER(N, T) static int N (lua_State *L) \
{ \
  uint8_t *ud = (uint8_t *) lua_touserdata(L, 1); \
  size_t index = (size_t) lua_tonumber(L, 2); \
  int32_t value = (int32_t) lua_tonumber(L, 3); \
  uint8_t *a = &ud[index]; \
  T; \
  return 0; \
}

#define WRITE_8(V, a) a = V & 0xFF;
#define WRITE_16(V, a, b) a = (V >> 8) & 0xFF; b = V & 0xFF;
#define WRITE_32(V, a, b, c, d) a = (V >> 24) & 0xFF; b = (V >> 16) & 0xFF; c = (V >> 8) & 0xFF; d = V & 0xFF;

READ_BUFFER(l_tm_buffer_read_uint8, a[0]);
READ_BUFFER(l_tm_buffer_read_uint16le, TO_16(a[1], a[0]));
READ_BUFFER(l_tm_buffer_read_uint16be, TO_16(a[0], a[1]));
READ_BUFFER(l_tm_buffer_read_uint32le, TO_32(a[3], a[2], a[1], a[0]));
READ_BUFFER(l_tm_buffer_read_uint32be, TO_32(a[0], a[1], a[2], a[3]));
READ_BUFFER(l_tm_buffer_read_int8, (int8_t) a[0]);
READ_BUFFER(l_tm_buffer_read_int16le, (int16_t) TO_16(a[1], a[0]));
READ_BUFFER(l_tm_buffer_read_int16be, (int16_t) TO_16(a[0], a[1]));
READ_BUFFER(l_tm_buffer_read_int32le, (int32_t) TO_32(a[3], a[2], a[1], a[0]));
READ_BUFFER(l_tm_buffer_read_int32be, (int32_t) TO_32(a[0], a[1], a[2], a[3]));

WRITE_BUFFER(l_tm_buffer_write_uint8, WRITE_8(value, a[0]));
WRITE_BUFFER(l_tm_buffer_write_uint16le, WRITE_16(value, a[1], a[0]));
WRITE_BUFFER(l_tm_buffer_write_uint16be, WRITE_16(value, a[0], a[1]));
WRITE_BUFFER(l_tm_buffer_write_uint32le, WRITE_32(value, a[3], a[2], a[1], a[0]));
WRITE_BUFFER(l_tm_buffer_write_uint32be, WRITE_32(value, a[0], a[1], a[2], a[3]));
WRITE_BUFFER(l_tm_buffer_write_int8, WRITE_8((int8_t) value, a[0]));
WRITE_BUFFER(l_tm_buffer_write_int16le, WRITE_16((int16_t) value, a[1], a[0]));
WRITE_BUFFER(l_tm_buffer_write_int16be, WRITE_16((int16_t) value, a[0], a[1]));
WRITE_BUFFER(l_tm_buffer_write_int32le, WRITE_32((int32_t) value, a[3], a[2], a[1], a[0]));
WRITE_BUFFER(l_tm_buffer_write_int32be, WRITE_32((int32_t) value, a[0], a[1], a[2], a[3]));

static int l_tm_buffer_read_float (lua_State *L)
{
  uint8_t *ud = (uint8_t *) lua_touserdata(L, 1);
  size_t index = (size_t) lua_tonumber(L, 2);
  uint8_t le = (int) lua_tonumber(L, 3);
  
  uint8_t *a = &ud[index];
  float out = 0;
  char* temp = (char*) &out;
  if (le ^ (O32_HOST_ORDER == O32_BIG_ENDIAN)) {
    temp[0] = a[0]; temp[1] = a[1]; temp[2] = a[2]; temp[3] = a[3];
  } else {
    temp[0] = a[3]; temp[1] = a[2]; temp[2] = a[1]; temp[3] = a[0];
  }
  lua_pushnumber(L, out);
  return 1;
}

static int l_tm_buffer_read_double (lua_State *L)
{
  uint8_t *ud = (uint8_t *) lua_touserdata(L, 1);
  size_t index = (size_t) lua_tonumber(L, 2);
  uint8_t le = (int) lua_tonumber(L, 3);
  
  uint8_t *a = &ud[index];
  double out = 0;
  char* temp = (char*) &out;
  if (le ^ (O32_HOST_ORDER == O32_BIG_ENDIAN)) {
    temp[0] = a[0]; temp[1] = a[1]; temp[2] = a[2]; temp[3] = a[3]; temp[4] = a[4]; temp[5] = a[5]; temp[6] = a[6]; temp[7] = a[7];
  } else {
    temp[0] = a[7]; temp[1] = a[6]; temp[2] = a[5]; temp[3] = a[4]; temp[4] = a[3]; temp[5] = a[2]; temp[6] = a[1]; temp[7] = a[0];
  }
  lua_pushnumber(L, out);
  return 1;
}
*/

// 4-byte float
void tm_buffer_float_write (uint8_t* buf, size_t index, float value, tm_endian_t endianness)
{
  uint8_t *a = &buf[index];
  char* temp = (char*) &value;
  if ((endianness == LE) ^ (O32_HOST_ORDER == O32_BIG_ENDIAN)) {
    a[0] = temp[0]; a[1] = temp[1]; a[2] = temp[2]; a[3] = temp[3];
  } else {
    a[0] = temp[3]; a[1] = temp[2]; a[2] = temp[1]; a[3] = temp[0];
  }
}

// 8-byte double
void tm_buffer_double_write (uint8_t* buf, size_t index, double value, tm_endian_t endianness)
{
  uint8_t *a = &buf[index];
  char* temp = (char*) &value;
  if ((endianness == LE) ^ (O32_HOST_ORDER == O32_BIG_ENDIAN)) {
    a[0] = temp[0]; a[1] = temp[1]; a[2] = temp[2]; a[3] = temp[3]; a[4] = temp[4]; a[5] = temp[5]; a[6] = temp[6]; a[7] = temp[7]; 
  } else {
    a[0] = temp[7]; a[1] = temp[6]; a[2] = temp[5]; a[3] = temp[4]; a[4] = temp[3]; a[5] = temp[2]; a[6] = temp[1]; a[7] = temp[0];
  }
}