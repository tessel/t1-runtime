// Copyright 2014 Technical Machine, Inc. See the COPYRIGHT
// file at the top-level directory of this distribution.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

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

  double time_in_mill = (((double) tv.tv_sec) * 1000) + (((double) tv.tv_usec) / 1000);
  return (double) (time_in_mill * 1000);
}

int tm_timestamp_update (double millis)
{
  fprintf(stderr, "ERROR: tm_timestamp_update does not work on this platform.\n");
  return 0;
}
