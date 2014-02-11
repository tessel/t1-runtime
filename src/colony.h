#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>

#include <stddef.h>

int colony_runtime_open (lua_State** stateptr);
int colony_runtime_run (lua_State** stateptr, const char *path, char **argv, int argc);
int colony_runtime_close (lua_State** stateptr);

int colony_runtime_arena_open (lua_State** stateptr, void* arena, size_t arena_size);
int colony_runtime_arena_save_size (void* _ptr, int max);
void colony_runtime_arena_save (void* _source, int source_max, void* _target, int target_max);
void colony_runtime_arena_restore (void* _source, int source_max, void* _target, int target_max);

void colony_newarray (lua_State* L, int size);
void colony_newobj (lua_State* L, int size);