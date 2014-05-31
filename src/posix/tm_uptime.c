#include "tm.h"
#include "../colony/colony.h"

#include <sys/time.h>
#include <poll.h>
#include <unistd.h>
#include <signal.h>

#include <lua.h>



/**
 * Uptime
 */

static double timestamp_base = 0;

void tm_uptime_init ()
{
  timestamp_base = tm_timestamp();
}

uint32_t tm_uptime_micro ()
{
  return tm_timestamp() - timestamp_base;
}


void colony_ipc_emit (char *type, void* data, size_t size) {
	lua_State* L = tm_lua_state;
	if (!L) return;
	// Get preload table.
	lua_getglobal(L, "_colony_emit");
	if (lua_isnil(L, -1)) {
		lua_pop(L, 1);
	} else {
		lua_pushstring(L, type);
		uint8_t* buf = colony_createbuffer(L, size);
		memcpy(buf, data, size);
		tm_checked_call(L, 2);
	}
}

static void wait_int (int dummy)
{
	exit(1);
}

static void wait_alarm (int dummy)
{
	(void) dummy;
}

void hw_wait_for_event()
{
	unsigned ms = tm_timer_head_time() / 1000;

	struct pollfd fd;
	fd.fd = STDIN_FILENO;
	fd.events = POLLIN;
	fd.revents = 0;

  	void* sigh_alrm = signal(SIGALRM, wait_alarm);
  	void* sigh_int = signal(SIGINT, wait_int);
  	alarm(1);

	int ret = poll(&fd, 1, ms);

	alarm(0);
	signal(SIGALRM, sigh_alrm);
  	signal(SIGINT, sigh_int);

	if (ret > 0 && ((fd.revents & POLLIN) != 0))  {
		uint8_t buffer[16*1024];
		if (fgets((char*) buffer, sizeof(buffer), stdin) != NULL) {
			colony_ipc_emit("stdin", buffer, strlen((const char*) buffer));
		}
	}

	if (tm_timer_waiting()) {
		tm_event_trigger(&tm_timer_event);
	}
}

// Not needed, as it's all handled in hw_wait_for_event
void hw_timer_update_interrupt() {}
void tm_events_lock() {}
void tm_events_unlock() {}
