CFLAGS  =
CFLAGS  = -o runtime
CFLAGS += -std=c99 -g
CFLAGS += -framework CoreServices -framework Cocoa -L/usr/local/lib/
	
# -DVERSION="\"2.7.2\"" -I/usr/local/include

CSRCS   = -DREGEX_WCHAR -I../evinrude/src 
CSRCS  += ../evinrude/libhswrex.a 
	
CFLAGS += -I../http-parser
CSRCS  += ../http-parser/http_parser.c

# Lua 5.1
CFLAGS += -I../lua-5.1/src -Wno-deprecated-declarations -Wno-empty-body
CSRCS  += $(shell find ../lua-5.1/src/ ! -name "lua.c" ! -name "luac.c" -name "*.c") 
CFLAGS += -I../luabitop-1.0/
CSRCS  += ../luabitop-1.0/bit.c

# LuaJIT
# CFLAGS += -pagezero_size 10000 -image_base 100000000
# CFLAGS += -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64
# CFLAGS += -I../luajit-2.0/src/
# CSRCS  += ../luajit-2.0/src/libluajit.a

# Libuv
# -DLUV_STACK_CHECK \
# -I../luv/src ../luv/src/common.c ../luv/src/luv.c \
# -I../luv/libuv/include ../luv/libuv/libuv.a \

CFLAGS += -Isrc
CSRCS  += src/*.c \

CFLAGS += -DCOLONY_FATFS=0 -Isrc/fatfs/src
CSRCS  += src/fatfs/src/*.c # FatFS

all:
	xxd -i < src/runtime.lua > src/runtime-lua.h
	gcc $(CFLAGS) $(CSRCS)