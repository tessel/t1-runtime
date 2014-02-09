# Let's shortcut all the things

.PHONY: all

all:

arm:
	AR=arm-none-eabi-ar AR_host=arm-none-eabi-ar AR_target=arm-none-eabi-ar CC=arm-none-eabi-gcc gyp colony.gyp --depth=. -f ninja-arm -R tm-arm
	ninja -v -C out/ARM

pc:
	gyp colony.gyp --depth=. -f ninja -R colony
	ninja -v -C out/Debug

clean:
	rm -rf out