#include "tm.h"
#include "../colony/colony.h"

#include <sys/time.h>
#include <poll.h>
#include <unistd.h>
#include <signal.h>

#include <lua.h>



/**
 * timestamp
 */


// returns microseconds

double tm_timestamp ()
{
  struct timeval tv;
  gettimeofday(&tv, NULL);

  double time_in_mill = (tv.tv_sec) * 1000 + (tv.tv_usec) / 1000;
  return (double) (time_in_mill * 1000);
}

int tm_timestamp_update (double millis)
{
  fprintf(stderr, "ERROR: tm_timestamp_update does not work on this platform.\n");
  return 0;
}
