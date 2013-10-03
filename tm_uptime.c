/*
 * tm_time.c
 *
 *  Created on: Aug 12, 2013
 *      Author: tim
 */

#ifdef __cplusplus
extern "C" {
#endif

#include "tm_uptime.h"

//double millis () {
//  struct timeval tv;
//  gettimeofday(&tv, NULL);
//
//  double time_in_mill = (tv.tv_sec) * 1000 + (tv.tv_usec) / 1000;
//  return time_in_mill;
//}

#include <sys/time.h>
#include "time.h"

void tm_uptime_init()
{
}

uint32_t tm_uptime_micro ()
{
  struct timeval tv;
  gettimeofday(&tv, NULL);

  double time_in_mill = (tv.tv_sec) * 1000 + (tv.tv_usec) / 1000;
  return (uint32_t) (time_in_mill * 1000);
}

uint32_t tm_uptime ()
{
  struct timeval tv;
  gettimeofday(&tv, NULL);

  double time_in_mill = (tv.tv_sec) * 1000 + (tv.tv_usec) / 1000;
  return (uint32_t) time_in_mill;
}

void tm_uptime_sleep (uint32_t millis)
{
  uint32_t await = tm_uptime() + millis;
  while (await > tm_uptime()) {
    continue;
  }
}

#ifdef __cplusplus
}
#endif
