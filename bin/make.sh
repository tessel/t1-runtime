colony -l > /tmp/colony.lua
pushd ../../lua2c52
lua lua2c.lua /tmp/colony.lua > /tmp/colony_lib.c
popd
mv /tmp/colony_lib.c colony_lib.c
gcc -g runtime.c colony.c colony_lib.c tm_task.c ./lua-5.2.2/src/*.c -I./lua-5.2.2/src -o runtime