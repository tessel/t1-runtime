xxd -i < src/runtime.lua > src/runtime-lua.h
gcc -o runtime \
  -std=c99 -g \
  -framework CoreServices -framework Cocoa -L/usr/local/lib/ \
  -DCOLONY_FATFS=0 \
  -DVERSION="\"2.7.2\"" -I/usr/local/include \
  -DREGEX_WCHAR -I../evinrude/src ../evinrude/libhswrex.a \
  -I../http-parser ../http-parser/http_parser.c \
  -I../lua-5.1/src $(find ../lua-5.1/src/ ! -name "lua.c" ! -name "luac.c" -name "*.c") -Wno-deprecated-declarations -Wno-empty-body \
  -I../luabitop-1.0/ ../luabitop-1.0/bit.c \
  -Isrc src/*.c \
  -Isrc/fatfs/src src/fatfs/src/*.c # FatFS

  #-pagezero_size 10000 -image_base 100000000 \
  #-D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 \
  #-I../colony-jit/src/ ../colony-jit/src/libluajit.a \
  # -DLUV_STACK_CHECK \
  # -I../luv/src ../luv/src/common.c ../luv/src/luv.c \
  # -I../luv/libuv/include ../luv/libuv/libuv.a \