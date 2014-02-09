#!/bin/bash
set -e
cd out/ARM
node -e "console.log('CREATE ' + process.argv[1]); console.log('ADDLIB', 'obj/lib' + process.argv.slice(2).join('.a\nADDLIB obj/lib') + '.a'); console.log('SAVE\nEND')" $@
node -e "console.log('CREATE ' + process.argv[1]); console.log('ADDLIB', 'obj/lib' + process.argv.slice(2).join('.a\nADDLIB obj/lib') + '.a'); console.log('SAVE\nEND')" $@ | arm-none-eabi-ar -M