#include <stdio.h>
#include <stdlib.h>

void * operator new(size_t size) /* let op: size geeft het aantal bytes aan */
{
    return(malloc(size));
} 
 
void * operator new[](size_t size)
{
    return(malloc(size));
} 
 
void operator delete(void * ptr)
{
    free(ptr);
} 
 
void operator delete[](void * ptr)
{
    free(ptr);
}
