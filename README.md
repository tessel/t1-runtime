**[UNMAINTAINED] This library does not have a maintainer. The source code and repository will be kept at this URL indefinitely. If you'd like to help maintain this codebase, create an issue on this repo explaining why you'd like to become a maintainer and tag @tessel/maintainers in the body.**

# Tessel Runtime

This is the runtime and JavaScript engine that runs on Tessel, built on Lua's VM. It can be run independently on PC or embedded.

Building the firmware requires [gyp](https://code.google.com/p/gyp/), and [ninja](http://martine.github.io/ninja/), and [gcc-arm-embedded](https://launchpad.net/gcc-arm-embedded) when building for embedded.

**Important note:**
*Because Colony uses your installed node version to generate deployment code, you have to know there could be different behaviours from different versions of Node.js (more: see make test on Ubuntu 14.04)*

#### OS X

To install quickly on a Mac with [Brew](http://brew.sh):

```
brew tap tessel/tools
brew install gyp ninja
brew install gcc-arm # to build for embedded
```

#### Ubuntu 14.04

All dependencies are in the Ubuntu 14.04 repositories:

```
sudo apt-get install build-essential libssl-dev
curl https://raw.githubusercontent.com/creationix/nvm/v0.16.1/install.sh | sh
nvm ls-remote
nvm install 0.12.3
nvm use 0.12.3
sudo apt-get install git nodejs-legacy gyp ninja-build gcc-arm-none-eabi # to build for embedded
```

## Building (PC or Embedded)

```
git clone https://github.com/tessel/runtime.git
cd runtime
make update
make colony
```

**Important note:**
Because Colony development started when Node.js version 0.10.13 was released, we run into challenge to stay compatible with following Node.js versions. 
The strategie we follow to transcompile to Lua-Bytecode forced us to implement new Node.js features or fixes manually.
Our test cases for Colony are done streight forward but you will see **different** [numbers of failing tests](https://github.com/tessel/t1-runtime/issues/727) what cause at low level code.
```
make test
```
Please notice the open issues to find known problems.

To link globally, run `npm link --local`. You can now run code on your PC using `colony` from your command line (e.g. `colony hello-world.js`). For building firmware, please see the [firmware building instructions](https://github.com/tessel/firmware).

**Troubleshooting:** If you're updating and have the error `fatal: destination path 'deps/colony-luajit' already exists and is not an empty directory.`, run `rm -rf deps/colony-luajit && make update`.

## Documentation for C

### Colony
Colony has support for interacting with the Lua API for handling basic JavaScript primitives. These are included via `colony.h`.

&#x20;<a href="#api-void-colony_createarray-lua_State-L-int-size-" name="api-void-colony_createarray-lua_State-L-int-size-">#</a> <i>void</i>&nbsp; <b>colony_createarray</b> ( <i>lua\_State\*</i>&nbsp; L, <i>int</i>&nbsp; size )  
Creates a new JavaScript array of length `size`. This sets the object prototype as well as the initial length of the array.

&#x20;<a href="#api-void-colony_createobj-lua_State-L-int-size-int-proto-" name="api-void-colony_createobj-lua_State-L-int-size-int-proto-">#</a> <i>void</i>&nbsp; <b>colony_createobj</b> ( <i>lua\_State\*</i>&nbsp; L, <i>int</i>&nbsp; size, <i>int</i>&nbsp; proto )  
Creates a new JavaScript object with an expected (but not required) allocation of `size` keys. This sets the object prototype as well. If `proto` is not zero (an invalid stack pointer), it points to an object on the stack to be used as the prototype for the newly created object.

## License

MIT or Apache 2.0, at your option.
