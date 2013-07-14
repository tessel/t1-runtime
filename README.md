# Colony, a low-memory JavaScript runtime built on Lua

Lua Colony compiles JavaScript to Lua 5.1 source code, and uses a small runtime library.

**Lua Colony is wicked slow.** It abuses the `debug` library heavily to emulate JavaScript semantics. Sacrificing speed, you get **an embeddable JavaScript engine in ANSI C.** Just be aware, Lua Colony **may not play nice with Lua's ecosystem**, so it should not be considered a way to write Lua code.


## Installation

```sh
$ npm install -g lua-colony
$ lua-colony examples/helloworld.js --bundle | lua
Hello world. Welcome to Lua Colony!
```

To run, put "colony-lib.lua" in your current folder (where you are running the `lua` command).


## Example

Lua Colony gives the Lua runtime JS's syntax and runtime library. Here's a slightly complicated Hello World in JS:

```javascript
console.log(["Hello", "world."].concat(["Welcome", "to", "colony"]).join(" ") + '!');
```

Compiled with Lua Colony:

```lua
local _JS = require('colony-js');
local string, math, print = nil, nil, nil;
local this, global, Object, Array, String, Math, require, console = _JS.this, _JS.global, _JS.Object, _JS.Array, _JS.String, _JS.Math, _JS.require, _JS.console;
local _module = {exports={}}; local exports = _module.exports;

console:log((_JS._arr({[0]=("Hello"), ("world.")}):concat(_JS._arr({[0]=("Welcome"), ("to"), ("colony")})):join((" ")) + ("!")));

return _module.exports;
```


### Module System

`require` is implemented with Node.js/CommonJS semantics. Lua Colony doesn't currently self-host, so you'll have to compile all code before importing it.


### Lua Interoperability

Lua Colony compiles to Lua source code, but may not play nice with Lua's ecosystem. Be aware of these caveats:

1. `require(...)` works the same as in Lua.
1. JavaScript methods compiled to Lua require a `this` argument as the first parameter.
    * Lua functions which call JavaScript function should pass a `this` object (which may be `nil`) as the first parameter.
    * Inversely, JavaScript calling Lua must pass the first argument as the `this` parameter; the most logical way to do this is using the `.call()` method: `func.call(arg0, arg1, arg2)`
    * `object.method(arg0, arg1)` in JavaScript maps to `object:method(arg0, arg1)` in Lua.
1. Arrays in JavaScript are indexed from 0, and Lua arrays are indexed from 1. Make sure to either push a dummy element using `.shift()` when calling Lua from JavaScript, and to explicitly assign the first array element in Lua to the 0 index (eg. in Lua: `{[0]='first element', 'second element', 'third...'}`)
1. Colony uses the debug library to replace the intrinsic metatables of functions, strings, booleans, and numbers. Functions, booleans, and numbers in Lua have no metatables by default, so this will only cause issues for string metatables, which is replaced entirely. The workaround is to ensure all included code explicitly calls the methods of the `string` object (eg. `string.len("apples")` vs `("apples"):len()`).


## License

miT