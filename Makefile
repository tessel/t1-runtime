ENABLE_TLS ?= 1
ENABLE_NET ?= 1
ENABLE_LUAJIT ?= 0

# Update when targeting new Node build.
NODE_VERSION ?= 0.10.32

CONFIG ?= Release

ifeq ($(ARM),1)
	compile = \
		AR=arm-none-eabi-ar AR_host=arm-none-eabi-ar AR_target=arm-none-eabi-ar CC=arm-none-eabi-gcc CXX=arm-none-eabi-g++ gyp $(1) --depth=. -f ninja-arm -D builtin_section=.rodata -D enable_ssl=$(ENABLE_TLS) -D enable_net=$(ENABLE_NET) &&\
		ninja -C out/$(CONFIG)
else
    compile = \
        gyp $(1) --depth=. -f ninja -D enable_ssl=$(ENABLE_TLS) -D enable_net=$(ENABLE_NET) -D enable_luajit=$(ENABLE_LUAJIT) -D compiler_path="$(shell pwd)/node_modules/colony-compiler/bin/colony-compiler.js" &&\
		ninja -C out/$(CONFIG)
endif

.PHONY: all test test-colony test-node luajit-check

all: colony

clean: clean-luajit
	ninja -v -C out/Debug -t clean
	ninja -v -C out/Release -t clean

clean-luajit:
	make -C deps/colony-luajit clean || true
	rm out/Release/obj/colony-lua.gen/libluajit.o || true
	touch deps/colony-luajit/src/Makefile || true

nuke:
	rm -rf out build

update:
	git submodule update --init --recursive
	npm install

test: test-node test-colony

test-colony:
	@echo "colony testbench:"
	@./node_modules/.bin/tap -e './tools/tap-colony.sh' test/suite/*.js test/colony/*.js  test/issues/*.js test/net/*.js

test-node:
	@echo "node testbench:"
	@./node_modules/.bin/tap -e node test/suite/*.js test/issues/*.js test/net/*.js

update-node-libs:
	rm -rf deps/node-libs || true
	mkdir -p deps/node-libs
	cd deps/node-libs; curl -L https://github.com/joyent/node/archive/v$(NODE_VERSION).tar.gz | tar xvf - --strip-components=2 node-$(NODE_VERSION)/lib

luajit-check:
	objdump -G deps/colony-luajit/src/libluajit.a > /dev/null || make -C deps/colony-luajit clean || true
	touch deps/colony-luajit/Makefile

# Targets

libcolony:
	$(call compile, libcolony.gyp)

colony: luajit-check
	$(call compile, colony.gyp)

libtm-test:
	$(call compile, libtm-test.gyp)
	./out/Release/libtm-test

libtm:
	$(call compile, libtm.gyp)


# Compiler Targets

compile-axtls:
	gyp libtm.gyp --depth=. -f ninja -D enable_ssl=1 -R tm-ssl
	ninja -C out/$(CONFIG)
