# Config
EMBED   = 0
FATFS   = 1
LUAJIT  = 0


CFLAGS  =
CSRCS   =

# Compiler
ifeq ($(EMBED), 0)
	CC      = gcc
	DUMP    = objdump
	COPY    = gobjcopy

	CFLAGS += -c -o runtime -DCOLONY_PC

else
	CC      = arm-none-eabi-gcc
	DUMP    = arm-none-eabi-objdump
	COPY    = arm-none-eabi-objcopy

	CPU     = cortex-m3
	OPTIM   = fast

	CFLAGS += -c -DCOLONY_EMBED
	CFLAGS      += -mcpu=$(CPU) 
	CFLAGS      += -mthumb
	CFLAGS      += -gdwarf-2 
	CFLAGS      += -mtune=cortex-m3 
	CFLAGS      += -march=armv7-m 
	CFLAGS      += -mlong-calls
	CFLAGS      += -mfix-cortex-m3-ldrd
	CFLAGS      += -Wall 
	CFLAGS      += -O$(OPTIM) 
	CFLAGS      += -mapcs-frame 
	#CFLAGS      += -msoft-float
	# -mfpu=vfp -mfloat-abi=softfp
	CFLAGS      += -mno-sched-prolog 
	#CFLAGS      += -fno-hosted   
	CFLAGS      += -ffunction-sections 
	CFLAGS      += -fdata-sections 
	#CFLAGS      += -fpermissive
	CFLAGS        += -lm
	CFLAGS        += -lgcc
	CFLAGS        += -lc
	CFLAGS        += -lcs3unhosted
	CFLAGS        += -lcs3
	CFLAGS        += -lcs3arm
	CFLAGS        += -lcolony
endif

# Cflags
CFLAGS += -std=c99 -g

# Regex
CFLAGS += -DREGEX_WCHAR -I../evinrude/src 
# CSRCS  += ../evinrude/libhswrex.a 

# Http parser	
CFLAGS += -I../http-parser
CSRCS  += ../http-parser/http_parser.c

# Lua
ifeq ($(LUAJIT), 1)
	# LuaJIT
	CFLAGS += -DCOLONY_LUAJIT
	CFLAGS += -pagezero_size 10000 -image_base 100000000
	CFLAGS += -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64
	CFLAGS += -I../luajit-2.0/src/
	CSRCS  += ../luajit-2.0/src/libluajit.a
else
	# Lua 5.1
	CFLAGS += -DCOLONY_LUA
	CFLAGS += -I../lua-5.1/src -Wno-deprecated-declarations -Wno-empty-body
	CSRCS  += $(shell find ../lua-5.1/src/ ! -name "lua.c" ! -name "luac.c" -name "*.c") 
	CFLAGS += -I../luabitop-1.0/
	CSRCS  += ../luabitop-1.0/bit.c
endif

# # Libuv
# CFLAGS += -framework CoreServices -framework Cocoa -L/usr/local/lib/
# -DLUV_STACK_CHECK \
# -I../luv/src ../luv/src/common.c ../luv/src/luv.c \
# -I../luv/libuv/include ../luv/libuv/libuv.a \
# -DVERSION="\"2.7.2\"" -I/usr/local/include

# Fatfs
ifeq ($(FATFS), 1)
	CFLAGS += -DCOLONY_FATFS=1
	CFLAGS += -Isrc/fatfs/src
	CSRCS  += $(wildcard src/fatfs/src/*.c)
endif

# Libtar
CFLAGS += -I../libtar/lib/ -I../libtar -I../libtar/compat -I../libtar/listhash
CSRCS  += $(wildcard ../libtar/lib/*.c) $(wildcard ../libtar/listhash/*.c)

# Source
ifeq ($(EMBED), 0)
	CFLAGS += -Isrc
	CSRCS  += $(wildcard src/*.c)
else
	CFLAGS += -Isrc
	CSRCS  += $(shell find src/ -maxdepth 1 ! -name "runtime.c" -name "*.c") 
endif

# Binary lua files
LUASRCS   = $(wildcard lib/*.lua)



#
# Targets
#

all: precompile compile

precompile: $(patsubst %.lua, %.o, $(LUASRCS))

%.o: %.lua
	xxd -i $^ $(patsubst %.lua, %.c, $^)
	gcc -c -o $(patsubst %.lua, %.o, $^) $(patsubst %.lua, %.c, $^)
	rm $(patsubst %.lua, %.c, $^)

ifeq ($(EMBED), 0)
compile: $(patsubst %.lua, %.o, $(LUASRCS)) $(patsubst %.c, %.o, $(CSRCS)) 
	$(CC) -o runtime -lm ../evinrude/libhswrex.a $^ 
else
compile: $(patsubst %.c, %.o, $(CSRCS)) $(patsubst %.lua, %.o, $(LUASRCS))
	arm-none-eabi-ar rcs libcolony.a ../evinrude/libhswrex.a $^ 
endif

# You don't even need to be explicit here,
# compiling C files is handled automagically by Make.
%.o: %.c
	$(CC) $(CFLAGS) $^ -o $@

clean: 
	-@rm -rf $(patsubst %.c, %.o, $(CSRCS)) $(patsubst %.lua, %.o, $(LUASRCS)) $(patsubst %.lua, %.c, $(LUASRCS)) 2>/dev/null || true