#include "lua.h"
#include "lauxlib.h"
#include "lualib.h"
// #include <lua.hpp>
// #include <luajit.h>

#include <emscripten.h>
#include <stdlib.h>
#include <string.h>

#define BUF_SIZE 1024

static int base64_write(lua_State* L, unsigned char* str, size_t len, struct luaL_Buffer *buf)
{
    unsigned int idx;
    for (idx=0; idx<len; idx++){
EM_ASM_INT({
    COLONY_OUTPUT($0);
}, str[idx]);
        // putchar(str[idx]);
        // printf("%02x", (unsigned int) str[idx]);
        //printf(code);
        // luaL_addlstring(buf, code, 4);
    }
    //printf("\n");
    return 0;
}

int _lua_sourcemap (int i) {
return EM_ASM_INT({
    return COLONY_SOURCEMAP($0);
}, i);
}

int go_for_it (char *content, size_t contentSize, char* name)
{
    lua_State *L;
    luaL_Buffer buf;
    int res;
    L = lua_open();  /* create state */
    luaL_buffinit(L, &buf);

    // ** test 1 - works as expected
    lua_settop(L,0);
    luaL_loadbuffer(L, content, strlen(content), name);
    // printf("stack sz: %i\n", lua_gettop(L));
    res = lua_dump(L, (lua_Writer)base64_write, &buf);
    printf("\n");
    return res;
}

// int main (int argc, char *argv[])
// {
//     char buffer[BUF_SIZE];
//     size_t contentSize = 1; // includes NULL
//     char *content;
//     char *old;
//     int stack_sz, res;

//     /* Preallocate space.  We could just allocate one char here, 
//     but that wouldn't be efficient. */
//     content = malloc(sizeof(char) * BUF_SIZE);
//     if(content == NULL)
//     {
//         perror("Failed to allocate content");
//         exit(1);
//     }
//     content[0] = '\0'; // make null-terminated
//     while(fgets(buffer, BUF_SIZE, stdin))
//     {
//         old = content;
//         contentSize += strlen(buffer);
//         content = realloc(content, contentSize);
//         if(content == NULL)
//         {
//             perror("Failed to reallocate content");
//             free(old);
//             exit(2);
//         }
//         strcat(content, buffer);
//     }

//     if(ferror(stdin))
//     {
//         free(content);
//         perror("Error reading from stdin.");
//         exit(3);
//     }

//     return go_for_it(content, contentSize, argc < 2 ? "=stdin" : argv[1]);
// }