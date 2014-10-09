#!/bin/bash
# node-tap CDs into directory of tests. this invalidates
# __dirname and __filename lookup on PC. this is a decent
# workaround, better solved by replacing node-tap with
# behavior that uses the original relative paths.

ORIGINAL=$PWD
cd $(dirname $0)/..
RELATIVE=.${ORIGINAL#"$PWD"}
./out/Release/colony "$RELATIVE/$1"
