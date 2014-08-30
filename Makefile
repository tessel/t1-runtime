ENABLE_TLS ?= 1
ENABLE_NET ?= 1

CONFIG ?= Release

ifeq ($(ARM),1)
	compile = \
		AR=arm-none-eabi-ar AR_host=arm-none-eabi-ar AR_target=arm-none-eabi-ar CC=arm-none-eabi-gcc gyp $(1) --depth=. -f ninja-arm -D builtin_section=.rodata -D enable_ssl=$(ENABLE_TLS) -D enable_net=$(ENABLE_NET) &&\
		ninja -C out/$(CONFIG)
else
    compile = \
        gyp $(1) --depth=. -f ninja -D enable_ssl=$(ENABLE_TLS) -D enable_net=$(ENABLE_NET) &&\
		ninja -C out/$(CONFIG)
endif

.PHONY: all

all:

clean:
	ninja -v -C out/Debug -t clean
	ninja -v -C out/Release -t clean
	cd deps/colony-luajit; make clean

nuke:
	rm -rf out build

update:
	git submodule update --init --recursive
	npm install


# Targets

libcolony:
	$(call compile, libcolony.gyp)

colony:
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
