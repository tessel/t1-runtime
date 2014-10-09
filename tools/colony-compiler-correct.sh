#!/bin/bash

if [ -a ./out/Release/colony ]; then
	:
else
	echo 'colony cannot be found! please make colony.'
	exit 1
fi

if [ "$(./out/Release/colony ./tools/colony-compiler-correct.js)" != "ok" ]; then
	echo 'colony-compiler cannot be found! make update and try again.'
	exit 1
fi
echo '(colony-compiler is in correct location.)'
exit 0
