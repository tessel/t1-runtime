
#include <stdio.h>
#include <stdlib.h>
#include <stdarg.h>
#include <string.h>
#include <ctype.h>
#include <sys/time.h>
#include <unistd.h>
#include <stdint.h>
 
uint32_t tm__sync_gethostbyname (const char *domain)
{
    (void) domain;
    return (0 << 24) | (0 << 16) | (0 << 8) | 0;
}
