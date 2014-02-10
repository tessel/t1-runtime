# Let's shortcut all the things

arm : TARGET ?= tm-arm
pc : TARGET ?= colony

.PHONY: all

all:

arm:
	AR=arm-none-eabi-ar AR_host=arm-none-eabi-ar AR_target=arm-none-eabi-ar CC=arm-none-eabi-gcc gyp runtime.gyp --depth=. -f ninja-arm -R $(TARGET) -D builtin_section=.text --build ARM 

pc:
	gyp runtime.gyp --depth=. -f ninja -R $(TARGET) --build Debug

clean:
	ninja -v -C out/ARM -t clean
	ninja -v -C out/Debug -t clean

nuke: 
	rm -rf out