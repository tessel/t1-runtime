#include "tm.h"

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
	return tm_event_count != 0;
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


