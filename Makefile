# Let's shortcut all the things

arm : TARGET ?= tessel-runtime
pc : TARGET ?= colony

CONFIG ?= Release

.PHONY: all

all:

arm:
	AR=arm-none-eabi-ar AR_host=arm-none-eabi-ar AR_target=arm-none-eabi-ar CC=arm-none-eabi-gcc gyp runtime.gyp --depth=. -f ninja-arm -R $(TARGET) -D builtin_section=.text --build $(CONFIG)

pc:
	gyp runtime.gyp --depth=. -f ninja -R $(TARGET) --build $(CONFIG)

clean:
	ninja -v -C out/Debug -t clean
	ninja -v -C out/Release -t clean

nuke: 
	rm -rf out