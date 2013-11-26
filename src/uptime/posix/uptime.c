#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>

#include "tm.h"


/**
 * Uptime
 */

void tm_uptime_init ()
{
  // nop
}

uint32_t tm_uptime_micro ()
{
  struct timeval tv;
  gettimeofday(&tv, NULL);

  double time_in_mill = (tv.tv_sec) * 1000 + (tv.tv_usec) / 1000;
  return (uint32_t) (time_in_mill * 1000);
  // return 0;
}