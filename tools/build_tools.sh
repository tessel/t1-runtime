gcc -o compile_lua -I../deps/lua-5.1/src -Wno-deprecated-declarations -Wno-empty-body $(find ../deps/lua-5.1/src/ ! -name "lua.c" ! -name "luac.c" -name "*.c") -lm compile_lua.c
