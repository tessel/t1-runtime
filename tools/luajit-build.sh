#!/bin/bash

set -e
cd deps/colony-luajit
make HOST_CFLAGS="-DLUAJIT_COLONY -g" TARGET_CFLAGS="-DLUAJIT_COLONY -g" || true
cd ../..
cp deps/colony-luajit/src/libluajit.a $1
