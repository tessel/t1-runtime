// Copyright 2014 Technical Machine, Inc. See the COPYRIGHT
// file at the top-level directory of this distribution.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

#include "tm.h"
#include "colony.h"

unsigned tm_event_count = 0;

bool tm_event_ref(tm_event* event) {
	if (event->ref == false) {
		event->ref = true;
		tm_event_count++;
		return true;
	} else {
		return false;
	}
}

bool tm_event_unref(tm_event* event) {
	if (event->ref == true) {
		event->ref = false;
		tm_event_count--;
		return true;
	} else {
		return false;
	}
}

bool tm_events_active() {
	return (tm_event_count != 0);
}



tm_event* event_queue_head = 0;
tm_event* event_queue_tail = 0;

void tm_event_trigger(tm_event* event) {
	tm_events_lock();
	if (event->pending == false) {
		event->pending = true;
		event->next = 0;
		if (event_queue_head) {
			// Link it on to the end of the existing linked list
			event_queue_tail->next = event;
			event_queue_tail = event;
		} else {
			event_queue_head = event_queue_tail = event;
		}
	}
	tm_events_unlock();
}

bool tm_events_pending() {
	return event_queue_head != 0;
}

void tm_event_process() {
	tm_events_lock();
	tm_event* e = event_queue_head;
	if (e) {
		event_queue_head = e->next;
		e->pending = false;
		e->next = 0;
	}
	tm_events_unlock();
	if (e) {
		e->callback(e);
	}
}

jmp_buf exit_event_loop;
volatile bool event_loop_running = false;
volatile bool event_loop_keep_running = false;
int event_loop_retval = 0;

int tm_runtime_run(const char* script, const char** argv, int argc)
{
	tm_event_count = 0;
	event_loop_running = true;
	event_loop_keep_running = true;
	volatile bool have_called_exit = false;
	if (setjmp(exit_event_loop) == 0) {
		event_loop_retval = colony_runtime_run(script, argv, argc);

		if (event_loop_retval == 0) {
			while (event_loop_keep_running && tm_events_active()) {
				hw_wait_for_event();
				tm_event_process();
			}
		}
	}
	lua_sethook(tm_lua_state, 0, 0, 0);
	if (!have_called_exit) {
		have_called_exit = true;
		lua_State* L = tm_lua_state;
		lua_getglobal(L, "_colony_emit");
		lua_pushstring(L, "exit");
		tm_checked_call(L, 1);
	}

	tm_timer_cleanup();

	event_loop_running = false;
	return event_loop_retval;
}

void tm_runtime_exit_longjmp(int code)
{
	if (event_loop_running) {
		event_loop_retval = code;
		longjmp(exit_event_loop, 1);
	}
}

void exit_hook(lua_State* L, lua_Debug *ar)
{
	(void) L;
	(void) ar;
	return tm_runtime_exit_longjmp(event_loop_retval);
}

void tm_runtime_schedule_exit(int code)
{
	if (event_loop_running) {
		event_loop_retval = code;
		event_loop_keep_running = false;
		lua_sethook(tm_lua_state, exit_hook, LUA_MASKCOUNT, 1);
	}
}

