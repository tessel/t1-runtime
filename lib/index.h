#include <stddef.h>
 extern unsigned char* lib_cli_lua; extern unsigned int lib_cli_lua_len;
extern unsigned char* lib_colony_lua; extern unsigned int lib_colony_lua_len;
extern unsigned char* lib_node_tm_lua; extern unsigned int lib_node_tm_lua_len;
extern unsigned char* lib_node_lua; extern unsigned int lib_node_lua_len;
extern unsigned char* lib_std_lua; extern unsigned int lib_std_lua_len;
const dir_reg_t dir_index_lib[] = { {"lib/cli", (unsigned char*) &lib_cli_lua, lib_cli_lua_len}, {"lib/colony", (unsigned char*) &lib_colony_lua, lib_colony_lua_len}, {"lib/node-tm", (unsigned char*) &lib_node_tm_lua, lib_node_tm_lua_len}, {"lib/node", (unsigned char*) &lib_node_lua, lib_node_lua_len}, {"lib/std", (unsigned char*) &lib_std_lua, lib_std_lua_len}, { 0, 0, 0 } };
