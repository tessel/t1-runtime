#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>

#include "tm.h"
#include <sys/time.h>
#include <poll.h>


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

void hw_wait_for_event()
{
	struct pollfd fds[0];
	unsigned ms = tm_timer_head_time() / 1000;
	poll(fds, 0, ms);
	if (tm_timer_waiting()) {
		tm_event_trigger(&tm_timer_event);
	}
}

// Not needed, as it's all handled in hw_wait_for_event
void hw_timer_update_interrupt() {}
void tm_events_lock() {}
void tm_events_unlock() {}
