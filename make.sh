gcc -o runtime ../colony-jit/src/libluajit.a \
  -DCOLONY_FATFS=0 \
  -DVERSION="\"2.7.2\"" -I/usr/local/include \
  -lpcre ../lrexlib/src/*.c ../lrexlib/src/pcre/*.c -I../lrexlib/src -I../lrexlib/src/pcre \
  ../http-parser/http_parser.c -I../http-parser \
  -I../colony-jit/src/ \
  -std=c99 -g -pagezero_size 10000 -image_base 100000000 \
  -DLUV_STACK_CHECK -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 \
  -I../luv/src ../luv/src/common.c ../luv/src/luv.c \
  -I../luv/libuv/include ../luv/libuv/libuv.a \
  -framework CoreServices -framework Cocoa -L/usr/local/lib/ \
  -g \
  -Isrc src/*.c \
  -Isrc/fatfs/src src/fatfs/src/*.c # FatFS