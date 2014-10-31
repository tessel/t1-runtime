#!/bin/bash

if [ "$(uname)" == "Darwin" ]; then
	LJ_CC=gcc-4.9
else
	LJ_CC=gcc
fi

set -e
cd deps/colony-luajit
if [[ "$1" == "arm" ]]; then
	make HOST_CC="$LJ_CC -m32" HOST_CFLAGS="-DLUAJIT_COLONY -g" CROSS="arm-none-eabi-" TARGET_SYS=Other TARGET_CFLAGS="-DLUAJIT_COLONY -mcpu=cortex-m3 -mthumb -gdwarf-2 -ggdb -mfloat-abi=soft" TARGET_SYS=arm || true
else
	make HOST_CFLAGS="-DLUAJIT_COLONY -g" TARGET_CFLAGS="-DLUAJIT_COLONY -g" || true
fi
cd ../..
cp deps/colony-luajit/src/libluajit.a $2
