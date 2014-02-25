#include <stdint.h>

void dlmallocfork_restore (void* _source, int source_max, void* _target, int target_max);
void dlmallocfork_save (void* _source, int source_max, void* _target, int target_max);
size_t dlmallocfork_save_size (void* _ptr, int max);