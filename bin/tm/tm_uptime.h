/*
 * tm_uptime.h
 *
 *  Created on: Aug 12, 2013
 *      Author: tim
 */

#include <stdint.h>

#ifndef TM_UPTIME_H_
#define TM_UPTIME_H_

#ifdef __cplusplus
extern "C" {
#endif

void tm_uptime_init();
uint32_t tm_uptime();
uint32_t tm_uptime_micro();

#ifdef __cplusplus
}
#endif

#endif /* TM_UPTIME_H_ */
