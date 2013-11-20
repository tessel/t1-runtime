# Config
EMBED   = 0
FATFS   = 0
LUAJIT  = 0



PATH_HSREGEX       =./deps/hsregex
PATH_HTTPPARSER    =./deps/http-parser
PATH_LUABITOP      =./deps/luabitop-1.0
PATH_LIBTAR        =./deps/libtar
PATH_LUA           =./deps/lua-5.1


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
	CFLAGS += -Isrc/fatfs/src
	CSRCS  += $(wildcard src/fatfs/src/*.c)
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

# Binary lua files
BINOBJS   = $(patsubst %.lua, %.o, $(wildcard lib/*.lua)) $(patsubst %.js, %.o, $(wildcard builtin/*.js))

#
# Targets
#

all: builddir precompile compile

precompile: indexify $(patsubst %.lua, %.o, $(BINOBJS))

builddir:
	mkdir -p $(BUILD)/obj

indexify:
	D=lib node -e "dir = process.env.D; S = /\.lua$\/; function _(s) { return s.replace(/[^a-z0-9_]/g, '_'); } console.log('\#include <stddef.h>\n',require('fs').readdirSync(dir).filter(function (f) { return f.match(S); }).map(function (s) { return '#include \"' + s.replace(/^~/, '').replace(/\.lua/, '.c') + '\"' }).join('\n') + '\nconst dir_reg_t dir_index_' + _(dir) + '[] = { ' + require('fs').readdirSync(dir).filter(function (f) { return f.match(S); }).map(function (s) { return '{' + [JSON.stringify('lib/' + s.replace('.lua', '')), '' + _(dir+'\/'+s), _(dir+'\/'+s) + '_len'].join(', ') + '}'  }).join(',\n') + ', { 0, 0, 0 } };')" > lib/index.h
ifeq ($(EMBED), 1)
	node preprocessor builtin luac
else
	node preprocessor builtin
endif
	D=builtin node -e "dir = process.env.D; S = /\.colony$\/; function _(s) { return s.replace(/[^a-z0-9_]/g, '_'); } console.log('\#include <stddef.h>\n',require('fs').readdirSync(dir).filter(function (f) { return f.match(S); }).map(function (s) { return '#include \"' + s.replace(/^~/, '').replace(/\.colony/, '.c') + '\"' }).join('\n') + '\nconst dir_reg_t dir_index_' + _(dir) + '[] = { ' + require('fs').readdirSync(dir).filter(function (f) { return f.match(S); }).map(function (s) { return '{' + [JSON.stringify('./builtin/' + s.replace(/^~/, '').replace('.colony', '.js')), '' + _(dir+'\/'+s), _(dir+'\/'+s) + '_len'].join(',') + '}'  }).join(',\n') + ', { 0, 0, 0} };')" > builtin/index.h

%.o: %.js
	xxd -i $(subst /,/~,$(patsubst %.js,%.colony,$^)) $(patsubst %.js, %.c, $^)
	sed -i '' 's/unsigned char/const unsigned char/g' $(patsubst %.js, %.c, $^)
	sed -i '' 's/unsigned int \([a-z_]*\) = \([0-9]*\);/\#define \1 \2/g' $(patsubst %.js, %.c, $^)
ifeq ($(EMBED), 1)
	sed -i '' 's/unsigned char/unsigned char __attribute__ ((section (".text")))/g' $(patsubst %.js, %.c, $^)
endif
	# $(CC) $(CFLAGS) -o $(patsubst %.js, %.o, $^) $(patsubst %.js, %.c, $^)
	# rm $(patsubst %.js, %.c, $^)

%.o: %.lua
	cat $^ | ./tools/compile > $(patsubst %.lua, %.luac, $^)
	xxd -i $(patsubst %.lua, %.luac, $^) $(patsubst %.lua, %.c, $^)
	rm $(patsubst %.lua, %.luac, $^)
	sed -i '' 's/_luac/_lua/g' $(patsubst %.lua, %.c, $^)
	# xxd -i $^ $(patsubst %.lua, %.c, $^)
	sed -i '' 's/unsigned char/const unsigned char/g' $(patsubst %.lua, %.c, $^)
	sed -i '' 's/unsigned int \([a-z_]*\) = \([0-9]*\);/\#define \1 \2/g' $(patsubst %.lua, %.c, $^)
ifeq ($(EMBED), 1)
	sed -i '' 's/unsigned char/unsigned char __attribute__ ((section (".text")))/g' $(patsubst %.lua, %.c, $^)
endif
	# $(CC) $(CFLAGS) -o $(patsubst %.lua, %.o, $^) $(patsubst %.lua, %.c, $^)
	# rm $(patsubst %.lua, %.c, $^)

ifeq ($(EMBED), 0)
compile: $(patsubst %.c, %.o, $(CSRCS)) 
	$(CC) -o colony -lm $(wildcard $(BUILD)/obj/*.o)
else
compile: $(patsubst %.c, %.o, $(CSRCS))
	arm-none-eabi-ar rcs libcolony.a $(filter-out cli.o,$(wildcard $(BUILD)/obj/*.o))
endif

# You don't even need to be explicit here,
# compiling C files is handled automagically by Make.
%.o: %.c
	$(CC) $(CFLAGS) $^ -o $(BUILD)/obj/$(shell basename $@)

clean: 
	rm -rf $(BUILD)
	rm -rf $(patsubst %.c, %.o, $(CSRCS)) $(patsubst %.js, %.c, $(patsubst %.lua, %.c, $(BINOBJS))) 2>/dev/null || true