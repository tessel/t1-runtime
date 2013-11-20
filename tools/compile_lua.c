#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>
// #include <luajit.h>

#include <stdlib.h>
#include <string.h>


static int base64_write(lua_State* L, unsigned char* str, size_t len, 
        struct luaL_Buffer *buf)
{
    unsigned int idx;
    for (idx=0; idx<len; idx++){
        putchar(str[idx]);
        // printf("%02x", (unsigned int) str[idx]);
        //printf(code);
        // luaL_addlstring(buf, code, 4);
    }
    //printf("\n");
    return 0;
}

int main (int argc, char *argv[])
{
    #define BUF_SIZE 1024
    char buffer[BUF_SIZE];
    size_t contentSize = 1; // includes NULL
    /* Preallocate space.  We could just allocate one char here, 
    but that wouldn't be efficient. */
    char *content = malloc(sizeof(char) * BUF_SIZE);
    if(content == NULL)
    {
        perror("Failed to allocate content");
        exit(1);
    }
    content[0] = '\0'; // make null-terminated
    while(fgets(buffer, BUF_SIZE, stdin))
    {
        char *old = content;
        contentSize += strlen(buffer);
        content = realloc(content, contentSize);
        if(content == NULL)
        {
            perror("Failed to reallocate content");
            free(old);
            exit(2);
        }
        strcat(content, buffer);
    }

    if(ferror(stdin))
    {
        free(content);
        perror("Error reading from stdin.");
        exit(3);
    }

    lua_State *L = lua_open();  /* create state */
    int stack_sz;
    int res;
    luaL_Buffer buf;

    luaL_buffinit(L, &buf);

    // ** test 1 - works as expected
    lua_settop(L,0);
    luaL_loadbuffer(L, content, strlen(content), argc < 2 ? "=stdin" : argv[1]);
    // printf("stack sz: %i\n", lua_gettop(L));
    res = lua_dump(L, (lua_Writer)base64_write, &buf);
    printf("\n");

    return 0;
}