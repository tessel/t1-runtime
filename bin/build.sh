#!/bin/sh

# https://github.com/kripken/emscripten/issues/1637
emcc colony-lua/src/*.c compile_lua.c -I colony-lua/src -o compile_lua.js -s EXPORTED_FUNCTIONS="['_go_for_it']" -O3 -s OUTLINING_LIMIT=100000
