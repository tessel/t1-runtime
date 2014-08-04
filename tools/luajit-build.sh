#!/bin/bash

set -e
cd deps/luajit
make HOST_CFLAGS="-DLUAJIT_COLONY -g" TARGET_CFLAGS="-DLUAJIT_COLONY -g" || true
cd ../..
cp deps/luajit/src/libluajit.a $1
