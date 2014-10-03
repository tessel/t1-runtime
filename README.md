# tessel runtime

This is the runtime and JavaScript engine that runs on Tessel, built on Lua's VM. It can be run independently on PC or embedded.

```
git clone --recursive https://github.com/tessel/runtime.git
```

Building the firmware requires [gyp](https://code.google.com/p/gyp/), and [ninja](http://martine.github.io/ninja/), and [gcc-arm-embedded](https://launchpad.net/gcc-arm-embedded) when building for embedded.

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
sudo apt-get install git nodejs npm nodejs-legacy gyp ninja-build
sudo apt-get install gcc-arm-none-eabi # to build for embedded
```

## Building

```
npm install
npm install -g colony-compiler
make colony
npm link --local
npm test
```

You can now run code on your PC using `colony` from your command line (e.g. `colony hello-world.js`). For building firmware, please see the [firmware building instructions](https://github.com/tessel/firmware).

## Documentation for C

### Colony
Colony has support for interacting with the Lua API for handling basic JavaScript primitives. These are included via `colony.h`.

&#x20;<a href="#api-void-colony_createarray-lua_State-L-int-size-" name="api-void-colony_createarray-lua_State-L-int-size-">#</a> <i>void</i>&nbsp; <b>colony_createarray</b> ( <i>lua\_State\*</i>&nbsp; L, <i>int</i>&nbsp; size )  
Creates a new JavaScript array of length `size`. This sets the object prototype as well as the initial length of the array.

&#x20;<a href="#api-void-colony_createobj-lua_State-L-int-size-int-proto-" name="api-void-colony_createobj-lua_State-L-int-size-int-proto-">#</a> <i>void</i>&nbsp; <b>colony_createobj</b> ( <i>lua\_State\*</i>&nbsp; L, <i>int</i>&nbsp; size, <i>int</i>&nbsp; proto )  
Creates a new JavaScript object with an expected (but not required) allocation of `size` keys. This sets the object prototype as well. If `proto` is not zero (an invalid stack pointer), it points to an object on the stack to be used as the prototype for the newly created object.

## License

MIT or Apache 2.0, at your option.
