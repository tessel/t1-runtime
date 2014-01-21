# Config
LUAJIT     =
ARM        =
CLI        =
OPTIM      =fast

TM_NET     =
TM_FS      =
TM_UPTIME  =

.PHONY: osx

osx:
	@make CLI=1 TM_FS=posix TM_NET=posix TM_UPTIME=posix OPTIM=$(OPTIM) all

embed:
	@make ARM=1 TM_FS=fat OPTIM=$(OPTIM) all



PATH_HSREGEX       =./deps/hsregex
PATH_HTTPPARSER    =./deps/http-parser
PATH_LUABITOP      =./deps/luabitop-1.0
PATH_LIBTAR        =./deps/libtar
PATH_LUA           =./deps/lua-5.1
PATH_FATFS         =./deps/fatfs
PATH_YAJL					 =./deps/yajl


CFLAGS  =
CSRCS   =

# Compiler
ifneq ($(ARM), 1)
	BUILD   = build/osx
	CC      = gcc
	DUMP    = objdump
	COPY    = gobjcopy
	SECT    = 

	CFLAGS += -c -o runtime -DCOLONY_PC

else
	BUILD   = build/embed
	CC      = arm-none-eabi-gcc
	DUMP    = arm-none-eabi-objdump
	COPY    = arm-none-eabi-objcopy
	SECT    = .text

	CPU     = cortex-m3
	#OPTIM   = fast
	OPTIM        =$(OPTIM)

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
	CFLAGS      += -msoft-float
	CFLAGS      += -mno-sched-prolog 
	#CFLAGS      += -fno-hosted   
	CFLAGS      += -ffunction-sections 
	CFLAGS      += -fdata-sections 
	#CFLAGS      += -fpermissive
	CFLAGS      += -lm
	CFLAGS      += -lgcc
	CFLAGS      += -lc
	CFLAGS      += -lcolony
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
ifneq ($(LUAJIT), 1)
	# Lua 5.1
	CFLAGS += -DCOLONY_LUA
	CFLAGS += -I$(PATH_LUA)/src -Wno-deprecated-declarations -Wno-empty-body
	CSRCS  += $(shell find $(PATH_LUA)/src/ ! -name "lua.c" ! -name "luac.c" -name "*.c") 
	CFLAGS += -I$(PATH_LUABITOP)
	CSRCS  += $(PATH_LUABITOP)/bit.c
else
	# LuaJIT
	CFLAGS += -DCOLONY_LUAJIT
	CFLAGS += -pagezero_size 10000 -image_base 100000000
	CFLAGS += -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64
	CFLAGS += -I../luajit-2.0/src/
	CSRCS  += ../luajit-2.0/src/libluajit.a
endif

# # Libuv
# CFLAGS += -framework CoreServices -framework Cocoa -L/usr/local/lib/
# -DLUV_STACK_CHECK \
# -I../luv/src ../luv/src/common.c ../luv/src/luv.c \
# -I../luv/libuv/include ../luv/libuv/libuv.a \
# -DVERSION="\"2.7.2\"" -I/usr/local/include

# Fatfs
ifeq ($(TM_FS),fat)
	CFLAGS += -DCOLONY_FATFS=1
	CFLAGS += -I$(PATH_FATFS)/src
	CSRCS  += $(wildcard $(PATH_FATFS)/src/*.c)
endif

# Libtar
CFLAGS += -I$(PATH_LIBTAR)/lib/ -I$(PATH_LIBTAR) -I$(PATH_LIBTAR)/compat -I$(PATH_LIBTAR)/listhash
CSRCS  += $(shell find $(PATH_LIBTAR)/lib/ -maxdepth 1 ! -name "wrapper.c" ! -name "extract.c" -name "*.c")  $(wildcard $(PATH_LIBTAR)/listhash/*.c)
CFLAGS        += -DMAXPATHLEN=256
# CFLAGS += -DDEBUG

# yajl
CFLAGS += -I$(PATH_YAJL)/src/ -I./src
CSRCS  += $(shell find $(PATH_YAJL)/src/ -maxdepth 1 -name "*.c")

# Sources
CFLAGS += -Isrc
ifneq ($(CLI),1)
	CSRCS  += $(shell find src/ -maxdepth 1 ! -name "cli.c" -name "*.c") 
else
	CSRCS  += $(shell find src/ -maxdepth 1 -name "*.c") 
endif
ifneq ($(TM_NET),)
	CFLAGS += -DTM_NET_$(TM_NET)
	CSRCS  += $(wildcard src/net/$(TM_NET)/*.c)
endif
ifneq ($(TM_FS),)
	CFLAGS += -DTM_FS_$(TM_FS)
	CSRCS  += $(wildcard src/fs/$(TM_FS)/*.c)
endif
ifneq ($(TM_UPTIME),)
	CFLAGS += -DTM_UPTIME_$(TM_UPTIME)
	CSRCS  += $(wildcard src/uptime/$(TM_UPTIME)/*.c)
endif


#
# Targets
#
 
all: buildtools compile

buildtools: node_modules tools/compile_lua

node_modules:
	npm install

tools/compile_lua :
	(cd tools && ./build_tools.sh)

$(BUILD)/obj/dir_builtin.o: $(patsubst builtin/%.js, $(BUILD)/builtin/%.lua, $(wildcard builtin/*.js))
	tools/compile_folder $(BUILD)/builtin dir_builtin $(SECT) > $(@:.o=.c)
	$(CC) -c -o $@ $(@:.o=.c)

$(BUILD)/obj/dir_runtime_lib.o: $(patsubst lib/%.lua, $(BUILD)/runtime/%.lua, $(wildcard lib/*.lua))
	tools/compile_folder $(BUILD)/runtime dir_runtime_lib $(SECT) > $(@:.o=.c)
	$(CC) -c -o $@ $(@:.o=.c)

$(BUILD)/builtin/%.lua : builtin/%.js
	mkdir -p $(@D)
	cat $^ | tools/compile_js | tools/compile_lua =$^ > $@

$(BUILD)/runtime/%.lua : lib/%.lua
	mkdir -p $(@D)
	cat $^ | tools/compile_lua =$^ > $@

BUILTIN_OBJS = $(BUILD)/obj/dir_builtin.o $(BUILD)/obj/dir_runtime_lib.o
OBJS = $(patsubst %.c, $(BUILD)/obj/%.o, $(CSRCS)) $(BUILTIN_OBJS)

ifneq ($(ARM),1)

compile: bin/colony

bin/colony: $(OBJS)
	$(CC) -o  bin/colony -lm $(OBJS)

else

compile: $(BUILD)/libcolony.a

$(BUILD)/libcolony.a: $(OBJS)
	arm-none-eabi-ar rcs $@ $(OBJS)

endif

$(BUILD)/obj/%.o: %.c
	@mkdir -p $(@D)
	$(CC) $(CFLAGS) $^ -o $@

clean: 
	rm tools/compile_lua 2>/dev/null || true
	rm -rf build 2>/dev/null || true
	rm -rf bin/* 2>/dev/null || true
