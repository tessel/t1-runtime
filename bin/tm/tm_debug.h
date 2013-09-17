#ifndef __CC3000_DEBUG_H__
#define __CC3000_DEBUG_H__

#ifdef  __cplusplus
extern "C" {
#endif

#include <stdio.h>

#define TM_COMMAND(command, str, ...) printf("#&%c" str "\n", command, ##__VA_ARGS__)
#define TM_DEBUG(str, ...) TM_COMMAND('d', str, ##__VA_ARGS__)

#ifdef  __cplusplus
}
#endif // __cplusplus

#endif // __COMMON_H__
