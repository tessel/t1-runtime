// Copyright 2014 Technical Machine, Inc. See the COPYRIGHT
// file at the top-level directory of this distribution.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

#include <lua.h>
#include <lauxlib.h>
#include "tm.h"
#include "colony.h"

void timer_cb(tm_event* event);

/// The event triggered by the timer callback
tm_event tm_timer_event = TM_EVENT_INIT(timer_cb);

/// The timer count at which the timer callback last ran.
/// It should be safe if this wraps at UINT_MAX as long as all delays are shorter than a timer period.
unsigned last_time = 0;

// Timer ID
unsigned timer_id = 0;

/// Timers are managed in a sorted linked list of tm_timer entries. Delays are
/// represented differentially between successive elements. If multiple timers
/// expire at the same time, the most recently added is placed last.
typedef struct tm_timer {
  struct tm_timer* next; // Pointer to the timer that happens after this one.
  unsigned id;
  unsigned time; // Additional delay in microseconds after the previous entry
  unsigned repeat; // If nonzero, `time` is reset to `repeat` when the timer expires.
                   // Note that this means setInterval calls are clamped to 1ms
  int lua_cb; // Callback index in the lua registry
} tm_timer;

/// Head of the linked list of timers. Pointer to the timeout object which
/// expires soonest. This linked list structure is managed only by the
/// callbacks, and is not touched in the ISR.
tm_timer* timers_head = 0;

// Example: The following calls are made in one instant:
// 	setTimeout(1010, a)
// 	setTimeout(1000, b)
// 	setInterval(5000, c)
// 	setTimeout(1010, d)
// Makes the linked list look like (time, repeat, cb)
// 	(1000000, 0, b) -> (10000, 0, a) -> (0, 0, d) -> (3990000, 5000, c)

/// Reconfigure the timer hardware for the next interrupt after the head of
/// the list has changed.
static void configure_timer_interrupt() {
	if (timers_head) {
		tm_event_ref(&tm_timer_event);
	} else {
		tm_event_unref(&tm_timer_event);
	}
	hw_timer_update_interrupt();
}

static void destroy_timer(tm_timer* t) {
	luaL_unref(tm_lua_state, LUA_REGISTRYINDEX, t->lua_cb);
	free(t);
}

/// Add a timer to the linked list in the correct position. Returns true if
/// the head of the queue was modified (meaning you must
/// `configure_timer_interrupt()`)
static bool enqueue_timer(unsigned time, tm_timer* t) {
	tm_timer** p = &timers_head;

	while (*p) {
		if (time < (*p)->time) {
			(*p)->time -= time;
			break;
		}
		time -= (*p)->time;
		p = &(*p)->next;
	}

	t->time = time;
	t->next = *p;
	*p = t;

	return (p == &timers_head);
}

/// Create a timer and enqueue it
unsigned tm_settimeout(unsigned time, bool repeat, int lua_cb) {
	tm_timer* t = calloc(sizeof(tm_timer), 1);
	t->repeat = repeat ? time : 0;
	t->lua_cb = lua_cb;
	t->next = 0;
	t->id = ++timer_id;

	if (!timers_head) {
		last_time = tm_uptime_micro();
	} else {
		// Adjust because the times on the queue are relative to last_time
		time += (tm_uptime_micro() - last_time);
	}

	if (enqueue_timer(time, t)) {
		configure_timer_interrupt();
	}

	return t->id;
}

/// Cancel and free a timeout by id
void tm_cleartimeout(unsigned id) {
	tm_timer** p = &timers_head;
	while (*p) {
		tm_timer* t = *p;
		if (t->id == id) {
			if (t->next) {
				t->next->time += t->time;
			}
			*p = t->next;
			destroy_timer(t);
			break;
		}
		p = &t->next;
	}

	if (p == &timers_head) {
		configure_timer_interrupt();
	}
}

bool tm_timer_waiting() {
	return timers_head != NULL;
}

unsigned tm_timer_head_time() {
	if (timers_head != NULL) {
		return timers_head->time;
	} else {
		return 1000000;
	}
}

unsigned tm_timer_base_time() {
	return last_time;
}

/// Callback enqueued by the timer ISR. It is safe for this to be called more
/// often than necessary
void timer_cb(tm_event* event) {
	(void) event;
	
	unsigned prev_time = last_time;
	last_time = tm_uptime_micro();
	unsigned elapsed = last_time - prev_time;

	while (timers_head) {
		tm_timer* t = timers_head;

		if (t->time > elapsed) {
			t->time -= elapsed;
			break;
		}

		elapsed -= t->time;
		timers_head = t->next;

		lua_rawgeti(tm_lua_state, LUA_REGISTRYINDEX, t->lua_cb);

		if (t->repeat != 0) {
			// It's back in the queue, so clearInterval within the callback can cancel it
			enqueue_timer(t->repeat, t);
		} else {
			// Clean up before calling lua, as it can setjmp. The callback is safely rooted on the lua stack above.
			destroy_timer(t);
			t = NULL;
		}

		lua_getfield(tm_lua_state, LUA_GLOBALSINDEX, "global");
		tm_checked_call(tm_lua_state, 1);
	}

	// If lua setjmps, these will be cleaned up when the timer state is reset
	configure_timer_interrupt();
}

void tm_timer_cleanup() {
	while (timers_head) {
		tm_timer* t = timers_head;
		timers_head = t->next;
		destroy_timer(t);
	}
	tm_event_unref(&tm_timer_event);
}
