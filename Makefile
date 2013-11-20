# Config
EMBED   = 0
FATFS   = 0
LUAJIT  = 0



PATH_HSREGEX       =./deps/hsregex
PATH_HTTPPARSER    =./deps/http-parser
PATH_LUABITOP      =./deps/luabitop-1.0
PATH_LIBTAR        =./deps/libtar
PATH_LUA           =./deps/lua-5.1
PATH_FATFS         =./deps/fatfs


CFLAGS  =
CSRCS   =

# Compiler
ifeq ($(EMBED), 0)
	BUILD   = build/osx
	CC      = gcc
	DUMP    = objdump
	COPY    = gobjcopy

	CFLAGS += -c -o runtime -DCOLONY_PC

else
	BUILD   = build/embed
	CC      = arm-none-eabi-gcc
	DUMP    = arm-none-eabi-objdump
	COPY    = arm-none-eabi-objcopy

	CPU     = cortex-m3
	#OPTIM   = fast
	OPTIM   = 0

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
CFLAGS += -DREGEX_WCHAR -DREGEX_STANDALONE -I$(PATH_HSREGEX)/src -D_NDEBUG
CSRCS  += $(PATH_HSREGEX)/src/regcomp.c $(PATH_HSREGEX)/src/regexec.c $(PATH_HSREGEX)/src/regerror.c $(PATH_HSREGEX)/src/regfree.c $(PATH_HSREGEX)/src/regalone.c

# Http parser	
CFLAGS += -I$(PATH_HTTPPARSER)
CSRCS  += $(PATH_HTTPPARSER)/http_parser.c

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
	CFLAGS += -I$(PATH_LUA)/src -Wno-deprecated-declarations -Wno-empty-body
	CSRCS  += $(shell find $(PATH_LUA)/src/ ! -name "lua.c" ! -name "luac.c" -name "*.c") 
	CFLAGS += -I$(PATH_LUABITOP)
	CSRCS  += $(PATH_LUABITOP)/bit.c
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
	CFLAGS += -I$(PATH_FATFS)/src
	CSRCS  += $(wildcard $(PATH_FATFS)/src/*.c)
endif

# Libtar
CFLAGS += -I$(PATH_LIBTAR)/lib/ -I$(PATH_LIBTAR) -I$(PATH_LIBTAR)/compat -I$(PATH_LIBTAR)/listhash
CSRCS  += $(shell find $(PATH_LIBTAR)/lib/ -maxdepth 1 ! -name "wrapper.c" ! -name "extract.c" -name "*.c")  $(wildcard $(PATH_LIBTAR)/listhash/*.c)
CFLAGS        += -DMAXPATHLEN=256
# CFLAGS += -DDEBUG

# Source
ifeq ($(EMBED), 0)
	CFLAGS += -Isrc
	CSRCS  += $(wildcard src/*.c)
else
	CFLAGS += -Isrc
	CSRCS  += $(shell find src/ -maxdepth 1 ! -name "runtime.c" -name "*.c") 
endif

#
# Targets
#
 
all: buildtools builddir precompile compile

buildtools: tools/compile_lua

tools/compile_lua :
	(cd tools && ./build_tools.sh)

builddir:
	mkdir -p $(BUILD)/obj
	mkdir -p $(BUILD)/runtime
	mkdir -p $(BUILD)/builtin

precompile:
	@make -j8 precompile.parallel

precompile.parallel: $(patsubst builtin/%.js, $(BUILD)/builtin/%.lua, $(wildcard builtin/*.js))  $(patsubst lib/%.lua, $(BUILD)/runtime/%.lua, $(wildcard lib/*.lua)) 
	tools/compile_folder $(BUILD)/builtin dir_builtin | gcc -c -o $(BUILD)/obj/dir_builtin.o -xc -
	tools/compile_folder $(BUILD)/runtime dir_runtime_lib | gcc -c -o $(BUILD)/obj/dir_runtime_lib.o -xc -

$(BUILD)/builtin/%.lua : builtin/%.js
	cat $^ | tools/compile_js | tools/compile_lua > $@

$(BUILD)/runtime/%.lua : lib/%.lua
	cat $^ | tools/compile_lua > $@

compile:
	@make -j8 compile.parallel

compile.parallel: $(patsubst %.c, %.o, $(CSRCS)) 
ifeq ($(EMBED), 0)
	$(CC) -o $(BUILD)/colony -lm $(wildcard $(BUILD)/obj/*.o)
else
	arm-none-eabi-ar rcs $(BUILD)/libcolony.a $(filter-out cli.o,$(wildcard $(BUILD)/obj/*.o))
endif

%.o: %.c
	$(CC) $(CFLAGS) $^ -o $(BUILD)/obj/$(shell basename $@)

clean: 
	rm tools/compile_lua 2>/dev/null || true
	rm -rf $(BUILD) 2>/dev/null || true