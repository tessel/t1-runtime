colony -l > /tmp/colony.lua
pushd ../../../lua2c52
lua lua2c.lua /tmp/colony.lua > /tmp/colony_lib.c
popd
mv /tmp/colony_lib.c colony/colony_lib.c
gcc -g runtime.c colony/colony.c colony/colony_lib.c tm/*.c ./lua-5.2.2/src/*.c -std=c99 -I./lua-5.2.2/src -Icolony -Itm -o runtime