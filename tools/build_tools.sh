gcc -o compile_lua -I../deps/colony-lua/src -Wno-deprecated-declarations -Wno-empty-body $(find ../deps/colony-lua/src/ ! -name "lua.c" ! -name "luac.c" -name "*.c") -lm compile_lua.c
