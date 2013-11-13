#include <stddef.h>
 #include "cli.c"
#include "colony.c"
#include "node-tm.c"
#include "node.c"
#include "std.c"
const dir_reg_t dir_index_lib[] = { {"lib/cli", lib_cli_lua, lib_cli_lua_len},
{"lib/colony", lib_colony_lua, lib_colony_lua_len},
{"lib/node-tm", lib_node_tm_lua, lib_node_tm_lua_len},
{"lib/node", lib_node_lua, lib_node_lua_len},
{"lib/std", lib_std_lua, lib_std_lua_len}, { 0, 0, 0 } };
