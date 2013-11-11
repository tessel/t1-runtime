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
CFLAGS += -DREGEX_WCHAR -DREGEX_STANDALONE -I../evinrude/src -D_NDEBUG
CSRCS  += ../evinrude/src/regcomp.c ../evinrude/src/regexec.c ../evinrude/src/regerror.c ../evinrude/src/regfree.c ../evinrude/src/regalone.c
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
CSRCS  += $(shell find ../libtar/lib/ -maxdepth 1 ! -name "wrapper.c" ! -name "extract.c" -name "*.c")  $(wildcard ../libtar/listhash/*.c)
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
BINSRCS   = $(wildcard lib/*.lua) $(wildcard builtin/*.colony)
BINOBJS   = $(patsubst %.lua, %.o, $(wildcard lib/*.lua)) $(patsubst %.js, %.o, $(wildcard builtin/*.js))



#
# Targets
#

all: precompile compile

precompile: indexify $(patsubst %.lua, %.o, $(BINSRCS))

indexify:
	D=lib node -e "dir = process.env.D; S = /\.lua$\/; function _(s) { return s.replace(/[^a-z0-9_]/g, '_'); } console.log('\#include <stddef.h>\n',require('fs').readdirSync(dir).filter(function (f) { return f.match(S); }).map(function (s) { return 'extern unsigned char* ' + _(dir+'_'+s) + '; extern unsigned int ' + _(dir+'\/'+s) + '_len;' }).join('\n') + '\nconst dir_reg_t dir_index_' + _(dir) + '[] = { ' + require('fs').readdirSync(dir).filter(function (f) { return f.match(S); }).map(function (s) { return '{' + [JSON.stringify('lib/' + s.replace('.lua', '')), '(unsigned char*) &' + _(dir+'\/'+s), _(dir+'\/'+s) + '_len'].join(', ') + '}'  }).join(', ') + ', { 0, 0, 0 } };')" > lib/index.h
	node preprocessor builtin
	D=builtin node -e "dir = process.env.D; S = /\.colony$\/; function _(s) { return s.replace(/[^a-z0-9_]/g, '_'); } console.log('\#include <stddef.h>\n',require('fs').readdirSync(dir).filter(function (f) { return f.match(S); }).map(function (s) { return 'extern unsigned char* ' + _(dir+'_'+s) + '; extern unsigned int ' + _(dir+'\/'+s) + '_len;' }).join('\n') + '\nconst dir_reg_t dir_index_' + _(dir) + '[] = { ' + require('fs').readdirSync(dir).filter(function (f) { return f.match(S); }).map(function (s) { return '{' + [JSON.stringify(s), '(unsigned char*) &' + _(dir+'\/'+s), _(dir+'\/'+s) + '_len'].join(', ') + '}'  }).join(', ') + ', { 0, 0, 0} };')" > builtin/index.h

%.o: %.js
	xxd -i $(subst /,/~,$(patsubst %.js,%.colony,$^)) $(patsubst %.js, %.c, $^)
ifeq ($(EMBED), 1)
	sed -i '' 's/unsigned char/const unsigned char __attribute__ ((section (".text")))/g' $(patsubst %.js, %.c, $^)
endif
	$(CC) $(CFLAGS) -o $(patsubst %.js, %.o, $^) $(patsubst %.js, %.c, $^)
	rm $(patsubst %.js, %.c, $^)

%.o: %.lua
	xxd -i $^ $(patsubst %.lua, %.c, $^)
ifeq ($(EMBED), 1)
	sed -i '' 's/unsigned char/const unsigned char __attribute__ ((section (".text")))/g' $(patsubst %.lua, %.c, $^)
endif
	$(CC) $(CFLAGS) -o $(patsubst %.lua, %.o, $^) $(patsubst %.lua, %.c, $^)
	rm $(patsubst %.lua, %.c, $^)

ifeq ($(EMBED), 0)
compile: $(BINOBJS) $(patsubst %.c, %.o, $(CSRCS)) 
	$(CC) -o colony -lm $^ 
else
compile: $(BINOBJS) $(patsubst %.c, %.o, $(CSRCS))
	arm-none-eabi-ar rcs libcolony.a $(filter-out src/cli.o,$^)
endif

# You don't even need to be explicit here,
# compiling C files is handled automagically by Make.
%.o: %.c
	$(CC) $(CFLAGS) $^ -o $@

clean: 
	-@rm -rf $(patsubst %.c, %.o, $(CSRCS)) $(BINOBJS) $(patsubst %.lua, %.c, $(BINSRCS)) 2>/dev/null || true