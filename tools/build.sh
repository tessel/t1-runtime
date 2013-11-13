gcc -o compile -I../../lua-5.1/src -Wno-deprecated-declarations -Wno-empty-body $(find ../../lua-5.1/src/ ! -name "lua.c" ! -name "luac.c" -name "*.c") compile.c
