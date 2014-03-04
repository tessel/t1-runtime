// Note: For maximum-speed code, see "Optimizing Code" on the Emscripten wiki, https://github.com/kripken/emscripten/wiki/Optimizing-Code
// Note: Some Emscripten settings may limit the speed of the generated code.
// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  Module['arguments'] = process['argv'].slice(2);

  module['exports'] = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    return read(f, 'binary');
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  this['Module'] = Module;

  eval("if (typeof gc === 'function' && gc.toString().indexOf('[native code]') > 0) var gc = undefined"); // wipe out the SpiderMonkey shell 'gc' function, which can confuse closure (uses it as a minified name, and it is then initted to a non-falsey value unexpectedly)
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WEB) {
    this['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Auto-generated preamble library stuff ===

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?\{ ?[^}]* ?\}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (vararg) return 8;
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_ && type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    code = Pointer_stringify(code);
    if (code[0] === '"') {
      // tolerate EM_ASM("..code..") even though EM_ASM(..code..) is correct
      if (code.indexOf('"', 1) === code.length-1) {
        code = code.substr(1, code.length-2);
      } else {
        // something invalid happened, e.g. EM_ASM("..code($0)..", input)
        abort('invalid EM_ASM input |' + code + '|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)');
      }
    }
    return Runtime.asmConstCache[code] = eval('(function(' + args.join(',') + '){ ' + code + ' })'); // new Function does not allow upvars in node
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;

      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }

      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }

      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  getCompilerSetting: function (name) {
    throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work';
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*(+4294967296))) : ((+((low>>>0)))+((+((high|0)))*(+4294967296)))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}


Module['Runtime'] = Runtime;









//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      value = intArrayFromString(value);
      type = 'array';
    }
    if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}

// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;

// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;

// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module['allocate'] = allocate;

function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }

  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;

// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;

function demangle(func) {
  var i = 3;
  // params, etc.
  var basicTypes = {
    'v': 'void',
    'b': 'bool',
    'c': 'char',
    's': 'short',
    'i': 'int',
    'l': 'long',
    'f': 'float',
    'd': 'double',
    'w': 'wchar_t',
    'a': 'signed char',
    'h': 'unsigned char',
    't': 'unsigned short',
    'j': 'unsigned int',
    'm': 'unsigned long',
    'x': 'long long',
    'y': 'unsigned long long',
    'z': '...'
  };
  var subs = [];
  var first = true;
  function dump(x) {
    //return;
    if (x) Module.print(x);
    Module.print(func);
    var pre = '';
    for (var a = 0; a < i; a++) pre += ' ';
    Module.print (pre + '^');
  }
  function parseNested() {
    i++;
    if (func[i] === 'K') i++; // ignore const
    var parts = [];
    while (func[i] !== 'E') {
      if (func[i] === 'S') { // substitution
        i++;
        var next = func.indexOf('_', i);
        var num = func.substring(i, next) || 0;
        parts.push(subs[num] || '?');
        i = next+1;
        continue;
      }
      if (func[i] === 'C') { // constructor
        parts.push(parts[parts.length-1]);
        i += 2;
        continue;
      }
      var size = parseInt(func.substr(i));
      var pre = size.toString().length;
      if (!size || !pre) { i--; break; } // counter i++ below us
      var curr = func.substr(i + pre, size);
      parts.push(curr);
      subs.push(curr);
      i += pre + size;
    }
    i++; // skip E
    return parts;
  }
  function parse(rawList, limit, allowVoid) { // main parser
    limit = limit || Infinity;
    var ret = '', list = [];
    function flushList() {
      return '(' + list.join(', ') + ')';
    }
    var name;
    if (func[i] === 'N') {
      // namespaced N-E
      name = parseNested().join('::');
      limit--;
      if (limit === 0) return rawList ? [name] : name;
    } else {
      // not namespaced
      if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
      var size = parseInt(func.substr(i));
      if (size) {
        var pre = size.toString().length;
        name = func.substr(i + pre, size);
        i += pre + size;
      }
    }
    first = false;
    if (func[i] === 'I') {
      i++;
      var iList = parse(true);
      var iRet = parse(true, 1, true);
      ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
    } else {
      ret = name;
    }
    paramLoop: while (i < func.length && limit-- > 0) {
      //dump('paramLoop');
      var c = func[i++];
      if (c in basicTypes) {
        list.push(basicTypes[c]);
      } else {
        switch (c) {
          case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
          case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
          case 'L': { // literal
            i++; // skip basic type
            var end = func.indexOf('E', i);
            var size = end - i;
            list.push(func.substr(i, size));
            i += size + 2; // size + 'EE'
            break;
          }
          case 'A': { // array
            var size = parseInt(func.substr(i));
            i += size.toString().length;
            if (func[i] !== '_') throw '?';
            i++; // skip _
            list.push(parse(true, 1, true)[0] + ' [' + size + ']');
            break;
          }
          case 'E': break paramLoop;
          default: ret += '?' + c; break paramLoop;
        }
      }
    }
    if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
    return rawList ? list : ret + flushList();
  }
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    return parse();
  } catch(e) {
    return func;
  }
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function stackTrace() {
  var stack = new Error().stack;
  return stack ? demangleAll(stack) : '(no stack trace available)'; // Stack trace is not available at least on IE10 and Safari 6.
}

// Memory management

var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk

function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}

var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;

var totalMemory = 4096;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be more reasonable');
  TOTAL_MEMORY = totalMemory;
}

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'JS engine does not provide full typed array support');

var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);

// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;

function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;

// Tools

// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;

// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))|0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data


var memoryInitializer = null;

// === Body ===



STATIC_BASE = 8;

STATICTOP = STATIC_BASE + 3872;


/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } });

var _stderr;
var _stderr=_stderr=allocate(1, "i32*", ALLOC_STATIC);























































































































































































































































































































































/* memory initializer */ allocate([6,6,6,6,7,7,7,7,7,7,10,9,5,4,3,3,3,3,3,3,3,3,3,3,3,3,2,2,1,1,0,0,240,7,0,0,232,11,0,0,144,9,0,0,152,7,0,0,24,6,0,0,32,5,0,0,152,4,0,0,224,3,0,0,104,3,0,0,0,3,0,0,16,13,0,0,176,12,0,0,48,12,0,0,224,11,0,0,128,11,0,0,64,11,0,0,8,11,0,0,192,10,0,0,104,10,0,0,64,10,0,0,24,10,0,0,248,9,0,0,176,9,0,0,80,9,0,0,40,9,0,0,216,8,0,0,128,8,0,0,32,8,0,0,232,7,0,0,216,7,0,0,208,7,0,0,0,0,0,0,144,4,0,0,0,11,0,0,112,8,0,0,16,7,0,0,128,5,0,0,240,4,0,0,40,4,0,0,112,8,0,0,192,3,0,0,64,3,0,0,224,2,0,0,0,0,0,0,224,12,0,0,88,12,0,0,240,11,0,0,144,11,0,0,96,11,0,0,40,11,0,0,248,10,0,0,136,10,0,0,72,10,0,0,40,10,0,0,0,10,0,0,208,9,0,0,152,9,0,0,56,9,0,0,16,9,0,0,152,8,0,0,88,8,0,0,0,0,0,0,96,113,84,96,80,113,108,49,16,60,84,108,124,124,124,124,124,124,96,96,96,104,34,188,188,188,228,228,84,84,16,98,98,132,20,0,81,80,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,2,3,3,3,3,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,95,112,137,0,255,9,47,15,10,0,0,0,100,0,0,0,232,3,0,0,16,39,0,0,160,134,1,0,64,66,15,0,128,150,152,0,0,225,245,5,39,102,111,114,39,32,115,116,101,112,32,109,117,115,116,32,98,101,32,97,32,110,117,109,98,101,114,0,0,0,0,0,37,115,58,32,37,115,32,105,110,32,112,114,101,99,111,109,112,105,108,101,100,32,99,104,117,110,107,0,0,0,0,0,117,112,118,97,108,0,0,0,105,116,101,109,115,32,105,110,32,97,32,99,111,110,115,116,114,117,99,116,111,114,0,0,105,102,0,0,0,0,0,0,102,105,101,108,100,0,0,0,39,102,111,114,39,32,108,105,109,105,116,32,109,117,115,116,32,98,101,32,97,32,110,117,109,98,101,114,0,0,0,0,98,97,100,32,105,110,116,101,103,101,114,0,0,0,0,0,112,114,111,116,111,0,0,0,116,111,111,32,109,97,110,121,32,108,111,99,97,108,32,118,97,114,105,97,98,108,101,115,0,0,0,0,0,0,0,0,102,117,110,99,116,105,111,110,0,0,0,0,0,0,0,0,99,97,108,108,0,0,0,0,103,108,111,98,97,108,0,0,39,102,111,114,39,32,105,110,105,116,105,97,108,32,118,97,108,117,101,32,109,117,115,116,32,98,101,32,97,32,110,117,109,98,101,114,0,0,0,0,98,97,100,32,99,111,110,115,116,97,110,116,0,0,0,0,116,104,114,101,97,100,0,0,108,111,99,97,108,32,118,97,114,105,97,98,108,101,115,0,34,93,0,0,0,0,0,0,102,111,114,0,0,0,0,0,110,0,0,0,0,0,0,0,108,111,99,97,108,0,0,0,105,110,102,105,110,105,116,121,0,0,0,0,0,0,0,0,103,101,116,32,108,101,110,103,116,104,32,111,102,0,0,0,117,110,101,120,112,101,99,116,101,100,32,101,110,100,0,0,102,117,110,99,116,105,111,110,0,0,0,0,0,0,0,0,102,117,110,99,116,105,111,110,32,111,114,32,101,120,112,114,101,115,115,105,111,110,32,116,111,111,32,99,111,109,112,108,101,120,0,0,0,0,0,0,60,110,97,109,101,62,32,111,114,32,39,46,46,46,39,32,101,120,112,101,99,116,101,100,0,0,0,0,0,0,0,0,91,115,116,114,105,110,103,32,34,0,0,0,0,0,0,0,110,105,108,0,0,0,0,0,102,97,108,115,101,0,0,0,115,116,97,99,107,32,111,118,101,114,102,108,111,119,0,0,37,115,58,37,100,58,32,37,115,0,0,0,0,0,0,0,116,97,98,108,101,32,105,110,100,101,120,32,105,115,32,110,105,108,0,0,0,0,0,0,115,116,114,105,110,103,32,108,101,110,103,116,104,32,111,118,101,114,102,108,111,119,0,0,116,97,98,108,101,0,0,0,97,114,103,0,0,0,0,0,110,111,116,32,101,110,111,117,103,104,32,109,101,109,111,114,121,0,0,0,0,0,0,0,10,13,0,0,0,0,0,0,101,110,100,0,0,0,0,0,115,121,110,116,97,120,32,101,114,114,111,114,0,0,0,0,97,116,116,101,109,112,116,32,116,111,32,99,111,109,112,97,114,101,32,37,115,32,119,105,116,104,32,37,115,0,0,0,108,111,111,112,32,105,110,32,115,101,116,116,97,98,108,101,0,0,0,0,0,0,0,0,98,97,100,32,99,111,100,101,0,0,0,0,0,0,0,0,115,116,114,105,110,103,0,0,99,104,117,110,107,32,104,97,115,32,116,111,111,32,109,97,110,121,32,108,105,110,101,115,0,0,0,0,0,0,0,0,110,101,115,116,105,110,103,32,111,102,32,91,91,46,46,46,93,93,32,105,115,32,100,101,112,114,101,99,97,116,101,100,0,0,0,0,0,0,0,0,99,111,110,115,116,97,110,116,32,116,97,98,108,101,32,111,118,101,114,102,108,111,119,0,117,110,102,105,110,105,115,104,101,100,32,108,111,110,103,32,99,111,109,109,101,110,116,0,117,110,102,105,110,105,115,104,101,100,32,108,111,110,103,32,115,116,114,105,110,103,0,0,101,108,115,101,105,102,0,0,101,115,99,97,112,101,32,115,101,113,117,101,110,99,101,32,116,111,111,32,108,97,114,103,101,0,0,0,0,0,0,0,97,116,116,101,109,112,116,32,116,111,32,99,111,109,112,97,114,101,32,116,119,111,32,37,115,32,118,97,108,117,101,115,0,0,0,0,0,0,0,0,117,110,102,105,110,105,115,104,101,100,32,115,116,114,105,110,103,0,0,0,0,0,0,0,108,101,120,105,99,97,108,32,101,108,101,109,101,110,116,32,116,111,111,32,108,111,110,103,0,0,0,0,0,0,0,0,109,97,108,102,111,114,109,101,100,32,110,117,109,98,101,114,0,0,0,0,0,0,0,0,43,45,0,0,0,0,0,0,69,101,0,0,0,0,0,0,108,111,111,112,32,105,110,32,103,101,116,116,97,98,108,101,0,0,0,0,0,0,0,0,99,111,110,116,114,111,108,32,115,116,114,117,99,116,117,114,101,32,116,111,111,32,108,111,110,103,0,0,0,0,0,0,99,111,100,101,32,116,111,111,32,100,101,101,112,0,0,0,110,117,109,98,101,114,0,0,109,101,109,111,114,121,32,97,108,108,111,99,97,116,105,111,110,32,101,114,114,111,114,58,32,98,108,111,99,107,32,116,111,111,32,98,105,103,0,0,46,0,0,0,0,0,0,0,105,110,118,97,108,105,100,32,108,111,110,103,32,115,116,114,105,110,103,32,100,101,108,105,109,105,116,101,114,0,0,0,115,101,108,102,0,0,0,0,37,115,32,110,101,97,114,32,39,37,115,39,0,0,0,0,37,0,0,0,0,0,0,0,37,115,58,37,100,58,32,37,115,0,0,0,0,0,0,0,101,108,115,101,0,0,0,0,37,99,0,0,0,0,0,0,112,101,114,102,111,114,109,32,97,114,105,116,104,109,101,116,105,99,32,111,110,0,0,0,99,104,97,114,40,37,100,41,0,0,0,0,0,0,0,0,60,101,111,102,62,0,0,0,60,115,116,114,105,110,103,62,0,0,0,0,0,0,0,0,60,110,97,109,101,62,0,0,97,110,100,0,0,0,0,0,99,104,117,110,107,32,104,97,115,32,116,111,111,32,109,97,110,121,32,115,121,110,116,97,120,32,108,101,118,101,108,115,0,0,0,0,0,0,0,0,60,110,117,109,98,101,114,62,0,0,0,0,0,0,0,0,105,110,100,101,120,0,0,0,99,111,110,115,116,97,110,116,32,116,97,98,108,101,32,111,118,101,114,102,108,111,119,0,61,63,0,0,0,0,0,0,95,95,99,97,108,108,0,0,39,37,115,39,32,101,120,112,101,99,116,101,100,0,0,0,117,115,101,114,100,97,116,97,0,0,0,0,0,0,0,0,126,61,0,0,0,0,0,0,116,97,98,108,101,32,111,118,101,114,102,108,111,119,0,0,95,95,99,111,110,99,97,116,0,0,0,0,0,0,0,0,39,37,115,39,32,101,120,112,101,99,116,101,100,32,40,116,111,32,99,108,111,115,101,32,39,37,115,39,32,97,116,32,108,105,110,101,32,37,100,41,0,0,0,0,0,0,0,0,60,61,0,0,0,0,0,0,99,97,110,110,111,116,32,117,115,101,32,39,46,46,46,39,32,111,117,116,115,105,100,101,32,97,32,118,97,114,97,114,103,32,102,117,110,99,116,105,111,110,0,0,0,0,0,0,95,95,108,101,0,0,0,0,40,102,111,114,32,115,116,101,112,41,0,0,0,0,0,0,62,61,0,0,0,0,0,0,37,112,0,0,0,0,0,0,95,95,108,116,0,0,0,0,40,102,111,114,32,108,105,109,105,116,41,0,0,0,0,0,61,61,0,0,0,0,0,0,80,65,78,73,67,58,32,117,110,112,114,111,116,101,99,116,101,100,32,101,114,114,111,114,32,105,110,32,99,97,108,108,32,116,111,32,76,117,97,32,65,80,73,32,40,37,115,41,10,0,0,0,0,0,0,0,100,111,0,0,0,0,0,0,95,95,108,101,110,0,0,0,40,102,111,114,32,105,110,100,101,120,41,0,0,0,0,0,46,46,46,0,0,0,0,0,67,32,115,116,97,99,107,32,111,118,101,114,102,108,111,119,0,0,0,0,0,0,0,0,95,95,117,110,109,0,0,0,40,102,111,114,32,99,111,110,116,114,111,108,41,0,0,0,99,111,110,99,97,116,101,110,97,116,101,0,0,0,0,0,46,46,0,0,0,0,0,0,95,95,112,111,119,0,0,0,40,102,111,114,32,115,116,97,116,101,41,0,0,0,0,0,119,104,105,108,101,0,0,0,63,0,0,0,0,0,0,0,95,95,109,111,100,0,0,0,40,102,111,114,32,103,101,110,101,114,97,116,111,114,41,0,117,110,116,105,108,0,0,0,95,95,100,105,118,0,0,0,39,61,39,32,111,114,32,39,105,110,39,32,101,120,112,101,99,116,101,100,0,0,0,0,116,114,117,101,0,0,0,0,110,97,110,0,0,0,0,0,123,32,79,75,65,89,40,36,48,41,59,32,125,0,0,0,95,95,109,117,108,0,0,0,110,111,116,32,101,110,111,117,103,104,32,109,101,109,111,114,121,0,0,0,0,0,0,0,110,111,32,108,111,111,112,32,116,111,32,98,114,101,97,107,0,0,0,0,0,0,0,0,116,104,101,110,0,0,0,0,37,46,49,52,103,0,0,0,98,105,110,97,114,121,32,115,116,114,105,110,103,0,0,0,99,111,100,101,32,115,105,122,101,32,111,118,101,114,102,108,111,119,0,0,0,0,0,0,95,95,115,117,98,0,0,0,98,111,111,108,101,97,110,0,114,101,116,117,114,110,0,0,116,97,98,108,101,32,105,110,100,101,120,32,105,115,32,78,97,78,0,0,0,0,0,0,95,95,97,100,100,0,0,0,117,112,118,97,108,117,101,115,0,0,0,0,0,0,0,0,114,101,112,101,97,116,0,0,118,97,114,105,97,98,108,101,115,32,105,110,32,97,115,115,105,103,110,109,101,110,116,0,95,95,101,113,0,0,0,0,117,110,101,120,112,101,99,116,101,100,32,115,121,109,98,111,108,0,0,0,0,0,0,0,111,114,0,0,0,0,0,0,40,110,117,108,108,41,0,0,95,95,109,111,100,101,0,0,102,117,110,99,116,105,111,110,32,97,114,103,117,109,101,110,116,115,32,101,120,112,101,99,116,101,100,0,0,0,0,0,97,116,116,101,109,112,116,32,116,111,32,37,115,32,37,115,32,39,37,115,39,32,40,97,32,37,115,32,118,97,108,117,101,41,0,0,0,0,0,0,110,111,116,0,0,0,0,0,98,114,101,97,107,0,0,0,95,95,103,99,0,0,0,0,97,109,98,105,103,117,111,117,115,32,115,121,110,116,97,120,32,40,102,117,110,99,116,105,111,110,32,99,97,108,108,32,120,32,110,101,119,32,115,116,97,116,101,109,101,110,116,41,0,0,0,0,0,0,0,0,110,105,108,0,0,0,0,0,109,101,116,104,111,100,0,0,101,114,114,111,114,32,105,110,32,101,114,114,111,114,32,104,97,110,100,108,105,110,103,0,95,95,110,101,119,105,110,100,101,120,0,0,0,0,0,0,102,117,110,99,116,105,111,110,32,97,116,32,108,105,110,101,32,37,100,32,104,97,115,32,109,111,114,101,32,116,104,97,110,32,37,100,32,37,115,0,97,116,116,101,109,112,116,32,116,111,32,37,115,32,97,32,37,115,32,118,97,108,117,101,0,0,0,0,0,0,0,0,108,111,99,97,108,0,0,0,117,112,118,97,108,117,101,0,95,95,116,111,118,97,108,117,101,0,0,0,0,0,0,0,98,97,100,32,104,101,97,100,101,114,0,0,0,0,0,0,95,95,105,110,100,101,120,0,109,97,105,110,32,102,117,110,99,116,105,111,110,32,104,97,115,32,109,111,114,101,32,116,104,97,110,32,37,100,32,37,115,0,0,0,0,0,0,0,105,110,0,0,0,0,0,0,63,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);



var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}


   
  Module["_strlen"] = _strlen;

  var _llvm_va_start=undefined;

  function _llvm_va_end() {}

  function _llvm_lifetime_start() {}

  function _llvm_lifetime_end() {}

  function _strchr(ptr, chr) {
      ptr--;
      do {
        ptr++;
        var val = HEAP8[(ptr)];
        if (val == chr) return ptr;
      } while (val);
      return 0;
    }

  
  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    } 
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;

  
  
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }
  
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  
  var MEMFS={ops_table:null,CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            if (canOwn && offset === 0) {
              node.contents = buffer; // this could be a subarray of Emscripten HEAP, or allocated from some other source.
              node.contentMode = (buffer.buffer === HEAP8.buffer) ? MEMFS.CONTENT_OWNING : MEMFS.CONTENT_FIXED;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  
  var IDBFS={dbs:{},indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        // reuse all of the core MEMFS functionality
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
  
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
  
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
  
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },getDB:function (name, callback) {
        // check the cache first
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
  
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return callback(e);
        }
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          var transaction = e.target.transaction;
  
          var fileStore;
  
          if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
            fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
          } else {
            fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
          }
  
          fileStore.createIndex('timestamp', 'timestamp', { unique: false });
        };
        req.onsuccess = function() {
          db = req.result;
  
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function() {
          callback(this.error);
        };
      },getLocalSet:function (mount, callback) {
        var entries = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat;
  
          try {
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
          }
  
          entries[path] = { timestamp: stat.mtime };
        }
  
        return callback(null, { type: 'local', entries: entries });
      },getRemoteSet:function (mount, callback) {
        var entries = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function() { callback(this.error); };
  
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          var index = store.index('timestamp');
  
          index.openKeyCursor().onsuccess = function(event) {
            var cursor = event.target.result;
  
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, entries: entries });
            }
  
            entries[cursor.primaryKey] = { timestamp: cursor.key };
  
            cursor.continue();
          };
        });
      },loadLocalEntry:function (path, callback) {
        var stat, node;
  
        try {
          var lookup = FS.lookupPath(path);
          node = lookup.node;
          stat = FS.stat(path);
        } catch (e) {
          return callback(e);
        }
  
        if (FS.isDir(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode });
        } else if (FS.isFile(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode, contents: node.contents });
        } else {
          return callback(new Error('node type not supported'));
        }
      },storeLocalEntry:function (path, entry, callback) {
        try {
          if (FS.isDir(entry.mode)) {
            FS.mkdir(path, entry.mode);
          } else if (FS.isFile(entry.mode)) {
            FS.writeFile(path, entry.contents, { encoding: 'binary', canOwn: true });
          } else {
            return callback(new Error('node type not supported'));
          }
  
          FS.utime(path, entry.timestamp, entry.timestamp);
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },removeLocalEntry:function (path, callback) {
        try {
          var lookup = FS.lookupPath(path);
          var stat = FS.stat(path);
  
          if (FS.isDir(stat.mode)) {
            FS.rmdir(path);
          } else if (FS.isFile(stat.mode)) {
            FS.unlink(path);
          }
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },loadRemoteEntry:function (store, path, callback) {
        var req = store.get(path);
        req.onsuccess = function(event) { callback(null, event.target.result); };
        req.onerror = function() { callback(this.error); };
      },storeRemoteEntry:function (store, path, entry, callback) {
        var req = store.put(entry, path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },removeRemoteEntry:function (store, path, callback) {
        var req = store.delete(path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = [];
        Object.keys(src.entries).forEach(function (key) {
          var e = src.entries[key];
          var e2 = dst.entries[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create.push(key);
            total++;
          }
        });
  
        var remove = [];
        Object.keys(dst.entries).forEach(function (key) {
          var e = dst.entries[key];
          var e2 = src.entries[key];
          if (!e2) {
            remove.push(key);
            total++;
          }
        });
  
        if (!total) {
          return callback(null);
        }
  
        var errored = false;
        var completed = 0;
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        transaction.onerror = function() { done(this.error); };
  
        // sort paths in ascending order so directory entries are created
        // before the files inside them
        create.sort().forEach(function (path) {
          if (dst.type === 'local') {
            IDBFS.loadRemoteEntry(store, path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeLocalEntry(path, entry, done);
            });
          } else {
            IDBFS.loadLocalEntry(path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeRemoteEntry(store, path, entry, done);
            });
          }
        });
  
        // sort paths in descending order so files are deleted before their
        // parent directories
        remove.sort().reverse().forEach(function(path) {
          if (dst.type === 'local') {
            IDBFS.removeLocalEntry(path, done);
          } else {
            IDBFS.removeRemoteEntry(store, path, done);
          }
        });
      }};
  
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
  
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
  
          stream.position = position;
          return position;
        }}};
  
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || {};
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        for (var key in defaults) {
          if (opts[key] === undefined) {
            opts[key] = defaults[key];
          }
        }
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
  
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            this.mounted = null;
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
          };
  
          FS.FSNode.prototype = {};
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
  
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return !!node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        if (stream.__proto__) {
          // reuse the object
          stream.__proto__ = FS.FSStream.prototype;
        } else {
          var newStream = new FS.FSStream();
          for (var p in stream) {
            newStream[p] = stream[p];
          }
          stream = newStream;
        }
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },getStreamFromPtr:function (ptr) {
        return FS.streams[ptr - 1];
      },getPtrForStream:function (stream) {
        return stream ? stream.fd + 1 : 0;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },getMounts:function (mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= mounts.length) {
            callback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach(function (mount) {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:function (type, opts, mountpoint) {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach(function (hash) {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.indexOf(current.mount) !== -1) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0, opts.canOwn);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0, opts.canOwn);
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=FS.getPtrForStream(stdin);
        assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
  
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=FS.getPtrForStream(stdout);
        assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
  
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=FS.getPtrForStream(stderr);
        assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          function LazyUint8Array() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
  
              if (!hasByteServing) chunkSize = datalength;
  
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
  
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
  
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
  
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};
  
  
  
  
  function _mkport() { throw 'TODO' }var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createSocket:function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }
  
        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
  
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
  
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: FS.modeStringToFlags('r+'),
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
  
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
  
        return sock;
      },getSocket:function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },websocket_sock_ops:{createPeer:function (sock, addr, port) {
          var ws;
  
          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
  
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              var url = 'ws://' + addr + ':' + port;
              // the node ws library API is slightly different than the browser's
              var opts = ENVIRONMENT_IS_NODE ? {headers: {'websocket-protocol': ['binary']}} : ['binary'];
              // If node we use the ws library.
              var WebSocket = ENVIRONMENT_IS_NODE ? require('ws') : window['WebSocket'];
              ws = new WebSocket(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
            }
          }
  
  
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };
  
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
  
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
  
          return peer;
        },getPeer:function (sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function (sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function (sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function (sock, peer) {
          var first = true;
  
          var handleOpen = function () {
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
  
          function handleMessage(data) {
            assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
            data = new Uint8Array(data);  // make a typed array view on the array buffer
  
  
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
  
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
          };
  
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('error', function() {
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onmessage = function peer_socket_onmessage(event) {
              handleMessage(event.data);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (64 | 1) : 0;
          }
  
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
  
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (64 | 1);
          }
  
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }
  
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
  
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 21531:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)]=bytes;
              return 0;
            default:
              return ERRNO_CODES.EINVAL;
          }
        },close:function (sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function (sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port || _mkport();
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
            }
          }
        },connect:function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(ERRNO_CODS.EOPNOTSUPP);
          }
  
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
  
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
              } else {
                throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
              }
            }
          }
  
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
  
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
        },listen:function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          if (sock.server) {
             throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });
  
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
  
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
  
              // push to queue for accept to pick up
              sock.pending.push(newsock);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
            }
          });
          sock.server.on('closed', function() {
            sock.server = null;
          });
          sock.server.on('error', function() {
            // don't throw
          });
        },accept:function (listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
  
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
  
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          var data;
          if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
            data = buffer.slice(offset, offset + length);
          } else {  // ArrayBufferView
            data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
          }
  
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
  
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },recvmsg:function (sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
          }
  
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
  
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
            } else {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
  
  
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
  
          return res;
        }}};function _send(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _write(fd, buf, len);
    }
  
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  
  function _fileno(stream) {
      // int fileno(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fileno.html
      return FS.getStreamFromPtr(stream).fd;
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var fd = _fileno(stream);
      var bytesWritten = _write(fd, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStreamFromPtr(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  
  
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
  
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
  
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          var flagPadSign = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              case 32:
                flagPadSign = true;
                break;
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
  
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
  
          // Handle precision.
          var precisionSet = false, precision = -1;
          if (next == 46) {
            precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          }
          if (precision < 0) {
            precision = 6; // Standard default.
            precisionSet = false;
          }
  
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
  
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
  
              // Add sign if needed
              if (currArg >= 0) {
                if (flagAlwaysSigned) {
                  prefix = '+' + prefix;
                } else if (flagPadSign) {
                  prefix = ' ' + prefix;
                }
              }
  
              // Move sign to prefix so we zero-pad after the sign
              if (argText.charAt(0) == '-') {
                prefix = '-' + prefix;
                argText = argText.substr(1);
              }
  
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
  
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
  
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
  
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
  
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
  
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
  
                // Add sign.
                if (currArg >= 0) {
                  if (flagAlwaysSigned) {
                    argText = '+' + argText;
                  } else if (flagPadSign) {
                    argText = ' ' + argText;
                  }
                }
              }
  
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
  
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
  
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length;
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }

  function ___errno_location() {
      return ___errno_state;
    }

  
  
  function _isspace(chr) {
      return (chr == 32) || (chr >= 9 && chr <= 13);
    }function __parseInt(str, endptr, base, min, max, bits, unsign) {
      // Skip space.
      while (_isspace(HEAP8[(str)])) str++;
  
      // Check for a plus/minus sign.
      var multiplier = 1;
      if (HEAP8[(str)] == 45) {
        multiplier = -1;
        str++;
      } else if (HEAP8[(str)] == 43) {
        str++;
      }
  
      // Find base.
      var finalBase = base;
      if (!finalBase) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            finalBase = 16;
            str += 2;
          } else {
            finalBase = 8;
            str++;
          }
        }
      } else if (finalBase==16) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            str += 2;
          }
        }
      }
      if (!finalBase) finalBase = 10;
  
      // Get digits.
      var chr;
      var ret = 0;
      while ((chr = HEAP8[(str)]) != 0) {
        var digit = parseInt(String.fromCharCode(chr), finalBase);
        if (isNaN(digit)) {
          break;
        } else {
          ret = ret * finalBase + digit;
          str++;
        }
      }
  
      // Apply sign.
      ret *= multiplier;
  
      // Set end pointer.
      if (endptr) {
        HEAP32[((endptr)>>2)]=str;
      }
  
      // Unsign if needed.
      if (unsign) {
        if (Math.abs(ret) > max) {
          ret = max;
          ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          ret = unSign(ret, bits);
        }
      }
  
      // Validate range.
      if (ret > max || ret < min) {
        ret = ret > max ? max : min;
        ___setErrNo(ERRNO_CODES.ERANGE);
      }
  
      if (bits == 64) {
        return ((asm["setTempRet0"]((tempDouble=ret,(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)),ret>>>0)|0);
      }
  
      return ret;
    }function _strtoul(str, endptr, base) {
      return __parseInt(str, endptr, base, 0, 4294967295, 32, true);  // ULONG_MAX.
    }


  var _floor=Math_floor;

  var _llvm_pow_f64=Math_pow;

  
  
  
  function _fputc(c, stream) {
      // int fputc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
      var chr = unSign(c & 0xFF);
      HEAP8[((_fputc.ret)|0)]=chr;
      var fd = _fileno(stream);
      var ret = _write(fd, _fputc.ret, 1);
      if (ret == -1) {
        var streamObj = FS.getStreamFromPtr(stream);
        if (streamObj) streamObj.error = true;
        return -1;
      } else {
        return chr;
      }
    }function _putchar(c) {
      // int putchar(int c);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/putchar.html
      return _fputc(c, HEAP32[((_stdout)>>2)]);
    } 
  Module["_saveSetjmp"] = _saveSetjmp;
  
   
  Module["_testSetjmp"] = _testSetjmp;function _longjmp(env, value) {
      asm['setThrew'](env, value || 1);
      throw 'longjmp';
    }

  
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      Module['exit'](status);
    }function _exit(status) {
      __exit(status);
    }

  var _setjmp=undefined;

  
   
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i64=_memset;

  function _iscntrl(chr) {
      return (0 <= chr && chr <= 0x1F) || chr === 0x7F;
    }

  function _isalpha(chr) {
      return (chr >= 97 && chr <= 122) ||
             (chr >= 65 && chr <= 90);
    }

  function _isalnum(chr) {
      return (chr >= 48 && chr <= 57) ||
             (chr >= 97 && chr <= 122) ||
             (chr >= 65 && chr <= 90);
    }

  function _localeconv() {
      // %struct.timeval = type { char* decimal point, other stuff... }
      // var indexes = Runtime.calculateStructAlignment({ fields: ['i32', 'i32'] });
      var me = _localeconv;
      if (!me.ret) {
      // These are defaults from the "C" locale
        me.ret = allocate([
          allocate(intArrayFromString('.'), 'i8', ALLOC_NORMAL),0,0,0, // decimal_point
          allocate(intArrayFromString(''), 'i8', ALLOC_NORMAL),0,0,0, // thousands_sep
          allocate(intArrayFromString(''), 'i8', ALLOC_NORMAL),0,0,0, // grouping
          allocate(intArrayFromString(''), 'i8', ALLOC_NORMAL),0,0,0, // int_curr_symbol
          allocate(intArrayFromString(''), 'i8', ALLOC_NORMAL),0,0,0, // currency_symbol
          allocate(intArrayFromString(''), 'i8', ALLOC_NORMAL),0,0,0, // mon_decimal_point
          allocate(intArrayFromString(''), 'i8', ALLOC_NORMAL),0,0,0, // mon_thousands_sep
          allocate(intArrayFromString(''), 'i8', ALLOC_NORMAL),0,0,0, // mon_grouping
          allocate(intArrayFromString(''), 'i8', ALLOC_NORMAL),0,0,0, // positive_sign
          allocate(intArrayFromString(''), 'i8', ALLOC_NORMAL),0,0,0 // negative_sign
        ], 'i8*', ALLOC_NORMAL); // Allocate strings in lconv, still don't allocate chars
      }
      return me.ret;
    }

  function _memchr(ptr, chr, num) {
      chr = unSign(chr);
      for (var i = 0; i < num; i++) {
        if (HEAP8[(ptr)] == chr) return ptr;
        ptr++;
      }
      return 0;
    }

  var _fabs=Math_abs;

  
  function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }

   
  Module["_strncpy"] = _strncpy;

   
  Module["_strcat"] = _strcat;

  function _strcspn(pstr, pset) {
      var str = pstr, set, strcurr, setcurr;
      while (1) {
        strcurr = HEAP8[(str)];
        if (!strcurr) return str - pstr;
        set = pset;
        while (1) {
          setcurr = HEAP8[(set)];
          if (!setcurr || setcurr == strcurr) break;
          set++;
        }
        if (setcurr) return str - pstr;
        str++;
      }
    }

  function _strncat(pdest, psrc, num) {
      var len = _strlen(pdest);
      var i = 0;
      while(1) {
        HEAP8[((pdest+len+i)|0)]=HEAP8[((psrc+i)|0)];
        if (HEAP8[(((pdest)+(len+i))|0)] == 0) break;
        i ++;
        if (i == num) {
          HEAP8[(((pdest)+(len+i))|0)]=0;
          break;
        }
      }
      return pdest;
    }

  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }

  var _llvm_memset_p0i8_i32=_memset;

  function _nan(x) {
      return NaN;
    }


  function _emscripten_asm_const_int(code) {
      var args = Array.prototype.slice.call(arguments, 1);
      return Runtime.getAsmConst(code, args.length).apply(null, args) | 0;
    }

  function _abort() {
      Module['abort']();
    }

  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }

  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }

  
  function _copysign(a, b) {
      return __reallyNegative(a) === __reallyNegative(b) ? a : -a;
    }var _copysignl=_copysign;

  
  function _fmod(x, y) {
      return x % y;
    }var _fmodl=_fmod;






  var Browser={mainLoop:{scheduler:null,method:"",shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
  
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
  
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        var ctx;
        var errorInfo = '?';
        function onContextCreationError(event) {
          errorInfo = event.statusMessage || errorInfo;
        }
        try {
          if (useWebGL) {
            var contextAttributes = {
              antialias: false,
              alpha: false
            };
  
            if (webGLContextAttributes) {
              for (var attribute in webGLContextAttributes) {
                contextAttributes[attribute] = webGLContextAttributes[attribute];
              }
            }
  
  
            canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
            try {
              ['experimental-webgl', 'webgl'].some(function(webglId) {
                return ctx = canvas.getContext(webglId, contextAttributes);
              });
            } finally {
              canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
            }
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e]);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
  
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          GLctx = Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
  
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
  
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          setTimeout(func, 1000/60);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           window['setTimeout'];
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },getMouseWheelDelta:function (event) {
        return Math.max(-1, Math.min(1, event.type === 'DOMMouseScroll' ? event.detail : -event.wheelDelta));
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x, y;
          
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
          if (event.type == 'touchstart' ||
              event.type == 'touchend' ||
              event.type == 'touchmove') {
            var t = event.touches.item(0);
            if (t) {
              x = t.pageX - (scrollX + rect.left);
              y = t.pageY - (scrollY + rect.top);
            } else {
              return;
            }
          } else {
            x = event.pageX - (scrollX + rect.left);
            y = event.pageY - (scrollY + rect.top);
          }
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      }};
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + 5242880;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");

 var ctlz_i8 = allocate([8,7,6,6,5,5,5,5,4,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_DYNAMIC);
 var cttz_i8 = allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0], "i8", ALLOC_DYNAMIC);

var Math_min = Math.min;
function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vii(index,a1,a2) {
  try {
    Module["dynCall_vii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiiii(index,a1,a2,a3,a4) {
  try {
    return Module["dynCall_iiiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.cttz_i8|0;var n=env.ctlz_i8|0;var o=env._stderr|0;var p=+env.NaN;var q=+env.Infinity;var r=0;var s=0;var t=0;var u=0;var v=0,w=0,x=0,y=0,z=0.0,A=0,B=0,C=0,D=0.0;var E=0;var F=0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=0;var M=0;var N=0;var O=global.Math.floor;var P=global.Math.abs;var Q=global.Math.sqrt;var R=global.Math.pow;var S=global.Math.cos;var T=global.Math.sin;var U=global.Math.tan;var V=global.Math.acos;var W=global.Math.asin;var X=global.Math.atan;var Y=global.Math.atan2;var Z=global.Math.exp;var _=global.Math.log;var $=global.Math.ceil;var aa=global.Math.imul;var ba=env.abort;var ca=env.assert;var da=env.asmPrintInt;var ea=env.asmPrintFloat;var fa=env.min;var ga=env.invoke_ii;var ha=env.invoke_vi;var ia=env.invoke_vii;var ja=env.invoke_iiiii;var ka=env.invoke_iiii;var la=env.invoke_v;var ma=env.invoke_iii;var na=env._llvm_va_end;var oa=env._llvm_lifetime_end;var pa=env._snprintf;var qa=env._abort;var ra=env._fprintf;var sa=env._strtoul;var ta=env._fflush;var ua=env._fabs;var va=env.__reallyNegative;var wa=env._strchr;var xa=env._sysconf;var ya=env._isalnum;var za=env._floor;var Aa=env.___setErrNo;var Ba=env._fwrite;var Ca=env._nan;var Da=env._send;var Ea=env._write;var Fa=env._isalpha;var Ga=env._exit;var Ha=env._sprintf;var Ia=env._isspace;var Ja=env._strncat;var Ka=env._longjmp;var La=env._fmod;var Ma=env._strcspn;var Na=env._fputc;var Oa=env._copysign;var Pa=env.__formatString;var Qa=env._emscripten_asm_const_int;var Ra=env._emscripten_memcpy_big;var Sa=env._fileno;var Ta=env._pwrite;var Ua=env._putchar;var Va=env._llvm_pow_f64;var Wa=env._sbrk;var Xa=env._localeconv;var Ya=env.___errno_location;var Za=env._iscntrl;var _a=env._llvm_lifetime_start;var $a=env._mkport;var ab=env.__parseInt;var bb=env._time;var cb=env.__exit;var db=env._memchr;var eb=0.0;
// EMSCRIPTEN_START_FUNCS
function mb(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7&-8;return b|0}function nb(){return i|0}function ob(a){a=a|0;i=a}function pb(a,b){a=a|0;b=b|0;if((r|0)==0){r=a;s=b}}function qb(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0]}function rb(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0];a[k+4|0]=a[b+4|0];a[k+5|0]=a[b+5|0];a[k+6|0]=a[b+6|0];a[k+7|0]=a[b+7|0]}function sb(a){a=a|0;E=a}function tb(a){a=a|0;F=a}function ub(a){a=a|0;G=a}function vb(a){a=a|0;H=a}function wb(a){a=a|0;I=a}function xb(a){a=a|0;J=a}function yb(a){a=a|0;K=a}function zb(a){a=a|0;L=a}function Ab(a){a=a|0;M=a}function Bb(a){a=a|0;N=a}function Cb(){}function Db(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=a+8|0;a=c[d>>2]|0;e=b;f=a;g=c[e+4>>2]|0;c[f>>2]=c[e>>2];c[f+4>>2]=g;c[a+8>>2]=c[b+8>>2];c[d>>2]=(c[d>>2]|0)+16;return}function Eb(a,b){a=a|0;b=b|0;var d=0;d=(c[a+16>>2]|0)+88|0;a=c[d>>2]|0;c[d>>2]=b;return a|0}function Fb(a){a=a|0;return(c[a+8>>2]|0)-(c[a+12>>2]|0)>>4|0}function Gb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;if(!((b|0)>-1)){d=a+8|0;c[d>>2]=(c[d>>2]|0)+(b+1<<4);return}d=a+8|0;e=c[d>>2]|0;f=(c[a+12>>2]|0)+(b<<4)|0;if(e>>>0<f>>>0){b=e;while(1){g=b+16|0;c[b+8>>2]=0;if(g>>>0<f>>>0){b=g}else{break}}c[d>>2]=g}c[d>>2]=f;return}function Hb(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;do{if((b|0)>0){e=(c[a+12>>2]|0)+(b-1<<4)|0;f=e>>>0<(c[a+8>>2]|0)>>>0?e:328}else{if((b|0)>-1e4){f=(c[a+8>>2]|0)+(b<<4)|0;break}if((b|0)==(-1e4|0)){f=(c[a+16>>2]|0)+96|0;break}else if((b|0)==(-10001|0)){e=a+88|0;c[e>>2]=c[(c[c[(c[a+20>>2]|0)+4>>2]>>2]|0)+12>>2];c[a+96>>2]=5;f=e;break}else if((b|0)==(-10002|0)){f=a+72|0;break}else{e=c[c[(c[a+20>>2]|0)+4>>2]>>2]|0;g=-10002-b|0;if((g|0)>(d[e+7|0]|0|0)){f=328;break}f=e+24+(g-1<<4)|0;break}}}while(0);b=f+16|0;g=a+8|0;a=c[g>>2]|0;if(b>>>0<a>>>0){h=f;i=b}else{j=a;k=j-16|0;c[g>>2]=k;return}while(1){a=i;b=h;f=c[a+4>>2]|0;c[b>>2]=c[a>>2];c[b+4>>2]=f;c[h+8>>2]=c[h+24>>2];f=i+16|0;b=c[g>>2]|0;if(f>>>0<b>>>0){h=i;i=f}else{j=b;break}}k=j-16|0;c[g>>2]=k;return}function Ib(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0;do{if((b|0)>0){e=(c[a+12>>2]|0)+(b-1<<4)|0;f=e>>>0<(c[a+8>>2]|0)>>>0?e:328}else{if((b|0)>-1e4){f=(c[a+8>>2]|0)+(b<<4)|0;break}if((b|0)==(-1e4|0)){f=(c[a+16>>2]|0)+96|0;break}else if((b|0)==(-10001|0)){e=a+88|0;c[e>>2]=c[(c[c[(c[a+20>>2]|0)+4>>2]>>2]|0)+12>>2];c[a+96>>2]=5;f=e;break}else if((b|0)==(-10002|0)){f=a+72|0;break}else{e=c[c[(c[a+20>>2]|0)+4>>2]>>2]|0;g=-10002-b|0;if((g|0)>(d[e+7|0]|0|0)){f=328;break}f=e+24+(g-1<<4)|0;break}}}while(0);b=a+8|0;a=c[b>>2]|0;g=f;e=a;h=c[g+4>>2]|0;c[e>>2]=c[g>>2];c[e+4>>2]=h;c[a+8>>2]=c[f+8>>2];c[b>>2]=(c[b>>2]|0)+16;return}function Jb(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0;do{if((b|0)>0){e=(c[a+12>>2]|0)+(b-1<<4)|0;f=e>>>0<(c[a+8>>2]|0)>>>0?e:328}else{if((b|0)>-1e4){f=(c[a+8>>2]|0)+(b<<4)|0;break}if((b|0)==(-1e4|0)){f=(c[a+16>>2]|0)+96|0;break}else if((b|0)==(-10001|0)){e=a+88|0;c[e>>2]=c[(c[c[(c[a+20>>2]|0)+4>>2]>>2]|0)+12>>2];c[a+96>>2]=5;f=e;break}else if((b|0)==(-10002|0)){f=a+72|0;break}else{e=c[c[(c[a+20>>2]|0)+4>>2]>>2]|0;g=-10002-b|0;if((g|0)>(d[e+7|0]|0|0)){h=-1;return h|0}else{f=e+24+(g-1<<4)|0;break}}}}while(0);if((f|0)==328){h=-1;return h|0}h=c[f+8>>2]|0;return h|0}function Kb(a,b,e){a=a|0;b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=(b|0)>0;do{if(f){g=(c[a+12>>2]|0)+(b-1<<4)|0;h=g>>>0<(c[a+8>>2]|0)>>>0?g:328}else{if((b|0)>-1e4){h=(c[a+8>>2]|0)+(b<<4)|0;break}if((b|0)==(-10001|0)){g=a+88|0;c[g>>2]=c[(c[c[(c[a+20>>2]|0)+4>>2]>>2]|0)+12>>2];c[a+96>>2]=5;h=g;break}else if((b|0)==(-10002|0)){h=a+72|0;break}else if((b|0)==(-1e4|0)){h=(c[a+16>>2]|0)+96|0;break}else{g=c[c[(c[a+20>>2]|0)+4>>2]>>2]|0;i=-10002-b|0;if((i|0)>(d[g+7|0]|0|0)){h=328;break}h=g+24+(i-1<<4)|0;break}}}while(0);do{if((c[h+8>>2]|0)==4){j=h}else{if((Me(a,h)|0)==0){if((e|0)==0){k=0;return k|0}c[e>>2]=0;k=0;return k|0}i=a+16|0;g=c[i>>2]|0;if(!((c[g+68>>2]|0)>>>0<(c[g+64>>2]|0)>>>0)){pd(a)}if(f){g=(c[a+12>>2]|0)+(b-1<<4)|0;j=g>>>0<(c[a+8>>2]|0)>>>0?g:328;break}if((b|0)>-1e4){j=(c[a+8>>2]|0)+(b<<4)|0;break}if((b|0)==(-1e4|0)){j=(c[i>>2]|0)+96|0;break}else if((b|0)==(-10001|0)){i=a+88|0;c[i>>2]=c[(c[c[(c[a+20>>2]|0)+4>>2]>>2]|0)+12>>2];c[a+96>>2]=5;j=i;break}else if((b|0)==(-10002|0)){j=a+72|0;break}else{i=c[c[(c[a+20>>2]|0)+4>>2]>>2]|0;g=-10002-b|0;if((g|0)>(d[i+7|0]|0|0)){j=328;break}j=i+24+(g-1<<4)|0;break}}}while(0);b=c[j>>2]|0;if((e|0)!=0){c[e>>2]=c[b+12>>2]}k=b+16|0;return k|0}function Lb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;if((b|0)==0){d=a+8|0;e=c[d>>2]|0;c[e+8>>2]=0;c[d>>2]=e+16;return}e=qf(b|0)|0;d=c[a+16>>2]|0;if(!((c[d+68>>2]|0)>>>0<(c[d+64>>2]|0)>>>0)){pd(a)}d=a+8|0;f=c[d>>2]|0;c[f>>2]=se(a,b,e)|0;c[f+8>>2]=4;c[d>>2]=(c[d>>2]|0)+16;return}function Mb(a,b){a=a|0;b=b|0;var e=0,f=0,g=0;do{if((b|0)>0){e=(c[a+12>>2]|0)+(b-1<<4)|0;f=e>>>0<(c[a+8>>2]|0)>>>0?e:328}else{if((b|0)>-1e4){f=(c[a+8>>2]|0)+(b<<4)|0;break}if((b|0)==(-1e4|0)){f=(c[a+16>>2]|0)+96|0;break}else if((b|0)==(-10001|0)){e=a+88|0;c[e>>2]=c[(c[c[(c[a+20>>2]|0)+4>>2]>>2]|0)+12>>2];c[a+96>>2]=5;f=e;break}else if((b|0)==(-10002|0)){f=a+72|0;break}else{e=c[c[(c[a+20>>2]|0)+4>>2]>>2]|0;g=-10002-b|0;if((g|0)>(d[e+7|0]|0|0)){f=328;break}f=e+24+(g-1<<4)|0;break}}}while(0);b=a+8|0;a=ze(c[f>>2]|0,(c[b>>2]|0)-16|0)|0;f=c[b>>2]|0;b=a;g=f-16|0;e=c[b+4>>2]|0;c[g>>2]=c[b>>2];c[g+4>>2]=e;c[f-16+8>>2]=c[a+8>>2];return}function Nb(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0,i=0;do{if((b|0)>0){e=(c[a+12>>2]|0)+(b-1<<4)|0;f=e>>>0<(c[a+8>>2]|0)>>>0?e:328}else{if((b|0)>-1e4){f=(c[a+8>>2]|0)+(b<<4)|0;break}if((b|0)==(-1e4|0)){f=(c[a+16>>2]|0)+96|0;break}else if((b|0)==(-10001|0)){e=a+88|0;c[e>>2]=c[(c[c[(c[a+20>>2]|0)+4>>2]>>2]|0)+12>>2];c[a+96>>2]=5;f=e;break}else if((b|0)==(-10002|0)){f=a+72|0;break}else{e=c[c[(c[a+20>>2]|0)+4>>2]>>2]|0;g=-10002-b|0;if((g|0)>(d[e+7|0]|0|0)){f=328;break}f=e+24+(g-1<<4)|0;break}}}while(0);b=c[f+8>>2]|0;if((b|0)==5){h=c[(c[f>>2]|0)+8>>2]|0}else if((b|0)==7){h=c[(c[f>>2]|0)+8>>2]|0}else{h=c[(c[a+16>>2]|0)+152+(b<<2)>>2]|0}if((h|0)==0){i=0;return i|0}b=a+8|0;a=c[b>>2]|0;c[a>>2]=h;c[a+8>>2]=5;c[b>>2]=(c[b>>2]|0)+16;i=1;return i|0}function Ob(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=a+8|0;Wc(a,(c[e>>2]|0)+(~b<<4)|0,d);if(!((d|0)==-1)){return}d=c[e>>2]|0;e=(c[a+20>>2]|0)+8|0;if(d>>>0<(c[e>>2]|0)>>>0){return}c[e>>2]=d;return}function Pb(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=i;i=i+24|0;f=e|0;Ve(a,f,b,c);c=Yc(a,f,(d|0)!=0?d:2592)|0;i=e;return c|0}function Qb(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=c[b+8>>2]|0;if((c[f-16+8>>2]|0)!=6){g=1;return g|0}h=c[f-16>>2]|0;if((a[h+6|0]|0)!=0){g=1;return g|0}g=$c(b,c[h+16>>2]|0,d,e,0)|0;return g|0}function Rb(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0;if((b+9999|0)>>>0>9999>>>0){d=b}else{d=b+1+(Fb(a)|0)|0}if((Nb(a,d)|0)==0){e=0;return e|0}Lb(a,c);Mb(a,-2);if((Jb(a,-1)|0)==0){Gb(a,-3);e=0;return e|0}else{Hb(a,-2);Ib(a,d);Ob(a,1,1);e=1;return e|0}return 0}function Sb(a,b){a=a|0;b=b|0;c[b+8>>2]=a;c[b>>2]=b+12;c[b+4>>2]=0;return}function Tb(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+8|0;g=f|0;c[g>>2]=b;c[g+4>>2]=d;d=Pb(a,2,g,e)|0;i=f;return d|0}function Ub(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;a=b+4|0;e=c[a>>2]|0;if((e|0)==0){f=0;return f|0}c[d>>2]=e;c[a>>2]=0;f=c[b>>2]|0;return f|0}function Vb(){var a=0;a=pe(8,0)|0;if((a|0)==0){return a|0}Eb(a,2)|0;return a|0}function Wb(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;if((d|0)==0){af(b);e=0}else{e=bf(b,d)|0}return e|0}function Xb(a){a=a|0;var b=0,d=0,e=0;b=i;d=c[o>>2]|0;e=Kb(a,-1,0)|0;ra(d|0,2392,(d=i,i=i+8|0,c[d>>2]=e,d)|0)|0;i=d;i=b;return 0}function Yb(a,b,e){a=a|0;b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;f=c[a+24>>2]|0;do{if((f|0)>(c[a+28>>2]|0)){if((f|0)==0){if((d[a+50|0]|0|0)>(b|0)){break}return}g=(c[(c[a>>2]|0)+12>>2]|0)+(f-1<<2)|0;h=c[g>>2]|0;if((h&63|0)!=3){break}i=h>>>23;if((h>>>6&255|0)>(b|0)){break}if((i+1|0)<(b|0)){break}j=b-1+e|0;if((j|0)<=(i|0)){return}c[g>>2]=h&8388607|j<<23;return}}while(0);Bc(a,b<<6|(e+b<<23)-8388608|3,c[(c[a+12>>2]|0)+8>>2]|0)|0;return}function Zb(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;return Bc(a,d<<6|b|e<<23|f<<14,c[(c[a+12>>2]|0)+8>>2]|0)|0}function _b(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;b=a+32|0;d=c[b>>2]|0;c[b>>2]=-1;b=a+12|0;e=Bc(a,2147450902,c[(c[b>>2]|0)+8>>2]|0)|0;if((d|0)==-1){f=e;return f|0}if((e|0)==-1){f=d;return f|0}g=c[(c[a>>2]|0)+12>>2]|0;a=e;while(1){h=g+(a<<2)|0;i=c[h>>2]|0;j=(i>>>14)-131071|0;if((j|0)==-1){break}k=a+1+j|0;if((k|0)==-1){break}else{a=k}}g=d+~a|0;if((((g|0)>-1?g:-g|0)|0)>131071){Cd(c[b>>2]|0,1760);l=c[h>>2]|0}else{l=i}c[h>>2]=l&16383|(g<<14)+2147467264;f=e;return f|0}function $b(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;return Bc(a,d<<6|b|e<<14,c[(c[a+12>>2]|0)+8>>2]|0)|0}function ac(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;if((d|0)==-1){return}e=c[b>>2]|0;if((e|0)==-1){c[b>>2]=d;return}b=c[(c[a>>2]|0)+12>>2]|0;f=e;while(1){g=b+(f<<2)|0;h=c[g>>2]|0;e=(h>>>14)-131071|0;if((e|0)==-1){break}i=f+1+e|0;if((i|0)==-1){break}else{f=i}}b=~f+d|0;if((((b|0)>-1?b:-b|0)|0)>131071){Cd(c[a+12>>2]|0,1760);j=c[g>>2]|0}else{j=h}c[g>>2]=j&16383|(b<<14)+2147467264;return}function bc(a,b,d){a=a|0;b=b|0;d=d|0;Bc(a,b<<6|(d<<23)+8388608|30,c[(c[a+12>>2]|0)+8>>2]|0)|0;return}function cc(a){a=a|0;var b=0;b=c[a+24>>2]|0;c[a+28>>2]=b;return b|0}function dc(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;if((c[b+24>>2]|0)==(e|0)){c[b+28>>2]=e;f=b+32|0;if((d|0)==-1){return}g=c[f>>2]|0;if((g|0)==-1){c[f>>2]=d;return}f=c[(c[b>>2]|0)+12>>2]|0;h=g;while(1){i=f+(h<<2)|0;j=c[i>>2]|0;g=(j>>>14)-131071|0;if((g|0)==-1){break}k=h+1+g|0;if((k|0)==-1){break}else{h=k}}f=~h+d|0;if((((f|0)>-1?f:-f|0)|0)>131071){Cd(c[b+12>>2]|0,1760);l=c[i>>2]|0}else{l=j}c[i>>2]=l&16383|(f<<14)+2147467264;return}if((d|0)==-1){return}f=b|0;l=b+12|0;b=d;while(1){d=c[(c[f>>2]|0)+12>>2]|0;i=d+(b<<2)|0;j=c[i>>2]|0;h=(j>>>14)-131071|0;if((h|0)==-1){m=-1}else{m=b+1+h|0}if((b|0)>0){h=d+(b-1<<2)|0;d=c[h>>2]|0;if((a[288+(d&63)|0]|0)<0){n=h;o=d}else{p=17}}else{p=17}if((p|0)==17){p=0;n=i;o=j}if((o&63|0)==27){c[n>>2]=o&8372224|o>>>23<<6|26;d=~b+e|0;if((((d|0)>-1?d:-d|0)|0)>131071){Cd(c[l>>2]|0,1760)}q=c[i>>2]&16383|(d<<14)+2147467264}else{d=~b+e|0;if((((d|0)>-1?d:-d|0)|0)>131071){Cd(c[l>>2]|0,1760);r=c[i>>2]|0}else{r=j}q=r&16383|(d<<14)+2147467264}c[i>>2]=q;if((m|0)==-1){break}else{b=m}}return}function ec(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0;c[a+28>>2]=c[a+24>>2];d=a+32|0;if((b|0)==-1){return}e=c[d>>2]|0;if((e|0)==-1){c[d>>2]=b;return}d=c[(c[a>>2]|0)+12>>2]|0;f=e;while(1){g=d+(f<<2)|0;h=c[g>>2]|0;e=(h>>>14)-131071|0;if((e|0)==-1){break}i=f+1+e|0;if((i|0)==-1){break}else{f=i}}d=~f+b|0;if((((d|0)>-1?d:-d|0)|0)>131071){Cd(c[a+12>>2]|0,1760);j=c[g>>2]|0}else{j=h}c[g>>2]=j&16383|(d<<14)+2147467264;return}function fc(b,e){b=b|0;e=e|0;var f=0,g=0,h=0;f=(c[b+36>>2]|0)+e|0;e=b|0;g=c[e>>2]|0;if((f|0)<=(d[g+75|0]|0|0)){return}if((f|0)>249){Cd(c[b+12>>2]|0,1080);h=c[e>>2]|0}else{h=g}a[h+75|0]=f;return}function gc(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;f=b+36|0;g=c[f>>2]|0;h=g+e|0;i=b|0;j=c[i>>2]|0;if((h|0)<=(d[j+75|0]|0|0)){k=g;l=k+e|0;c[f>>2]=l;return}if((h|0)>249){Cd(c[b+12>>2]|0,1080);m=c[i>>2]|0}else{m=j}a[m+75|0]=h;k=c[f>>2]|0;l=k+e|0;c[f>>2]=l;return}function hc(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;i=i+16|0;e=d|0;c[e>>2]=b;c[e+8>>2]=4;b=ic(a,e,e)|0;i=d;return b|0}function ic(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,i=0,j=0,k=0,l=0,m=0,n=0;f=c[b+16>>2]|0;g=Ae(f,c[b+4>>2]|0,d)|0;d=c[b>>2]|0;i=d+40|0;j=c[i>>2]|0;k=g+8|0;if((c[k>>2]|0)==3){l=~~+h[g>>3];return l|0}m=b+40|0;h[g>>3]=+(c[m>>2]|0);c[k>>2]=3;k=c[i>>2]|0;if((c[m>>2]|0)<(k|0)){n=k}else{k=d+8|0;c[k>>2]=Md(f,c[k>>2]|0,i,16,262143,2104)|0;n=c[i>>2]|0}k=c[d+8>>2]|0;if((j|0)<(n|0)){n=j;while(1){j=n+1|0;c[k+(n<<4)+8>>2]=0;if((j|0)<(c[i>>2]|0)){n=j}else{break}}}n=c[m>>2]|0;i=e;j=k+(n<<4)|0;g=c[i+4>>2]|0;c[j>>2]=c[i>>2];c[j+4>>2]=g;g=e+8|0;c[k+(n<<4)+8>>2]=c[g>>2];do{if((c[g>>2]|0)>3){n=c[e>>2]|0;if((a[n+5|0]&3)==0){break}if((a[d+5|0]&4)==0){break}sd(f,d,n)}}while(0);d=c[m>>2]|0;c[m>>2]=d+1;l=d;return l|0}function jc(a,b){a=a|0;b=+b;var d=0,e=0,f=0;d=i;i=i+16|0;e=d|0;h[e>>3]=b;c[e+8>>2]=3;f=ic(a,e,e)|0;i=d;return f|0}function kc(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;g=c[e>>2]|0;if((g|0)==13){h=(c[(c[b>>2]|0)+12>>2]|0)+(c[e+8>>2]<<2)|0;c[h>>2]=c[h>>2]&-8372225|(f<<14)+16384&8372224;return}else if((g|0)==14){g=e+8|0;e=b|0;h=c[e>>2]|0;i=c[h+12>>2]|0;j=i+(c[g>>2]<<2)|0;c[j>>2]=c[j>>2]&8388607|(f<<23)+8388608;f=i+(c[g>>2]<<2)|0;g=b+36|0;c[f>>2]=c[g>>2]<<6&16320|c[f>>2]&-16321;f=c[g>>2]|0;i=f+1|0;if((f|0)<(d[h+75|0]|0|0)){k=f}else{if((f|0)>248){Cd(c[b+12>>2]|0,1080);l=c[e>>2]|0}else{l=h}a[l+75|0]=i;k=c[g>>2]|0}c[g>>2]=k+1;return}else{return}}function lc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=b|0;e=c[d>>2]|0;if((e|0)==14){f=(c[(c[a>>2]|0)+12>>2]|0)+(c[b+8>>2]<<2)|0;c[f>>2]=c[f>>2]&8388607|16777216;c[d>>2]=11;return}else if((e|0)==13){c[d>>2]=12;d=b+8|0;c[d>>2]=(c[(c[(c[a>>2]|0)+12>>2]|0)+(c[d>>2]<<2)>>2]|0)>>>6&255;return}else{return}}function mc(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0;e=b|0;switch(c[e>>2]|0){case 6:{c[e>>2]=12;return};case 8:{f=b+8|0;c[f>>2]=Bc(a,c[f>>2]<<14|5,c[(c[a+12>>2]|0)+8>>2]|0)|0;c[e>>2]=11;return};case 14:{f=(c[(c[a>>2]|0)+12>>2]|0)+(c[b+8>>2]<<2)|0;c[f>>2]=c[f>>2]&8388607|16777216;c[e>>2]=11;return};case 9:{f=b+8|0;g=f+4|0;h=c[g>>2]|0;do{if((h&256|0)==0){if((d[a+50|0]|0|0)>(h|0)){break}i=a+36|0;c[i>>2]=(c[i>>2]|0)-1}}while(0);h=f;f=c[h>>2]|0;do{if((f&256|0)==0){if((d[a+50|0]|0|0)>(f|0)){j=f;break}i=a+36|0;c[i>>2]=(c[i>>2]|0)-1;j=c[h>>2]|0}else{j=f}}while(0);c[h>>2]=Bc(a,j<<23|c[g>>2]<<14|6,c[(c[a+12>>2]|0)+8>>2]|0)|0;c[e>>2]=11;return};case 13:{c[e>>2]=12;g=b+8|0;c[g>>2]=(c[(c[(c[a>>2]|0)+12>>2]|0)+(c[g>>2]<<2)>>2]|0)>>>6&255;return};case 7:{g=b+8|0;c[g>>2]=Bc(a,c[g>>2]<<23|4,c[(c[a+12>>2]|0)+8>>2]|0)|0;c[e>>2]=11;return};default:{return}}}function nc(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0;mc(b,e);do{if((c[e>>2]|0)==12){f=c[e+8>>2]|0;if((f&256|0)!=0){break}if((d[b+50|0]|0|0)>(f|0)){break}f=b+36|0;c[f>>2]=(c[f>>2]|0)-1}}while(0);f=b+36|0;g=c[f>>2]|0;h=b|0;i=c[h>>2]|0;if((g|0)<(d[i+75|0]|0|0)){j=g;k=j+1|0;c[f>>2]=k;oc(b,e,j);return}if((g|0)>248){Cd(c[b+12>>2]|0,1080);l=c[h>>2]|0}else{l=i}a[l+75|0]=g+1;j=c[f>>2]|0;k=j+1|0;c[f>>2]=k;oc(b,e,j);return}function oc(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0;Ec(b,d,e);f=d|0;g=d+16|0;do{if((c[f>>2]|0)==10){h=c[d+8>>2]|0;if((h|0)==-1){break}i=c[g>>2]|0;if((i|0)==-1){c[g>>2]=h;break}j=c[(c[b>>2]|0)+12>>2]|0;k=i;while(1){l=j+(k<<2)|0;m=c[l>>2]|0;i=(m>>>14)-131071|0;if((i|0)==-1){break}n=k+1+i|0;if((n|0)==-1){break}else{k=n}}j=h+~k|0;if((((j|0)>-1?j:-j|0)|0)>131071){Cd(c[b+12>>2]|0,1760);o=c[l>>2]|0}else{o=m}c[l>>2]=o&16383|(j<<14)+2147467264}}while(0);o=c[g>>2]|0;l=d+20|0;m=c[l>>2]|0;if((o|0)==(m|0)){c[g>>2]=-1;c[l>>2]=-1;p=d+8|0;q=p;c[q>>2]=e;c[f>>2]=12;return}a:do{if((o|0)==-1){r=20}else{j=c[(c[b>>2]|0)+12>>2]|0;n=o;while(1){i=j+(n<<2)|0;if((n|0)>0){s=c[j+(n-1<<2)>>2]|0;if((a[288+(s&63)|0]|0)<0){t=s}else{r=16}}else{r=16}if((r|0)==16){r=0;t=c[i>>2]|0}if((t&63|0)!=27){r=28;break a}s=((c[i>>2]|0)>>>14)-131071|0;if((s|0)==-1){r=20;break a}i=n+1+s|0;if((i|0)==-1){r=20;break}else{n=i}}}}while(0);b:do{if((r|0)==20){if((m|0)==-1){u=-1;v=-1;break}t=c[(c[b>>2]|0)+12>>2]|0;o=m;while(1){n=t+(o<<2)|0;if((o|0)>0){j=c[t+(o-1<<2)>>2]|0;if((a[288+(j&63)|0]|0)<0){w=j}else{r=24}}else{r=24}if((r|0)==24){r=0;w=c[n>>2]|0}if((w&63|0)!=27){r=28;break b}j=((c[n>>2]|0)>>>14)-131071|0;if((j|0)==-1){u=-1;v=-1;break b}n=o+1+j|0;if((n|0)==-1){u=-1;v=-1;break}else{o=n}}}}while(0);do{if((r|0)==28){do{if((c[f>>2]|0)==10){x=-1;y=b+12|0;z=b+32|0}else{w=b+32|0;m=c[w>>2]|0;c[w>>2]=-1;o=b+12|0;t=Bc(b,2147450902,c[(c[o>>2]|0)+8>>2]|0)|0;if((m|0)==-1){x=t;y=o;z=w;break}if((t|0)==-1){x=m;y=o;z=w;break}n=c[(c[b>>2]|0)+12>>2]|0;j=t;while(1){A=n+(j<<2)|0;B=c[A>>2]|0;k=(B>>>14)-131071|0;if((k|0)==-1){break}h=j+1+k|0;if((h|0)==-1){break}else{j=h}}n=m+~j|0;if((((n|0)>-1?n:-n|0)|0)>131071){Cd(c[o>>2]|0,1760);C=c[A>>2]|0}else{C=B}c[A>>2]=C&16383|(n<<14)+2147467264;x=t;y=o;z=w}}while(0);n=b+24|0;h=b+28|0;c[h>>2]=c[n>>2];k=e<<6;i=Bc(b,k|16386,c[(c[y>>2]|0)+8>>2]|0)|0;c[h>>2]=c[n>>2];s=Bc(b,k|8388610,c[(c[y>>2]|0)+8>>2]|0)|0;c[h>>2]=c[n>>2];if((x|0)==-1){u=i;v=s;break}n=c[z>>2]|0;if((n|0)==-1){c[z>>2]=x;u=i;v=s;break}h=c[(c[b>>2]|0)+12>>2]|0;k=n;while(1){D=h+(k<<2)|0;E=c[D>>2]|0;n=(E>>>14)-131071|0;if((n|0)==-1){break}F=k+1+n|0;if((F|0)==-1){break}else{k=F}}h=x+~k|0;if((((h|0)>-1?h:-h|0)|0)>131071){Cd(c[y>>2]|0,1760);G=c[D>>2]|0}else{G=E}c[D>>2]=G&16383|(h<<14)+2147467264;u=i;v=s}}while(0);G=c[b+24>>2]|0;c[b+28>>2]=G;D=c[l>>2]|0;if(!((D|0)==-1)){E=b|0;y=(e|0)==255;x=b+12|0;z=e<<6&16320;C=D;while(1){D=c[(c[E>>2]|0)+12>>2]|0;A=D+(C<<2)|0;B=c[A>>2]|0;h=(B>>>14)-131071|0;if((h|0)==-1){H=-1}else{H=C+1+h|0}if((C|0)>0){h=D+(C-1<<2)|0;D=c[h>>2]|0;if((a[288+(D&63)|0]|0)<0){I=h;J=D}else{r=53}}else{r=53}if((r|0)==53){r=0;I=A;J=B}if((J&63|0)==27){D=J>>>23;if(y|(D|0)==(e|0)){K=J&8372224|D<<6|26}else{K=J&-16321|z}c[I>>2]=K;D=G+~C|0;if((((D|0)>-1?D:-D|0)|0)>131071){Cd(c[x>>2]|0,1760)}L=c[A>>2]&16383|(D<<14)+2147467264}else{D=u+~C|0;if((((D|0)>-1?D:-D|0)|0)>131071){Cd(c[x>>2]|0,1760);M=c[A>>2]|0}else{M=B}L=M&16383|(D<<14)+2147467264}c[A>>2]=L;if((H|0)==-1){break}else{C=H}}}H=c[g>>2]|0;if((H|0)==-1){c[g>>2]=-1;c[l>>2]=-1;p=d+8|0;q=p;c[q>>2]=e;c[f>>2]=12;return}C=b|0;L=b+12|0;b=e<<6;M=b&16320;if((e|0)==255){x=H;while(1){u=c[(c[C>>2]|0)+12>>2]|0;K=u+(x<<2)|0;I=c[K>>2]|0;z=(I>>>14)-131071|0;if((z|0)==-1){N=-1}else{N=x+1+z|0}if((x|0)>0){z=u+(x-1<<2)|0;u=c[z>>2]|0;if((a[288+(u&63)|0]|0)<0){O=z;P=u}else{r=71}}else{r=71}if((r|0)==71){r=0;O=K;P=I}if((P&63|0)==27){c[O>>2]=P&8372224|P>>>23<<6|26;u=G+~x|0;if((((u|0)>-1?u:-u|0)|0)>131071){Cd(c[L>>2]|0,1760)}Q=c[K>>2]&16383|(u<<14)+2147467264}else{u=v+~x|0;if((((u|0)>-1?u:-u|0)|0)>131071){Cd(c[L>>2]|0,1760);R=c[K>>2]|0}else{R=I}Q=R&16383|(u<<14)+2147467264}c[K>>2]=Q;if((N|0)==-1){break}else{x=N}}c[g>>2]=-1;c[l>>2]=-1;p=d+8|0;q=p;c[q>>2]=e;c[f>>2]=12;return}else{S=H}while(1){H=c[(c[C>>2]|0)+12>>2]|0;N=H+(S<<2)|0;x=c[N>>2]|0;Q=(x>>>14)-131071|0;if((Q|0)==-1){T=-1}else{T=S+1+Q|0}if((S|0)>0){Q=H+(S-1<<2)|0;H=c[Q>>2]|0;if((a[288+(H&63)|0]|0)<0){U=Q;V=H}else{r=84}}else{r=84}if((r|0)==84){r=0;U=N;V=x}if((V&63|0)==27){if((V>>>23|0)==(e|0)){W=V&8372224|b|26}else{W=V&-16321|M}c[U>>2]=W;H=G+~S|0;if((((H|0)>-1?H:-H|0)|0)>131071){Cd(c[L>>2]|0,1760)}X=c[N>>2]&16383|(H<<14)+2147467264}else{H=v+~S|0;if((((H|0)>-1?H:-H|0)|0)>131071){Cd(c[L>>2]|0,1760);Y=c[N>>2]|0}else{Y=x}X=Y&16383|(H<<14)+2147467264}c[N>>2]=X;if((T|0)==-1){break}else{S=T}}c[g>>2]=-1;c[l>>2]=-1;p=d+8|0;q=p;c[q>>2]=e;c[f>>2]=12;return}function pc(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0;mc(a,b);do{if((c[b>>2]|0)==12){e=b+8|0;f=c[e>>2]|0;if((c[b+16>>2]|0)==(c[b+20>>2]|0)){g=f;return g|0}if((f|0)<(d[a+50|0]|0|0)){h=e;break}oc(a,b,f);g=c[e>>2]|0;return g|0}else{h=b+8|0}}while(0);nc(a,b);g=c[h>>2]|0;return g|0}function qc(a,b){a=a|0;b=b|0;var e=0,f=0,g=0;e=b+16|0;f=b+20|0;if((c[e>>2]|0)==(c[f>>2]|0)){mc(a,b);return}mc(a,b);do{if((c[b>>2]|0)==12){g=c[b+8>>2]|0;if((c[e>>2]|0)==(c[f>>2]|0)){return}if((g|0)<(d[a+50|0]|0|0)){break}oc(a,b,g);return}}while(0);nc(a,b);return}function rc(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;e=i;i=i+64|0;f=e|0;g=e+16|0;j=e+32|0;k=e+48|0;l=b+16|0;m=b+20|0;n=(c[l>>2]|0)==(c[m>>2]|0);mc(a,b);o=b|0;a:do{if(!n){do{if((c[o>>2]|0)==12){p=c[b+8>>2]|0;if((c[l>>2]|0)==(c[m>>2]|0)){break a}if((p|0)<(d[a+50|0]|0|0)){break}oc(a,b,p);break a}}while(0);nc(a,b)}}while(0);n=c[o>>2]|0;b:do{switch(n|0){case 4:{p=c[b+8>>2]|0;if((p|0)>=256){break b}q=p|256;i=e;return q|0};case 5:case 2:case 3:case 1:{if((c[a+40>>2]|0)>=256){break b}if((n|0)==5){h[g>>3]=+h[b+8>>3];c[g+8>>2]=3;r=ic(a,g,g)|0}else if((n|0)==1){c[k+8>>2]=0;c[j>>2]=c[a+4>>2];c[j+8>>2]=5;r=ic(a,j,k)|0}else{c[f>>2]=(n|0)==2;c[f+8>>2]=1;r=ic(a,f,f)|0}c[b+8>>2]=r;c[o>>2]=4;q=r|256;i=e;return q|0};default:{}}}while(0);mc(a,b);do{if((c[o>>2]|0)==12){r=b+8|0;f=c[r>>2]|0;if((c[l>>2]|0)==(c[m>>2]|0)){q=f;i=e;return q|0}if((f|0)<(d[a+50|0]|0|0)){s=r;break}oc(a,b,f);q=c[r>>2]|0;i=e;return q|0}else{s=b+8|0}}while(0);nc(a,b);q=c[s>>2]|0;i=e;return q|0}function sc(a,b,e){a=a|0;b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;f=c[b>>2]|0;if((f|0)==7){mc(a,e);do{if((c[e>>2]|0)==12){g=e+8|0;h=c[g>>2]|0;if((c[e+16>>2]|0)==(c[e+20>>2]|0)){i=h;break}if((h|0)<(d[a+50|0]|0|0)){j=g;k=12;break}oc(a,e,h);i=c[g>>2]|0}else{j=e+8|0;k=12}}while(0);if((k|0)==12){nc(a,e);i=c[j>>2]|0}Bc(a,i<<6|c[b+8>>2]<<23|8,c[(c[a+12>>2]|0)+8>>2]|0)|0}else if((f|0)==6){do{if((c[e>>2]|0)==12){i=c[e+8>>2]|0;if((i&256|0)!=0){break}if((d[a+50|0]|0|0)>(i|0)){break}i=a+36|0;c[i>>2]=(c[i>>2]|0)-1}}while(0);oc(a,e,c[b+8>>2]|0);return}else if((f|0)==8){mc(a,e);do{if((c[e>>2]|0)==12){i=e+8|0;j=c[i>>2]|0;if((c[e+16>>2]|0)==(c[e+20>>2]|0)){l=j;break}if((j|0)<(d[a+50|0]|0|0)){m=i;k=19;break}oc(a,e,j);l=c[i>>2]|0}else{m=e+8|0;k=19}}while(0);if((k|0)==19){nc(a,e);l=c[m>>2]|0}Bc(a,l<<6|c[b+8>>2]<<14|7,c[(c[a+12>>2]|0)+8>>2]|0)|0}else if((f|0)==9){f=rc(a,e)|0;l=b+8|0;Bc(a,f<<14|c[l>>2]<<6|c[l+4>>2]<<23|9,c[(c[a+12>>2]|0)+8>>2]|0)|0}if((c[e>>2]|0)!=12){return}l=c[e+8>>2]|0;if((l&256|0)!=0){return}if((d[a+50|0]|0|0)>(l|0)){return}l=a+36|0;c[l>>2]=(c[l>>2]|0)-1;return}function tc(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;mc(b,e);g=e|0;do{if((c[g>>2]|0)==12){h=c[e+8>>2]|0;if((c[e+16>>2]|0)==(c[e+20>>2]|0)){break}if((h|0)<(d[b+50|0]|0|0)){i=5;break}oc(b,e,h)}else{i=5}}while(0);if((i|0)==5){nc(b,e)}do{if((c[g>>2]|0)==12){i=c[e+8>>2]|0;if((i&256|0)!=0){break}if((d[b+50|0]|0|0)>(i|0)){break}i=b+36|0;c[i>>2]=(c[i>>2]|0)-1}}while(0);i=b+36|0;h=c[i>>2]|0;j=h+2|0;k=b|0;l=c[k>>2]|0;if((j|0)>(d[l+75|0]|0|0)){if((j|0)>249){Cd(c[b+12>>2]|0,1080);m=c[k>>2]|0}else{m=l}a[m+75|0]=j;n=c[i>>2]|0}else{n=h}c[i>>2]=n+2;n=e+8|0;e=c[n>>2]|0;j=h<<6|e<<23|(rc(b,f)|0)<<14|11;Bc(b,j,c[(c[b+12>>2]|0)+8>>2]|0)|0;if((c[f>>2]|0)!=12){c[n>>2]=h;c[g>>2]=12;return}j=c[f+8>>2]|0;if((j&256|0)!=0){c[n>>2]=h;c[g>>2]=12;return}if((d[b+50|0]|0|0)>(j|0)){c[n>>2]=h;c[g>>2]=12;return}c[i>>2]=(c[i>>2]|0)-1;c[n>>2]=h;c[g>>2]=12;return}function uc(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;mc(b,e);f=e|0;g=c[f>>2]|0;a:do{if((g|0)==10){h=c[(c[b>>2]|0)+12>>2]|0;i=e+8|0;j=c[i>>2]|0;k=h+(j<<2)|0;if((j|0)>0){l=h+(j-1<<2)|0;j=c[l>>2]|0;if((a[288+(j&63)|0]|0)<0){m=l;n=j}else{o=4}}else{o=4}if((o|0)==4){m=k;n=c[k>>2]|0}c[m>>2]=((n&16320|0)==0)<<6|n&-16321;p=c[i>>2]|0;o=18}else if(!((g|0)==4|(g|0)==5|(g|0)==2)){i=e+8|0;do{if((g|0)==11){k=c[(c[(c[b>>2]|0)+12>>2]|0)+(c[i>>2]<<2)>>2]|0;if((k&63|0)!=19){o=9;break}j=b+24|0;c[j>>2]=(c[j>>2]|0)-1;p=Dc(b,26,k>>>23,0,1)|0;o=18;break a}else if((g|0)==12){o=14}else{o=9}}while(0);if((o|0)==9){k=b+36|0;j=c[k>>2]|0;l=j+1|0;h=b|0;q=c[h>>2]|0;if((j|0)<(d[q+75|0]|0)){r=j}else{if((j|0)>248){Cd(c[b+12>>2]|0,1080);s=c[h>>2]|0}else{s=q}a[s+75|0]=l;r=c[k>>2]|0}c[k>>2]=r+1;Ec(b,e,r);if((c[f>>2]|0)==12){o=14}}do{if((o|0)==14){k=c[i>>2]|0;if((k&256|0)!=0){break}if((d[b+50|0]|0)>(k|0)){break}k=b+36|0;c[k>>2]=(c[k>>2]|0)-1}}while(0);p=Dc(b,27,255,c[i>>2]|0,0)|0;o=18}}while(0);do{if((o|0)==18){f=e+20|0;if((p|0)==-1){break}r=c[f>>2]|0;if((r|0)==-1){c[f>>2]=p;break}f=c[(c[b>>2]|0)+12>>2]|0;s=r;while(1){t=f+(s<<2)|0;u=c[t>>2]|0;r=(u>>>14)-131071|0;if((r|0)==-1){break}g=s+1+r|0;if((g|0)==-1){break}else{s=g}}f=p+~s|0;if((((f|0)>-1?f:-f|0)|0)>131071){Cd(c[b+12>>2]|0,1760);v=c[t>>2]|0}else{v=u}c[t>>2]=v&16383|(f<<14)+2147467264}}while(0);v=e+16|0;e=c[v>>2]|0;c[b+28>>2]=c[b+24>>2];t=b+32|0;if((e|0)==-1){c[v>>2]=-1;return}u=c[t>>2]|0;if((u|0)==-1){c[t>>2]=e;c[v>>2]=-1;return}t=c[(c[b>>2]|0)+12>>2]|0;p=u;while(1){w=t+(p<<2)|0;x=c[w>>2]|0;u=(x>>>14)-131071|0;if((u|0)==-1){break}o=p+1+u|0;if((o|0)==-1){break}else{p=o}}t=e+~p|0;if((((t|0)>-1?t:-t|0)|0)>131071){Cd(c[b+12>>2]|0,1760);y=c[w>>2]|0}else{y=x}c[w>>2]=y&16383|(t<<14)+2147467264;c[v>>2]=-1;return}function vc(a,b,d){a=a|0;b=b|0;d=d|0;c[b+12>>2]=rc(a,d)|0;c[b>>2]=9;return}function wc(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;g=i;i=i+24|0;j=g|0;c[j+20>>2]=-1;c[j+16>>2]=-1;c[j>>2]=5;h[j+8>>3]=0.0;if((e|0)==0){k=f|0;do{if((c[k>>2]|0)==5){if(!((c[f+16>>2]|0)==-1)){l=5;break}if(!((c[f+20>>2]|0)==-1)){l=5}}else{l=5}}while(0);a:do{if((l|0)==5){mc(b,f);do{if((c[k>>2]|0)==12){m=c[f+8>>2]|0;if((c[f+16>>2]|0)==(c[f+20>>2]|0)){break a}if((m|0)<(d[b+50|0]|0)){break}oc(b,f,m);break a}}while(0);nc(b,f)}}while(0);xc(b,18,f,j);i=g;return}else if((e|0)==1){mc(b,f);k=f|0;b:do{switch(c[k>>2]|0){case 1:case 3:{c[k>>2]=2;break};case 5:{c[k>>2]=+h[f+8>>3]==0.0?2:3;break};case 4:{m=c[f+8>>2]|0;n=c[(c[b>>2]|0)+8>>2]|0;if((c[n+(m<<4)+8>>2]|0)==4){o=(c[(c[n+(m<<4)>>2]|0)+12>>2]|0)==0?2:3}else{o=3}c[k>>2]=o;break};case 2:{c[k>>2]=3;break};case 10:{m=c[(c[b>>2]|0)+12>>2]|0;n=c[f+8>>2]|0;p=m+(n<<2)|0;if((n|0)>0){q=m+(n-1<<2)|0;n=c[q>>2]|0;if((a[288+(n&63)|0]|0)<0){r=q;s=n}else{l=20}}else{l=20}if((l|0)==20){r=p;s=c[p>>2]|0}c[r>>2]=((s&16320|0)==0)<<6|s&-16321;break};case 11:{p=b+36|0;n=c[p>>2]|0;q=n+1|0;m=b|0;t=c[m>>2]|0;if((n|0)<(d[t+75|0]|0)){u=n}else{if((n|0)>248){Cd(c[b+12>>2]|0,1080);v=c[m>>2]|0}else{v=t}a[v+75|0]=q;u=c[p>>2]|0}c[p>>2]=u+1;Ec(b,f,u);if((c[k>>2]|0)==12){l=28;break b}w=f+8|0;l=31;break};case 12:{l=28;break};default:{}}}while(0);do{if((l|0)==28){u=f+8|0;v=c[u>>2]|0;if((v&256|0)!=0){w=u;l=31;break}if((d[b+50|0]|0)>(v|0)){w=u;l=31;break}v=b+36|0;c[v>>2]=(c[v>>2]|0)-1;w=u;l=31}}while(0);if((l|0)==31){c[w>>2]=Bc(b,c[w>>2]<<23|19,c[(c[b+12>>2]|0)+8>>2]|0)|0;c[k>>2]=11}k=f+20|0;w=c[k>>2]|0;u=f+16|0;v=c[u>>2]|0;c[k>>2]=v;c[u>>2]=w;if((v|0)==-1){x=w}else{w=c[(c[b>>2]|0)+12>>2]|0;k=v;do{v=w+(k<<2)|0;if((k|0)>0){s=w+(k-1<<2)|0;r=c[s>>2]|0;if((a[288+(r&63)|0]|0)<0){y=s;z=r}else{l=36}}else{l=36}if((l|0)==36){l=0;y=v;z=c[v>>2]|0}if((z&63|0)==27){c[y>>2]=z&8372224|z>>>23<<6|26}r=((c[v>>2]|0)>>>14)-131071|0;if((r|0)==-1){break}k=k+1+r|0;}while(!((k|0)==-1));x=c[u>>2]|0}if((x|0)==-1){i=g;return}u=c[(c[b>>2]|0)+12>>2]|0;k=x;while(1){x=u+(k<<2)|0;if((k|0)>0){z=u+(k-1<<2)|0;y=c[z>>2]|0;if((a[288+(y&63)|0]|0)<0){A=z;B=y}else{l=46}}else{l=46}if((l|0)==46){l=0;A=x;B=c[x>>2]|0}if((B&63|0)==27){c[A>>2]=B&8372224|B>>>23<<6|26}y=((c[x>>2]|0)>>>14)-131071|0;if((y|0)==-1){l=57;break}x=k+1+y|0;if((x|0)==-1){l=57;break}else{k=x}}if((l|0)==57){i=g;return}}else if((e|0)==2){mc(b,f);do{if((c[f>>2]|0)==12){e=c[f+8>>2]|0;if((c[f+16>>2]|0)==(c[f+20>>2]|0)){break}if((e|0)<(d[b+50|0]|0)){l=55;break}oc(b,f,e)}else{l=55}}while(0);if((l|0)==55){nc(b,f)}xc(b,20,f,j);i=g;return}else{i=g;return}}function xc(a,b,e,f){a=a|0;b=b|0;e=e|0;f=f|0;var g=0,i=0,j=0,k=0.0,l=0.0,m=0,n=0.0,o=0.0;g=e|0;a:do{if((c[g>>2]|0)==5){if(!((c[e+16>>2]|0)==-1)){i=19;break}if(!((c[e+20>>2]|0)==-1)){i=19;break}if((c[f>>2]|0)!=5){i=19;break}if(!((c[f+16>>2]|0)==-1)){i=19;break}if(!((c[f+20>>2]|0)==-1)){i=19;break}j=e+8|0;k=+h[j>>3];l=+h[f+8>>3];switch(b|0){case 20:{m=0;break a;break};case 12:{n=k+l;i=17;break};case 13:{n=k-l;i=17;break};case 14:{n=k*l;i=17;break};case 15:{if(l==0.0){i=20;break a}n=k/l;i=17;break};case 16:{if(l==0.0){i=20;break a}n=k-l*+O(k/l);i=17;break};case 17:{n=+R(+k,+l);i=17;break};case 18:{n=-0.0-k;i=17;break};default:{o=0.0}}if((i|0)==17){if(!(n!=n)&!(D=0.0,D!=D)){o=n}else{i=19;break}}h[j>>3]=o;return}else{i=19}}while(0);if((i|0)==19){if((b|0)==20|(b|0)==18){m=0}else{i=20}}if((i|0)==20){m=rc(a,f)|0}i=rc(a,e)|0;do{if((i|0)>(m|0)){do{if((c[g>>2]|0)==12){j=c[e+8>>2]|0;if((j&256|0)!=0){break}if((d[a+50|0]|0|0)>(j|0)){break}j=a+36|0;c[j>>2]=(c[j>>2]|0)-1}}while(0);if((c[f>>2]|0)!=12){break}j=c[f+8>>2]|0;if((j&256|0)!=0){break}if((d[a+50|0]|0|0)>(j|0)){break}j=a+36|0;c[j>>2]=(c[j>>2]|0)-1}else{do{if((c[f>>2]|0)==12){j=c[f+8>>2]|0;if((j&256|0)!=0){break}if((d[a+50|0]|0|0)>(j|0)){break}j=a+36|0;c[j>>2]=(c[j>>2]|0)-1}}while(0);if((c[g>>2]|0)!=12){break}j=c[e+8>>2]|0;if((j&256|0)!=0){break}if((d[a+50|0]|0|0)>(j|0)){break}j=a+36|0;c[j>>2]=(c[j>>2]|0)-1}}while(0);c[e+8>>2]=Bc(a,m<<14|b|i<<23,c[(c[a+12>>2]|0)+8>>2]|0)|0;c[g>>2]=11;return}function yc(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;switch(e|0){case 14:{mc(b,f);e=f|0;g=c[e>>2]|0;a:do{if((g|0)==10){h=c[f+8>>2]|0;i=18}else if(!((g|0)==1|(g|0)==3)){j=f+8|0;do{if((g|0)==11){k=c[b>>2]|0;l=c[(c[k+12>>2]|0)+(c[j>>2]<<2)>>2]|0;if((l&63|0)!=19){m=k;i=9;break}k=b+24|0;c[k>>2]=(c[k>>2]|0)-1;h=Dc(b,26,l>>>23,0,0)|0;i=18;break a}else if((g|0)==12){i=14}else{m=c[b>>2]|0;i=9}}while(0);if((i|0)==9){l=b+36|0;k=c[l>>2]|0;n=k+1|0;o=b|0;if((k|0)<(d[m+75|0]|0|0)){p=k}else{if((k|0)>248){Cd(c[b+12>>2]|0,1080);q=c[o>>2]|0}else{q=m}a[q+75|0]=n;p=c[l>>2]|0}c[l>>2]=p+1;Ec(b,f,p);if((c[e>>2]|0)==12){i=14}}do{if((i|0)==14){l=c[j>>2]|0;if((l&256|0)!=0){break}if((d[b+50|0]|0|0)>(l|0)){break}l=b+36|0;c[l>>2]=(c[l>>2]|0)-1}}while(0);h=Dc(b,27,255,c[j>>2]|0,1)|0;i=18}}while(0);do{if((i|0)==18){e=f+16|0;if((h|0)==-1){break}p=c[e>>2]|0;if((p|0)==-1){c[e>>2]=h;break}e=c[(c[b>>2]|0)+12>>2]|0;q=p;while(1){r=e+(q<<2)|0;s=c[r>>2]|0;p=(s>>>14)-131071|0;if((p|0)==-1){break}m=q+1+p|0;if((m|0)==-1){break}else{q=m}}e=h+~q|0;if((((e|0)>-1?e:-e|0)|0)>131071){Cd(c[b+12>>2]|0,1760);t=c[r>>2]|0}else{t=s}c[r>>2]=t&16383|(e<<14)+2147467264}}while(0);t=f+20|0;r=c[t>>2]|0;c[b+28>>2]=c[b+24>>2];s=b+32|0;do{if(!((r|0)==-1)){h=c[s>>2]|0;if((h|0)==-1){c[s>>2]=r;break}i=c[(c[b>>2]|0)+12>>2]|0;e=h;while(1){u=i+(e<<2)|0;v=c[u>>2]|0;h=(v>>>14)-131071|0;if((h|0)==-1){break}j=e+1+h|0;if((j|0)==-1){break}else{e=j}}i=r+~e|0;if((((i|0)>-1?i:-i|0)|0)>131071){Cd(c[b+12>>2]|0,1760);w=c[u>>2]|0}else{w=v}c[u>>2]=w&16383|(i<<14)+2147467264}}while(0);c[t>>2]=-1;return};case 13:{uc(b,f);return};case 6:{nc(b,f);return};case 0:case 1:case 2:case 3:case 4:case 5:{do{if((c[f>>2]|0)==5){if(!((c[f+16>>2]|0)==-1)){break}if(!((c[f+20>>2]|0)==-1)){break}return}}while(0);rc(b,f)|0;return};default:{rc(b,f)|0;return}}}function zc(a,b,e,f){a=a|0;b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;switch(b|0){case 8:{b=rc(a,e)|0;g=rc(a,f)|0;do{if((c[f>>2]|0)==12){h=c[f+8>>2]|0;if((h&256|0)!=0){break}if((d[a+50|0]|0|0)>(h|0)){break}h=a+36|0;c[h>>2]=(c[h>>2]|0)-1}}while(0);h=e|0;i=e+8|0;do{if((c[h>>2]|0)==12){j=c[i>>2]|0;if((j&256|0)!=0){break}if((d[a+50|0]|0|0)>(j|0)){break}j=a+36|0;c[j>>2]=(c[j>>2]|0)-1}}while(0);c[i>>2]=Dc(a,23,1,b,g)|0;c[h>>2]=10;return};case 1:{xc(a,13,e,f);return};case 4:{xc(a,16,e,f);return};case 7:{h=rc(a,e)|0;g=rc(a,f)|0;do{if((c[f>>2]|0)==12){b=c[f+8>>2]|0;if((b&256|0)!=0){break}if((d[a+50|0]|0|0)>(b|0)){break}b=a+36|0;c[b>>2]=(c[b>>2]|0)-1}}while(0);b=e|0;i=e+8|0;do{if((c[b>>2]|0)==12){j=c[i>>2]|0;if((j&256|0)!=0){break}if((d[a+50|0]|0|0)>(j|0)){break}j=a+36|0;c[j>>2]=(c[j>>2]|0)-1}}while(0);c[i>>2]=Dc(a,23,0,h,g)|0;c[b>>2]=10;return};case 2:{xc(a,14,e,f);return};case 13:{mc(a,f);b=f+20|0;g=c[e+20>>2]|0;do{if(!((g|0)==-1)){h=c[b>>2]|0;if((h|0)==-1){c[b>>2]=g;break}i=c[(c[a>>2]|0)+12>>2]|0;j=h;while(1){k=i+(j<<2)|0;l=c[k>>2]|0;h=(l>>>14)-131071|0;if((h|0)==-1){break}m=j+1+h|0;if((m|0)==-1){break}else{j=m}}i=g+~j|0;if((((i|0)>-1?i:-i|0)|0)>131071){Cd(c[a+12>>2]|0,1760);n=c[k>>2]|0}else{n=l}c[k>>2]=n&16383|(i<<14)+2147467264}}while(0);n=e;k=f;c[n>>2]=c[k>>2];c[n+4>>2]=c[k+4>>2];c[n+8>>2]=c[k+8>>2];c[n+12>>2]=c[k+12>>2];c[n+16>>2]=c[k+16>>2];c[n+20>>2]=c[k+20>>2];return};case 9:{k=rc(a,e)|0;n=rc(a,f)|0;do{if((c[f>>2]|0)==12){l=c[f+8>>2]|0;if((l&256|0)!=0){break}if((d[a+50|0]|0|0)>(l|0)){break}l=a+36|0;c[l>>2]=(c[l>>2]|0)-1}}while(0);l=e|0;g=e+8|0;do{if((c[l>>2]|0)==12){b=c[g>>2]|0;if((b&256|0)!=0){break}if((d[a+50|0]|0|0)>(b|0)){break}b=a+36|0;c[b>>2]=(c[b>>2]|0)-1}}while(0);c[g>>2]=Dc(a,24,1,k,n)|0;c[l>>2]=10;return};case 14:{mc(a,f);l=f+16|0;n=c[e+16>>2]|0;do{if(!((n|0)==-1)){k=c[l>>2]|0;if((k|0)==-1){c[l>>2]=n;break}g=c[(c[a>>2]|0)+12>>2]|0;b=k;while(1){o=g+(b<<2)|0;p=c[o>>2]|0;k=(p>>>14)-131071|0;if((k|0)==-1){break}i=b+1+k|0;if((i|0)==-1){break}else{b=i}}g=n+~b|0;if((((g|0)>-1?g:-g|0)|0)>131071){Cd(c[a+12>>2]|0,1760);q=c[o>>2]|0}else{q=p}c[o>>2]=q&16383|(g<<14)+2147467264}}while(0);q=e;o=f;c[q>>2]=c[o>>2];c[q+4>>2]=c[o+4>>2];c[q+8>>2]=c[o+8>>2];c[q+12>>2]=c[o+12>>2];c[q+16>>2]=c[o+16>>2];c[q+20>>2]=c[o+20>>2];return};case 6:{o=f+16|0;q=f+20|0;p=(c[o>>2]|0)==(c[q>>2]|0);mc(a,f);n=f|0;a:do{if(!p){do{if((c[n>>2]|0)==12){l=c[f+8>>2]|0;if((c[o>>2]|0)==(c[q>>2]|0)){break a}if((l|0)<(d[a+50|0]|0|0)){break}oc(a,f,l);break a}}while(0);nc(a,f)}}while(0);do{if((c[n>>2]|0)==11){q=f+8|0;o=c[q>>2]|0;p=c[(c[a>>2]|0)+12>>2]|0;b=c[p+(o<<2)>>2]|0;if((b&63|0)!=21){break}l=e|0;g=e+8|0;do{if((c[l>>2]|0)==12){j=c[g>>2]|0;if((j&256|0)!=0){r=o;s=b;break}if((d[a+50|0]|0|0)>(j|0)){r=o;s=b;break}j=a+36|0;c[j>>2]=(c[j>>2]|0)-1;j=c[q>>2]|0;r=j;s=c[p+(j<<2)>>2]|0}else{r=o;s=b}}while(0);c[p+(r<<2)>>2]=c[g>>2]<<23|s&8388607;c[l>>2]=11;c[g>>2]=c[q>>2];return}}while(0);nc(a,f);xc(a,21,e,f);return};case 0:{xc(a,12,e,f);return};case 5:{xc(a,17,e,f);return};case 12:{s=rc(a,e)|0;r=rc(a,f)|0;do{if((c[f>>2]|0)==12){n=c[f+8>>2]|0;if((n&256|0)!=0){break}if((d[a+50|0]|0|0)>(n|0)){break}n=a+36|0;c[n>>2]=(c[n>>2]|0)-1}}while(0);n=e|0;b=e+8|0;do{if((c[n>>2]|0)==12){o=c[b>>2]|0;if((o&256|0)!=0){break}if((d[a+50|0]|0|0)>(o|0)){break}o=a+36|0;c[o>>2]=(c[o>>2]|0)-1}}while(0);c[b>>2]=Dc(a,25,1,r,s)|0;c[n>>2]=10;return};case 3:{xc(a,15,e,f);return};case 11:{n=rc(a,e)|0;s=rc(a,f)|0;do{if((c[f>>2]|0)==12){r=c[f+8>>2]|0;if((r&256|0)!=0){break}if((d[a+50|0]|0|0)>(r|0)){break}r=a+36|0;c[r>>2]=(c[r>>2]|0)-1}}while(0);r=e|0;b=e+8|0;do{if((c[r>>2]|0)==12){o=c[b>>2]|0;if((o&256|0)!=0){break}if((d[a+50|0]|0|0)>(o|0)){break}o=a+36|0;c[o>>2]=(c[o>>2]|0)-1}}while(0);c[b>>2]=Dc(a,24,1,s,n)|0;c[r>>2]=10;return};case 10:{r=rc(a,e)|0;n=rc(a,f)|0;do{if((c[f>>2]|0)==12){s=c[f+8>>2]|0;if((s&256|0)!=0){break}if((d[a+50|0]|0|0)>(s|0)){break}s=a+36|0;c[s>>2]=(c[s>>2]|0)-1}}while(0);f=e|0;s=e+8|0;do{if((c[f>>2]|0)==12){e=c[s>>2]|0;if((e&256|0)!=0){break}if((d[a+50|0]|0|0)>(e|0)){break}e=a+36|0;c[e>>2]=(c[e>>2]|0)-1}}while(0);c[s>>2]=Dc(a,25,1,r,n)|0;c[f>>2]=10;return};default:{return}}}function Ac(a,b){a=a|0;b=b|0;c[(c[(c[a>>2]|0)+20>>2]|0)+((c[a+24>>2]|0)-1<<2)>>2]=b;return}function Bc(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;f=b|0;g=c[f>>2]|0;h=b+32|0;i=c[h>>2]|0;j=b+24|0;k=c[j>>2]|0;if((i|0)==-1){l=k}else{m=b+12|0;n=i;i=g;while(1){o=c[i+12>>2]|0;p=o+(n<<2)|0;q=c[p>>2]|0;r=(q>>>14)-131071|0;if((r|0)==-1){s=-1}else{s=n+1+r|0}if((n|0)>0){r=o+(n-1<<2)|0;o=c[r>>2]|0;if((a[288+(o&63)|0]|0)<0){t=r;u=o}else{v=7}}else{v=7}if((v|0)==7){v=0;t=p;u=q}if((u&63|0)==27){c[t>>2]=u&8372224|u>>>23<<6|26;o=k+~n|0;if((((o|0)>-1?o:-o|0)|0)>131071){Cd(c[m>>2]|0,1760)}w=c[p>>2]&16383|(o<<14)+2147467264}else{o=k+~n|0;if((((o|0)>-1?o:-o|0)|0)>131071){Cd(c[m>>2]|0,1760);x=c[p>>2]|0}else{x=q}w=x&16383|(o<<14)+2147467264}c[p>>2]=w;if((s|0)==-1){break}n=s;i=c[f>>2]|0}l=c[j>>2]|0}c[h>>2]=-1;h=g+44|0;if((l|0)<(c[h>>2]|0)){y=l;z=c[g+12>>2]|0}else{l=g+12|0;f=Md(c[b+16>>2]|0,c[l>>2]|0,h,4,2147483645,2784)|0;c[l>>2]=f;y=c[j>>2]|0;z=f}c[z+(y<<2)>>2]=d;d=c[j>>2]|0;y=g+48|0;if((d|0)<(c[y>>2]|0)){A=d;B=c[g+20>>2]|0;C=B+(A<<2)|0;c[C>>2]=e;D=c[j>>2]|0;E=D+1|0;c[j>>2]=E;return D|0}else{d=g+20|0;g=Md(c[b+16>>2]|0,c[d>>2]|0,y,4,2147483645,2784)|0;c[d>>2]=g;A=c[j>>2]|0;B=g;C=B+(A<<2)|0;c[C>>2]=e;D=c[j>>2]|0;E=D+1|0;c[j>>2]=E;return D|0}return 0}function Cc(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=((d-1|0)/50|0)+1|0;d=b<<6|((e|0)==-1?0:e<<23)|34;if((f|0)<512){Bc(a,f<<14|d,c[(c[a+12>>2]|0)+8>>2]|0)|0;g=b+1|0;h=a+36|0;c[h>>2]=g;return}else{e=a+12|0;Bc(a,d,c[(c[e>>2]|0)+8>>2]|0)|0;Bc(a,f,c[(c[e>>2]|0)+8>>2]|0)|0;g=b+1|0;h=a+36|0;c[h>>2]=g;return}}function Dc(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;g=a+12|0;Bc(a,d<<6|b|e<<23|f<<14,c[(c[g>>2]|0)+8>>2]|0)|0;f=a+32|0;e=c[f>>2]|0;c[f>>2]=-1;f=Bc(a,2147450902,c[(c[g>>2]|0)+8>>2]|0)|0;if((e|0)==-1){h=f;return h|0}if((f|0)==-1){h=e;return h|0}b=c[(c[a>>2]|0)+12>>2]|0;a=f;while(1){i=b+(a<<2)|0;j=c[i>>2]|0;d=(j>>>14)-131071|0;if((d|0)==-1){break}k=a+1+d|0;if((k|0)==-1){break}else{a=k}}b=e+~a|0;if((((b|0)>-1?b:-b|0)|0)>131071){Cd(c[g>>2]|0,1760);l=c[i>>2]|0}else{l=j}c[i>>2]=l&16383|(b<<14)+2147467264;h=f;return h|0}function Ec(a,b,e){a=a|0;b=b|0;e=e|0;var f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;i=i+16|0;g=f|0;mc(a,b);j=b|0;k=c[j>>2]|0;a:do{switch(k|0){case 1:{l=c[a+24>>2]|0;do{if((l|0)>(c[a+28>>2]|0)){if((l|0)==0){if((d[a+50|0]|0|0)>(e|0)){break}else{break a}}m=(c[(c[a>>2]|0)+12>>2]|0)+(l-1<<2)|0;n=c[m>>2]|0;if((n&63|0)!=3){break}o=n>>>23;if((n>>>6&255|0)>(e|0)){break}if((o+1|0)<(e|0)){break}if((o|0)>=(e|0)){break a}c[m>>2]=n&8388607|e<<23;break a}}while(0);Bc(a,e<<23|e<<6|3,c[(c[a+12>>2]|0)+8>>2]|0)|0;break};case 4:{Bc(a,e<<6|c[b+8>>2]<<14|1,c[(c[a+12>>2]|0)+8>>2]|0)|0;break};case 12:{l=c[b+8>>2]|0;if((l|0)==(e|0)){break a}Bc(a,l<<23|e<<6,c[(c[a+12>>2]|0)+8>>2]|0)|0;break};case 11:{l=(c[(c[a>>2]|0)+12>>2]|0)+(c[b+8>>2]<<2)|0;c[l>>2]=c[l>>2]&-16321|e<<6&16320;break};case 5:{h[g>>3]=+h[b+8>>3];c[g+8>>2]=3;Bc(a,e<<6|(ic(a,g,g)|0)<<14|1,c[(c[a+12>>2]|0)+8>>2]|0)|0;break};case 3:case 2:{Bc(a,e<<6|((k|0)==2)<<23|2,c[(c[a+12>>2]|0)+8>>2]|0)|0;break};default:{i=f;return}}}while(0);c[b+8>>2]=e;c[j>>2]=12;i=f;return}function Fc(a){a=a|0;return(Gc(a,c[a+44>>2]|0,255)|0)!=0|0}function Gc(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;g=c[b+44>>2]|0;h=a[b+75|0]|0;if(!((h&255)>>>0<251>>>0)){i=0;return i|0}j=h&255;k=a[b+74|0]|0;l=k&255;if(((l&1)+(d[b+73|0]|0)|0)>(j|0)|(l&5|0)==4){i=0;return i|0}l=d[b+72|0]|0;if((c[b+36>>2]|0)>(l|0)){i=0;return i|0}m=c[b+48>>2]|0;if(!(((m|0)==(g|0)|(m|0)==0)&(g|0)>0)){i=0;return i|0}m=g-1|0;n=c[b+12>>2]|0;o=c[n+(m<<2)>>2]|0;if((o&63|0)!=30){i=0;return i|0}if((e|0)<=0){i=o;return i|0}o=b+8|0;p=(f|0)==255;q=b+52|0;r=b+16|0;s=b+40|0;b=m;m=0;a:while(1){t=c[n+(m<<2)>>2]|0;u=t&63;v=t>>>6&255;if(!(u>>>0<38>>>0)){i=0;w=77;break}x=h&255;if(!(v>>>0<x>>>0)){i=0;w=77;break}y=a[288+u|0]|0;z=y&255;A=z&3;do{if((A|0)==0){B=t>>>23;C=t>>>14;D=C&511;E=z>>>4&3;do{if((E|0)==2){if(!(x>>>0>B>>>0)){i=0;w=77;break a}}else if((E|0)==0){if((B|0)!=0){i=0;w=77;break a}}else if((E|0)==3){if((B&256|0)==0){if(x>>>0>B>>>0){break}else{i=0;w=77;break a}}else{if((B&255|0)<(c[s>>2]|0)){break}else{i=0;w=77;break a}}}}while(0);E=z>>>2&3;if((E|0)==2){if(j>>>0>D>>>0){F=B;G=D;break}else{i=0;w=77;break a}}else if((E|0)==0){if((D|0)==0){F=B;G=0;break}else{i=0;w=77;break a}}else if((E|0)==3){if((C&256|0)==0){if(j>>>0>D>>>0){F=B;G=D;break}else{i=0;w=77;break a}}else{if((C&255|0)<(c[s>>2]|0)){F=B;G=D;break}else{i=0;w=77;break a}}}else{F=B;G=D;break}}else if((A|0)==2){E=(t>>>14)-131071|0;if((z&48|0)!=32){F=E;G=0;break}H=m+1+E|0;if(!((H|0)>-1&(H|0)<(g|0))){i=0;w=77;break a}if((H|0)<=0){F=E;G=0;break}I=E+m|0;J=0;while(1){K=J+1|0;if((c[n+(I-J<<2)>>2]&8372287|0)!=34){L=J;break}if((K|0)<(H|0)){J=K}else{L=K;break}}if((L&1|0)==0){F=E;G=0}else{i=0;w=77;break a}}else if((A|0)==1){J=t>>>14;if((z&48|0)!=48){F=J;G=0;break}if((J|0)<(c[s>>2]|0)){F=J;G=0}else{i=0;w=77;break a}}else{F=0;G=0}}while(0);z=(y&64)!=0&(v|0)==(f|0)?m:b;if(y<<24>>24<0){if((m+2|0)>=(g|0)){i=0;w=77;break}if((c[n+(m+1<<2)>>2]&63|0)!=22){i=0;w=77;break}}b:do{switch(u|0){case 21:{if((F|0)<(G|0)){M=m;N=z}else{i=0;w=77;break a}break};case 33:{if((G|0)==0){i=0;w=77;break a}t=v+2|0;if((G+t|0)>=(h&255|0)){i=0;w=77;break a}M=m;N=(t|0)>(f|0)?z:m;break};case 37:{if(!((k&6)==2)){i=0;w=77;break a}if((F|0)==0){t=c[n+(m+1<<2)>>2]|0;A=t&63;if(!((A|0)==28|(A|0)==29|(A|0)==30|(A|0)==34)){i=0;w=77;break a}if(!(t>>>0<8388608>>>0)){i=0;w=77;break a}}if((v-1+F|0)>(h&255|0)){i=0;w=77;break a}else{M=m;N=z}break};case 22:{w=49;break};case 28:case 29:{if((F|0)!=0){if((F+v|0)>(h&255|0)){i=0;w=77;break a}}t=G-1|0;do{if((G|0)==0){A=c[n+(m+1<<2)>>2]|0;x=A&63;if(!((x|0)==28|(x|0)==29|(x|0)==30|(x|0)==34)){i=0;w=77;break a}if(!(A>>>0<8388608>>>0)){i=0;w=77;break a}}else{if((t|0)==0){break}if((t+v|0)>(h&255|0)){i=0;w=77;break a}}}while(0);M=m;N=(v|0)>(f|0)?z:m;break};case 2:{if((G|0)!=1){M=m;N=z;break b}if((m+2|0)>=(g|0)){i=0;w=77;break a}if((c[n+(m+1<<2)>>2]&8372287|0)==34){i=0;w=77;break a}else{M=m;N=z}break};case 34:{if((F|0)>0){if((F+v|0)>=(h&255|0)){i=0;w=77;break a}}if((G|0)!=0){M=m;N=z;break b}t=m+1|0;if((t|0)<(g-1|0)){M=t;N=z}else{i=0;w=77;break a}break};case 36:{if((F|0)>=(c[q>>2]|0)){i=0;w=77;break a}t=a[(c[(c[r>>2]|0)+(F<<2)>>2]|0)+72|0]|0;E=t&255;A=E+m|0;if((A|0)>=(g|0)){i=0;w=77;break a}if(!(t<<24>>24==0)){t=1;while(1){if((c[n+(t+m<<2)>>2]&59|0)!=0){i=0;w=77;break a}if((t|0)<(E|0)){t=t+1|0}else{break}}}M=p?m:A;N=z;break};case 5:case 7:{if((c[(c[o>>2]|0)+(F<<4)+8>>2]|0)==4){M=m;N=z}else{i=0;w=77;break a}break};case 11:{t=v+1|0;if(!(t>>>0<(h&255)>>>0)){i=0;w=77;break a}M=m;N=(t|0)==(f|0)?m:z;break};case 4:case 8:{if((F|0)<(l|0)){M=m;N=z}else{i=0;w=77;break a}break};case 30:{t=F-1|0;if((t|0)<=0){M=m;N=z;break b}if((t+v|0)>(h&255|0)){i=0;w=77;break a}else{M=m;N=z}break};case 3:{M=m;N=(v|0)>(f|0)|(F|0)<(f|0)?z:m;break};case 31:case 32:{if((v+3|0)>>>0<(h&255)>>>0){w=49}else{i=0;w=77;break a}break};default:{M=m;N=z}}}while(0);if((w|0)==49){w=0;v=m+1+F|0;M=((m|0)>=(v|0)|p|(v|0)>(e|0)?0:F)+m|0;N=z}v=M+1|0;if((v|0)<(e|0)){b=N;m=v}else{w=76;break}}if((w|0)==76){i=c[n+(N<<2)>>2]|0;return i|0}else if((w|0)==77){return i|0}return 0}function Hc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;e=i;i=i+8|0;f=e|0;c[f>>2]=0;g=c[168+(c[b+8>>2]<<2)>>2]|0;h=c[a+20>>2]|0;j=c[h>>2]|0;k=c[h+8>>2]|0;a:do{if(j>>>0<k>>>0){l=j;while(1){m=l+16|0;if((l|0)==(b|0)){break}if(m>>>0<k>>>0){l=m}else{break a}}l=Ic(a,h,b-(c[a+12>>2]|0)>>4,f)|0;if((l|0)==0){break}m=c[f>>2]|0;Jc(a,3e3,(n=i,i=i+32|0,c[n>>2]=d,c[n+8>>2]=l,c[n+16>>2]=m,c[n+24>>2]=g,n)|0);i=n;i=e;return}}while(0);Jc(a,3216,(n=i,i=i+16|0,c[n>>2]=d,c[n+8>>2]=g,n)|0);i=n;i=e;return}function Ic(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;g=d+4|0;h=b+20|0;i=b+24|0;b=d+12|0;j=e;a:while(1){e=c[g>>2]|0;if((c[e+8>>2]|0)!=6){k=0;l=22;break}m=e;e=c[m>>2]|0;if((a[e+6|0]|0)!=0){k=0;l=22;break}n=c[e+16>>2]|0;e=n;if((c[h>>2]|0)==(d|0)){o=c[i>>2]|0;c[b>>2]=o;p=o;q=c[(c[m>>2]|0)+16>>2]|0}else{p=c[b>>2]|0;q=n}m=(p-(c[q+12>>2]|0)>>2)-1|0;o=kd(e,j+1|0,m)|0;c[f>>2]=o;if((o|0)!=0){k=1008;l=22;break}r=Gc(e,m,j)|0;switch(r&63|0){case 5:{l=9;break a;break};case 0:{break};case 11:{l=18;break a;break};case 6:{l=11;break a;break};case 4:{l=15;break a;break};default:{k=0;l=22;break a}}m=r>>>23;if(m>>>0<(r>>>6&255)>>>0){j=m}else{k=0;l=22;break}}if((l|0)==9){c[f>>2]=(c[(c[n+8>>2]|0)+(r>>>14<<4)>>2]|0)+16;k=896;return k|0}else if((l|0)==11){j=r>>>14;do{if((j&256|0)==0){s=3352}else{q=j&255;p=c[n+8>>2]|0;if((c[p+(q<<4)+8>>2]|0)!=4){s=3352;break}s=(c[p+(q<<4)>>2]|0)+16|0}}while(0);c[f>>2]=s;k=776;return k|0}else if((l|0)==15){s=c[n+28>>2]|0;if((s|0)==0){t=3352}else{t=(c[s+(r>>>23<<2)>>2]|0)+16|0}c[f>>2]=t;k=3256;return k|0}else if((l|0)==18){t=r>>>14;do{if((t&256|0)==0){u=3352}else{r=t&255;s=c[n+8>>2]|0;if((c[s+(r<<4)+8>>2]|0)!=4){u=3352;break}u=(c[s+(r<<4)>>2]|0)+16|0}}while(0);c[f>>2]=u;k=3128;return k|0}else if((l|0)==22){return k|0}return 0}function Jc(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;f=i;i=i+80|0;g=f+64|0;h=g;c[h>>2]=e;c[h+4>>2]=0;h=Ud(b,d,g|0)|0;g=c[b+20>>2]|0;d=c[g+4>>2]|0;if((c[d+8>>2]|0)!=6){Nc(b);i=f;return}e=d;if((a[(c[e>>2]|0)+6|0]|0)!=0){Nc(b);i=f;return}d=f|0;j=c[b+24>>2]|0;c[g+12>>2]=j;g=c[(c[e>>2]|0)+16>>2]|0;e=j-(c[g+12>>2]|0)|0;j=(e>>2)-1|0;do{if((e|0)<4){k=-1}else{l=c[g+20>>2]|0;if((l|0)==0){k=0;break}k=c[l+(j<<2)>>2]|0}}while(0);Wd(d,(c[g+32>>2]|0)+16|0,60);Vd(b,1200,(g=i,i=i+24|0,c[g>>2]=d,c[g+8>>2]=k,c[g+16>>2]=h,g)|0)|0;i=g;Nc(b);i=f;return}function Kc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;e=i;i=i+8|0;f=e|0;g=((c[b+8>>2]|0)-3|0)>>>0<2>>>0?d:b;c[f>>2]=0;b=c[168+(c[g+8>>2]<<2)>>2]|0;d=c[a+20>>2]|0;h=c[d>>2]|0;j=c[d+8>>2]|0;a:do{if(h>>>0<j>>>0){k=h;while(1){l=k+16|0;if((k|0)==(g|0)){break}if(l>>>0<j>>>0){k=l}else{break a}}k=Ic(a,d,g-(c[a+12>>2]|0)>>4,f)|0;if((k|0)==0){break}l=c[f>>2]|0;Jc(a,3e3,(m=i,i=i+32|0,c[m>>2]=2536,c[m+8>>2]=k,c[m+16>>2]=l,c[m+24>>2]=b,m)|0);i=m;n=4;o=0;i=e;return}}while(0);Jc(a,3216,(m=i,i=i+16|0,c[m>>2]=2536,c[m+8>>2]=b,m)|0);i=m;n=4;o=0;i=e;return}function Lc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;e=i;i=i+24|0;f=e|0;g=(Le(b,e+8|0)|0)==0;h=g?b:d;c[f>>2]=0;d=c[168+(c[h+8>>2]<<2)>>2]|0;b=c[a+20>>2]|0;g=c[b>>2]|0;j=c[b+8>>2]|0;a:do{if(g>>>0<j>>>0){k=g;while(1){l=k+16|0;if((k|0)==(h|0)){break}if(l>>>0<j>>>0){k=l}else{break a}}k=Ic(a,b,h-(c[a+12>>2]|0)>>4,f)|0;if((k|0)==0){break}l=c[f>>2]|0;Jc(a,3e3,(m=i,i=i+32|0,c[m>>2]=1960,c[m+8>>2]=k,c[m+16>>2]=l,c[m+24>>2]=d,m)|0);i=m;n=4;o=0;i=e;return}}while(0);Jc(a,3216,(m=i,i=i+16|0,c[m>>2]=1960,c[m+8>>2]=d,m)|0);i=m;n=4;o=0;i=e;return}function Mc(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;g=c[168+(c[d+8>>2]<<2)>>2]|0;d=c[168+(c[e+8>>2]<<2)>>2]|0;if((a[g+2|0]|0)==(a[d+2|0]|0)){Jc(b,1600,(h=i,i=i+8|0,c[h>>2]=g,h)|0);i=h;i=f;return 0}else{Jc(b,1336,(h=i,i=i+16|0,c[h>>2]=g,c[h+8>>2]=d,h)|0);i=h;i=f;return 0}return 0}function Nc(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;b=c[a+116>>2]|0;if((b|0)==0){Oc(a,2);return}d=c[a+32>>2]|0;e=d+(b+8)|0;if((c[e>>2]|0)!=6){Oc(a,5)}f=a+8|0;g=c[f>>2]|0;h=g-16|0;i=g;j=c[h+4>>2]|0;c[i>>2]=c[h>>2];c[i+4>>2]=j;c[g+8>>2]=c[g-16+8>>2];g=c[f>>2]|0;j=d+b|0;b=g-16|0;d=c[j+4>>2]|0;c[b>>2]=c[j>>2];c[b+4>>2]=d;c[g-16+8>>2]=c[e>>2];e=c[f>>2]|0;if(((c[a+28>>2]|0)-e|0)<17){Sc(a,1);k=c[f>>2]|0}else{k=e}c[f>>2]=k+16;Wc(a,k-16|0,1);Oc(a,2);return}function Oc(d,e){d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;f=d+112|0;g=c[f>>2]|0;if((g|0)!=0){c[g+160>>2]=e;Ka((c[f>>2]|0)+4|0,1)}a[d+6|0]=e;g=d+16|0;if((c[(c[g>>2]|0)+88>>2]|0)==0){Ga(1)}h=d+40|0;i=c[h>>2]|0;j=d+20|0;c[j>>2]=i;k=c[i>>2]|0;i=d+12|0;c[i>>2]=k;gd(d,k);k=c[i>>2]|0;if((e|0)==5){c[k>>2]=se(d,3136,23)|0;c[k+8>>2]=4}else if((e|0)==4){c[k>>2]=se(d,2704,17)|0;c[k+8>>2]=4}else if((e|0)==3|(e|0)==2){e=c[d+8>>2]|0;i=e-16|0;l=k;m=c[i+4>>2]|0;c[l>>2]=c[i>>2];c[l+4>>2]=m;c[k+8>>2]=c[e-16+8>>2]}c[d+8>>2]=k+16;b[d+52>>1]=b[d+54>>1]|0;a[d+57|0]=1;k=d+48|0;e=c[k>>2]|0;do{if((e|0)>2e4){m=c[h>>2]|0;l=m;if(((((c[j>>2]|0)-l|0)/24|0)+1|0)>=2e4){break}i=Nd(d,m,e*24|0,48e4)|0;m=i;c[h>>2]=m;c[k>>2]=2e4;c[j>>2]=m+((((c[j>>2]|0)-l|0)/24|0)*24|0);c[d+36>>2]=i+479976}}while(0);c[d+116>>2]=0;c[f>>2]=0;fb[c[(c[g>>2]|0)+88>>2]&3](d)|0;Ga(1)}function Pc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;e=i;i=i+168|0;f=1;g=0;h=i;i=i+168|0;c[h>>2]=0;while(1)switch(f|0){case 1:j=e|0;k=j+160|0;c[k>>2]=0;l=a+112|0;m=j|0;c[m>>2]=c[l>>2];c[l>>2]=j;n=sf(j+4|0,f,h)|0;f=4;break;case 4:if((n|0)==0){f=2;break}else{f=3;break};case 2:ia(b|0,a|0,d|0);if((r|0)!=0&(s|0)!=0){g=tf(c[r>>2]|0,h)|0;if((g|0)>0){f=-1;break}else return 0}r=s=0;f=3;break;case 3:c[l>>2]=c[m>>2];i=e;return c[k>>2]|0;case-1:if((g|0)==1){n=s;f=4}r=s=0;break}return 0}function Qc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;d=a+32|0;e=c[d>>2]|0;f=b+6|0;if((b+7|0)>>>0<268435456>>>0){g=a+44|0;h=Nd(a,e,c[g>>2]<<4,f<<4)|0;i=g}else{h=Od(a)|0;i=a+44|0}g=h;c[d>>2]=g;c[i>>2]=f;c[a+28>>2]=g+(b<<4);b=a+8|0;f=e;c[b>>2]=g+((c[b>>2]|0)-f>>4<<4);b=c[a+104>>2]|0;do{if((b|0)!=0){e=b+8|0;c[e>>2]=g+((c[e>>2]|0)-f>>4<<4);e=c[b>>2]|0;if((e|0)==0){break}else{j=e}do{e=j+8|0;c[e>>2]=(c[d>>2]|0)+((c[e>>2]|0)-f>>4<<4);j=c[j>>2]|0;}while((j|0)!=0)}}while(0);j=c[a+40>>2]|0;b=a+20|0;if(j>>>0>(c[b>>2]|0)>>>0){k=a+12|0;l=c[k>>2]|0;m=l;n=m-f|0;o=n>>4;p=c[d>>2]|0;q=p+(o<<4)|0;c[k>>2]=q;return}else{r=j}do{j=r+8|0;c[j>>2]=(c[d>>2]|0)+((c[j>>2]|0)-f>>4<<4);j=r|0;c[j>>2]=(c[d>>2]|0)+((c[j>>2]|0)-f>>4<<4);j=r+4|0;c[j>>2]=(c[d>>2]|0)+((c[j>>2]|0)-f>>4<<4);r=r+24|0;}while(!(r>>>0>(c[b>>2]|0)>>>0));k=a+12|0;l=c[k>>2]|0;m=l;n=m-f|0;o=n>>4;p=c[d>>2]|0;q=p+(o<<4)|0;c[k>>2]=q;return}function Rc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=a+40|0;e=c[d>>2]|0;if((b+1|0)>>>0<178956971>>>0){f=a+48|0;g=Nd(a,e,(c[f>>2]|0)*24|0,b*24|0)|0;h=f}else{g=Od(a)|0;h=a+48|0}f=g;c[d>>2]=f;c[h>>2]=b;h=a+20|0;c[h>>2]=f+((((c[h>>2]|0)-e|0)/24|0)*24|0);c[a+36>>2]=f+((b-1|0)*24|0);return}function Sc(a,b){a=a|0;b=b|0;var d=0;d=c[a+44>>2]|0;if((d|0)<(b|0)){Qc(a,d+b|0);return}else{Qc(a,d<<1);return}}function Tc(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;f=i;i=i+104|0;g=f|0;h=c[b+68>>2]|0;if((h|0)==0){i=f;return}j=b+57|0;if((a[j]|0)==0){i=f;return}k=b+8|0;l=b+32|0;m=c[k>>2]|0;n=c[l>>2]|0;o=m-n|0;p=b+20|0;q=c[p>>2]|0;r=(c[q+8>>2]|0)-n|0;c[g>>2]=d;c[g+20>>2]=e;if((d|0)==4){c[g+100>>2]=0}else{c[g+100>>2]=(q-(c[b+40>>2]|0)|0)/24|0}do{if(((c[b+28>>2]|0)-m|0)<321){q=c[b+44>>2]|0;if((q|0)<20){Qc(b,q+20|0);break}else{Qc(b,q<<1);break}}}while(0);c[(c[p>>2]|0)+8>>2]=(c[k>>2]|0)+320;a[j]=0;hb[h&7](b,g);a[j]=1;c[(c[p>>2]|0)+8>>2]=(c[l>>2]|0)+r;c[k>>2]=(c[l>>2]|0)+o;i=f;return}function Uc(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0;g=i;if((c[e+8>>2]|0)==6){j=e;k=b+32|0}else{l=He(b,e,16)|0;m=b+32|0;n=e-(c[m>>2]|0)|0;o=l+8|0;if((c[o>>2]|0)!=6){Hc(b,e,888)}p=b+8|0;q=c[p>>2]|0;if(q>>>0>e>>>0){r=q;while(1){s=r-16|0;t=s;u=r;v=c[t+4>>2]|0;c[u>>2]=c[t>>2];c[u+4>>2]=v;c[r+8>>2]=c[r-16+8>>2];if(s>>>0>e>>>0){r=s}else{break}}w=c[p>>2]|0}else{w=q}do{if(((c[b+28>>2]|0)-w|0)<17){q=c[b+44>>2]|0;if((q|0)<1){Qc(b,q+1|0);break}else{Qc(b,q<<1);break}}}while(0);c[p>>2]=(c[p>>2]|0)+16;p=c[m>>2]|0;w=p+n|0;q=l;l=w;r=c[q+4>>2]|0;c[l>>2]=c[q>>2];c[l+4>>2]=r;c[p+(n+8)>>2]=c[o>>2];j=w;k=m}m=j-(c[k>>2]|0)|0;w=c[j>>2]|0;j=b+24|0;o=b+20|0;c[(c[o>>2]|0)+12>>2]=c[j>>2];if((a[w+6|0]|0)!=0){n=b+8|0;do{if(((c[b+28>>2]|0)-(c[n>>2]|0)|0)<321){p=c[b+44>>2]|0;if((p|0)<20){Qc(b,p+20|0);break}else{Qc(b,p<<1);break}}}while(0);p=c[o>>2]|0;r=b+36|0;do{if((p|0)==(c[r>>2]|0)){l=b+48|0;q=c[l>>2]|0;if((q|0)>2e4){Oc(b,5);return 0}e=q<<1;s=b+40|0;v=c[s>>2]|0;if((e|1)>>>0<178956971>>>0){x=Nd(b,v,q*24|0,q*48|0)|0}else{x=Od(b)|0}q=x;c[s>>2]=q;c[l>>2]=e;l=q+((((c[o>>2]|0)-v|0)/24|0)*24|0)|0;c[o>>2]=l;c[r>>2]=q+((e-1|0)*24|0);if((e|0)<=2e4){y=l;break}Jc(b,1184,(z=i,i=i+1|0,i=i+7&-8,c[z>>2]=0,z)|0);i=z;y=c[o>>2]|0}else{y=p}}while(0);p=y+24|0;c[o>>2]=p;r=c[k>>2]|0;c[y+28>>2]=r+m;x=r+(m+16)|0;c[p>>2]=x;c[b+12>>2]=x;c[y+32>>2]=(c[n>>2]|0)+320;c[y+40>>2]=f;if(!((a[b+56|0]&1)==0)){Tc(b,0,-1)}y=fb[c[(c[c[(c[o>>2]|0)+4>>2]>>2]|0)+16>>2]&3](b)|0;if((y|0)<0){A=2;i=g;return A|0}Vc(b,(c[n>>2]|0)+(-y<<4)|0)|0;A=1;i=g;return A|0}y=c[w+16>>2]|0;w=y;n=b+28|0;x=b+8|0;p=w+75|0;r=d[p]|0;do{if(((c[n>>2]|0)-(c[x>>2]|0)|0)<=(r<<4|0)){l=c[b+44>>2]|0;if((l|0)<(r|0)){Qc(b,l+r|0);break}else{Qc(b,l<<1);break}}}while(0);r=c[k>>2]|0;l=r+m|0;e=l;q=w+74|0;v=a[q]|0;do{if(v<<24>>24==0){s=r+(m+16)|0;u=s+(d[w+73|0]<<4)|0;if(!((c[x>>2]|0)>>>0>u>>>0)){B=e;C=s;break}c[x>>2]=u;B=e;C=s}else{s=c[x>>2]|0;u=(s-l>>4)-1|0;t=a[w+73|0]|0;D=t&255;if((D|0)>(u|0)){E=u;F=s;while(1){c[F+8>>2]=0;G=E+1|0;if((G|0)<(D|0)){E=G;F=F+16|0}else{break}}F=s+(D-u<<4)|0;c[x>>2]=F;H=D;I=a[q]|0;J=F}else{H=u;I=v;J=s}if((I&4)==0){K=0;L=J}else{F=H-D|0;E=c[b+16>>2]|0;if((c[E+68>>2]|0)>>>0<(c[E+64>>2]|0)>>>0){M=J}else{pd(b);M=c[x>>2]|0}E=d[p]|0;do{if(((c[n>>2]|0)-M|0)<=(E<<4|0)){G=c[b+44>>2]|0;if((G|0)<(E|0)){Qc(b,G+E|0);break}else{Qc(b,G<<1);break}}}while(0);E=ve(b,F,1)|0;if((F|0)>0){s=0;do{u=c[x>>2]|0;G=s-F|0;s=s+1|0;N=Ce(b,E,s)|0;O=u+(G<<4)|0;P=N;Q=c[O+4>>2]|0;c[P>>2]=c[O>>2];c[P+4>>2]=Q;c[N+8>>2]=c[u+(G<<4)+8>>2];}while((s|0)<(F|0))}s=De(b,E,se(b,1e3,1)|0)|0;h[s>>3]=+(F|0);c[s+8>>2]=3;K=E;L=c[x>>2]|0}do{if(!(t<<24>>24==0)){s=-H|0;c[x>>2]=L+16;G=L+(s<<4)|0;u=L;N=c[G+4>>2]|0;c[u>>2]=c[G>>2];c[u+4>>2]=N;N=L+(s<<4)+8|0;c[L+8>>2]=c[N>>2];c[N>>2]=0;if((t&255)>>>0>1>>>0){R=1}else{break}do{N=c[x>>2]|0;s=R-H|0;c[x>>2]=N+16;u=L+(s<<4)|0;G=N;Q=c[u+4>>2]|0;c[G>>2]=c[u>>2];c[G+4>>2]=Q;Q=L+(s<<4)+8|0;c[N+8>>2]=c[Q>>2];c[Q>>2]=0;R=R+1|0;}while((R|0)<(D|0))}}while(0);if((K|0)!=0){D=c[x>>2]|0;c[x>>2]=D+16;c[D>>2]=K;c[D+8>>2]=5}B=(c[k>>2]|0)+m|0;C=L}}while(0);L=c[o>>2]|0;m=b+36|0;do{if((L|0)==(c[m>>2]|0)){k=b+48|0;K=c[k>>2]|0;if((K|0)>2e4){Oc(b,5);return 0}R=K<<1;H=b+40|0;M=c[H>>2]|0;if((R|1)>>>0<178956971>>>0){S=Nd(b,M,K*24|0,K*48|0)|0}else{S=Od(b)|0}K=S;c[H>>2]=K;c[k>>2]=R;k=K+((((c[o>>2]|0)-M|0)/24|0)*24|0)|0;c[o>>2]=k;c[m>>2]=K+((R-1|0)*24|0);if((R|0)<=2e4){T=k;break}Jc(b,1184,(z=i,i=i+1|0,i=i+7&-8,c[z>>2]=0,z)|0);i=z;T=c[o>>2]|0}else{T=L}}while(0);L=T+24|0;c[o>>2]=L;c[T+28>>2]=B;c[L>>2]=C;c[b+12>>2]=C;L=T+32|0;c[L>>2]=C+(d[p]<<4);p=c[y+12>>2]|0;c[j>>2]=p;c[T+44>>2]=0;c[T+40>>2]=f;f=c[x>>2]|0;T=c[L>>2]|0;if(f>>>0<T>>>0){L=f;do{c[L+8>>2]=0;L=L+16|0;}while(L>>>0<T>>>0)}c[x>>2]=T;if((a[b+56|0]&1)==0){A=0;i=g;return A|0}c[j>>2]=p+4;Tc(b,0,-1);c[j>>2]=(c[j>>2]|0)-4;A=0;i=g;return A|0}function Vc(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;e=b+56|0;if((a[e]&2)==0){f=d;g=b+20|0}else{h=b+32|0;i=d-(c[h>>2]|0)|0;Tc(b,1,-1);d=b+20|0;j=c[d>>2]|0;a:do{if((a[(c[c[j+4>>2]>>2]|0)+6|0]|0)==0){if((a[e]&2)==0){break}k=j+20|0;l=c[k>>2]|0;c[k>>2]=l-1;if((l|0)==0){break}do{Tc(b,4,-1);if((a[e]&2)==0){break a}l=(c[d>>2]|0)+20|0;k=c[l>>2]|0;c[l>>2]=k-1;}while((k|0)!=0)}}while(0);f=(c[h>>2]|0)+i|0;g=d}d=c[g>>2]|0;i=d-24|0;c[g>>2]=i;g=c[d+4>>2]|0;h=c[d+16>>2]|0;c[b+12>>2]=c[i>>2];c[b+24>>2]=c[d-24+12>>2];d=b+8|0;if((h|0)==0){m=g;c[d>>2]=m;n=h+1|0;return n|0}else{o=h;p=g;q=f}while(1){if(!(q>>>0<(c[d>>2]|0)>>>0)){break}f=p+16|0;g=q;b=p;i=c[g+4>>2]|0;c[b>>2]=c[g>>2];c[b+4>>2]=i;c[p+8>>2]=c[q+8>>2];i=o-1|0;if((i|0)==0){m=f;r=15;break}else{o=i;p=f;q=q+16|0}}if((r|0)==15){c[d>>2]=m;n=h+1|0;return n|0}if((o|0)>0){s=o;t=p}else{m=p;c[d>>2]=m;n=h+1|0;return n|0}while(1){r=s-1|0;c[t+8>>2]=0;if((r|0)>0){s=r;t=t+16|0}else{break}}m=p+(o<<4)|0;c[d>>2]=m;n=h+1|0;return n|0}function Wc(a,d,e){a=a|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;g=a+52|0;h=(b[g>>1]|0)+1&65535;b[g>>1]=h;do{if((h&65535)>>>0>199>>>0){if(h<<16>>16==200){Jc(a,2488,(j=i,i=i+1|0,i=i+7&-8,c[j>>2]=0,j)|0);i=j;break}if(!((h&65535)>>>0>224>>>0)){break}Oc(a,5)}}while(0);if((Uc(a,d,e)|0)==0){Se(a,1)}b[g>>1]=(b[g>>1]|0)-1;g=c[a+16>>2]|0;if((c[g+68>>2]|0)>>>0<(c[g+64>>2]|0)>>>0){i=f;return}pd(a);i=f;return}function Xc(d,e,f,g,h){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;i=d+52|0;j=b[i>>1]|0;k=d+20|0;l=c[k>>2]|0;m=d+40|0;n=c[m>>2]|0;o=d+57|0;p=a[o]|0;q=d+116|0;r=c[q>>2]|0;c[q>>2]=h;h=Pc(d,e,f)|0;if((h|0)==0){c[q>>2]=r;return h|0}f=l-n|0;n=c[d+32>>2]|0;l=n+g|0;gd(d,l);if((h|0)==5){c[l>>2]=se(d,3136,23)|0;c[n+(g+8)>>2]=4}else if((h|0)==3|(h|0)==2){e=c[d+8>>2]|0;s=e-16|0;t=l;u=c[s+4>>2]|0;c[t>>2]=c[s>>2];c[t+4>>2]=u;c[n+(g+8)>>2]=c[e-16+8>>2]}else if((h|0)==4){c[l>>2]=se(d,2704,17)|0;c[n+(g+8)>>2]=4}c[d+8>>2]=n+(g+16);b[i>>1]=j;j=c[m>>2]|0;i=j;g=i+f|0;c[k>>2]=g;c[d+12>>2]=c[g>>2];c[d+24>>2]=c[i+(f+12)>>2];a[o]=p;p=d+48|0;o=c[p>>2]|0;if((o|0)<=2e4){c[q>>2]=r;return h|0}f=j;if((((g-f|0)/24|0)+1|0)>=2e4){c[q>>2]=r;return h|0}g=Nd(d,i,o*24|0,48e4)|0;o=g;c[m>>2]=o;c[p>>2]=2e4;c[k>>2]=o+((((c[k>>2]|0)-f|0)/24|0)*24|0);c[d+36>>2]=g+479976;c[q>>2]=r;return h|0}function Yc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+24|0;f=e|0;c[f>>2]=b;c[f+16>>2]=d;d=f+4|0;c[d>>2]=0;c[f+8>>2]=0;b=f+12|0;c[b>>2]=0;g=Xc(a,2,f,(c[a+8>>2]|0)-(c[a+32>>2]|0)|0,c[a+116>>2]|0)|0;Nd(a,c[d>>2]|0,c[b>>2]|0,0)|0;i=e;return g|0}function Zc(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;f=e;g=Ue(c[f>>2]|0)|0;h=c[b+16>>2]|0;if(!((c[h+68>>2]|0)>>>0<(c[h+64>>2]|0)>>>0)){pd(b)}h=ib[((g|0)==27?2:6)&15](b,c[f>>2]|0,e+4|0,c[e+16>>2]|0)|0;e=h+72|0;f=cd(b,d[e]|0,c[b+72>>2]|0)|0;g=f;c[f+16>>2]=h;if((a[e]|0)!=0){h=0;do{c[g+20+(h<<2)>>2]=dd(b)|0;h=h+1|0;}while((h|0)<(d[e]|0))}e=b+8|0;h=c[e>>2]|0;c[h>>2]=f;c[h+8>>2]=6;if(((c[b+28>>2]|0)-(c[e>>2]|0)|0)>=17){i=c[e>>2]|0;j=i+16|0;c[e>>2]=j;return}h=c[b+44>>2]|0;if((h|0)<1){Qc(b,h+1|0);i=c[e>>2]|0;j=i+16|0;c[e>>2]=j;return}else{Qc(b,h<<1);i=c[e>>2]|0;j=i+16|0;c[e>>2]=j;return}}function _c(b,e,f){b=b|0;e=e|0;f=f|0;var j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0.0,Z=0.0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0;j=i;i=i+96|0;l=j|0;m=j+8|0;n=j+16|0;o=j+24|0;p=j+32|0;q=j+40|0;r=j+56|0;s=j+64|0;t=j+72|0;u=j+80|0;v=j+88|0;w=b+32|0;x=c[w>>2]|0;do{if((x|0)==(e|0)){y=3}else{z=(c[f+12>>2]|0)==0?x:0;if((z|0)==0){y=3;break}A=(c[z+12>>2]|0)+1|0;bd(A,f);B=f+16|0;if((c[B>>2]|0)!=0){C=B;break}c[B>>2]=ib[c[f+4>>2]&15](c[f>>2]|0,z+16|0,A,c[f+8>>2]|0)|0;z=f+44|0;c[z>>2]=(c[z>>2]|0)+A;C=B}}while(0);if((y|0)==3){bd(0,f);C=f+16|0}y=f+24|0;ad(c[b+60>>2]|0,c[y>>2]|0,f);ad(c[b+64>>2]|0,c[y>>2]|0,f);a[u]=a[b+72|0]|0;x=c[C>>2]|0;if((x|0)==0){e=ib[c[f+4>>2]&15](c[f>>2]|0,u,1,c[f+8>>2]|0)|0;c[C>>2]=e;u=f+44|0;c[u>>2]=(c[u>>2]|0)+1;D=e}else{D=x}a[t]=a[b+73|0]|0;if((D|0)==0){x=ib[c[f+4>>2]&15](c[f>>2]|0,t,1,c[f+8>>2]|0)|0;c[C>>2]=x;t=f+44|0;c[t>>2]=(c[t>>2]|0)+1;E=x}else{E=D}a[s]=a[b+74|0]|0;if((E|0)==0){D=ib[c[f+4>>2]&15](c[f>>2]|0,s,1,c[f+8>>2]|0)|0;c[C>>2]=D;s=f+44|0;c[s>>2]=(c[s>>2]|0)+1;F=D}else{F=E}a[r]=a[b+75|0]|0;if((F|0)==0){c[C>>2]=ib[c[f+4>>2]&15](c[f>>2]|0,r,1,c[f+8>>2]|0)|0;r=f+44|0;c[r>>2]=(c[r>>2]|0)+1;G=r}else{G=f+44|0}r=q|0;F=b+44|0;ad(c[F>>2]|0,c[y>>2]|0,f);E=c[G>>2]|0;if((E&3|0)!=0){D=f+4|0;s=f|0;x=f+8|0;t=c[C>>2]|0;e=E;while(1){a[p]=0;if((t|0)==0){E=ib[c[D>>2]&15](c[s>>2]|0,p,1,c[x>>2]|0)|0;c[C>>2]=E;u=(c[G>>2]|0)+1|0;c[G>>2]=u;H=E;I=u}else{H=t;I=e}if((I&3|0)==0){break}else{t=H;e=I}}}I=c[F>>2]|0;if((I|0)>0){e=b+12|0;H=q;t=f+20|0;x=f+4|0;p=f|0;s=f+8|0;D=q+3|0;u=q+1|0;E=q+2|0;q=0;B=I;while(1){I=(c[e>>2]|0)+(q<<2)|0;A=d[I]|d[I+1|0]<<8|d[I+2|0]<<16|d[I+3|0]<<24|0;c[H>>2]=A;if((c[t>>2]|0)!=1){a[r]=A>>>24;a[D]=A;a[u]=A>>>16;a[E]=A>>>8}if((c[C>>2]|0)==0){c[C>>2]=ib[c[x>>2]&15](c[p>>2]|0,r,4,c[s>>2]|0)|0;c[G>>2]=(c[G>>2]|0)+4;J=c[F>>2]|0}else{J=B}A=q+1|0;if((A|0)<(J|0)){q=A;B=J}else{break}}}J=c[b+40>>2]|0;ad(J,c[y>>2]|0,f);if((J|0)>0){B=b+8|0;q=f+4|0;F=f|0;s=f+8|0;r=l;p=m;x=f+36|0;E=f+32|0;u=f+20|0;D=r+3|0;t=r+1|0;H=r+2|0;e=f+40|0;A=p+7|0;I=p+1|0;z=p+6|0;K=p+2|0;L=p+5|0;M=p+3|0;N=p+4|0;O=m;P=N;Q=0;do{R=c[B>>2]|0;S=R+(Q<<4)|0;T=R+(Q<<4)+8|0;R=c[T>>2]|0;a[o]=R;U=c[C>>2]|0;if((U|0)==0){V=ib[c[q>>2]&15](c[F>>2]|0,o,1,c[s>>2]|0)|0;c[C>>2]=V;c[G>>2]=(c[G>>2]|0)+1;W=c[T>>2]|0;X=V}else{W=R;X=U}do{if((W|0)==3){U=S|0;Y=+h[U>>3];R=c[U>>2]|0;V=c[U+4>>2]|0;if((c[x>>2]|0)!=0){U=~~Y;if(+(U|0)!=Y){c[C>>2]=102}ad(U,c[E>>2]|0,f);break}U=c[E>>2]|0;if((U|0)==4){Z=Y;g[l>>2]=Z;T=(g[k>>2]=Z,c[k>>2]|0);if((c[u>>2]|0)!=1){a[r]=T>>>24;a[D]=T;a[t]=T>>>16;a[H]=T>>>8}if((X|0)!=0){break}c[C>>2]=ib[c[q>>2]&15](c[F>>2]|0,r,4,c[s>>2]|0)|0;c[G>>2]=(c[G>>2]|0)+4;break}else if((U|0)!=8){break}h[m>>3]=Y;U=R;R=V;V=R;T=U;if((c[e>>2]|0)==0){_=U&255;$=(R>>>24|0<<8)&255;aa=(U>>>8|R<<24)&255;ba=(R>>>16|0<<16)&255;ca=(U>>>16|R<<16)&255;da=(R>>>8|0<<24)&255;ea=(U>>>24|R<<8)&255;fa=V&255}else{c[O>>2]=V;c[P>>2]=T;_=V&255;$=T>>>24&255;aa=(R>>>8|0<<24)&255;ba=T>>>16&255;ca=(R>>>16|0<<16)&255;da=T>>>8&255;ea=(R>>>24|0<<8)&255;fa=U&255}if((c[u>>2]|0)!=1){a[p]=$;a[A]=_;a[I]=ba;a[z]=aa;a[K]=da;a[L]=ca;a[M]=fa;a[N]=ea}if((X|0)!=0){break}c[C>>2]=ib[c[q>>2]&15](c[F>>2]|0,p,8,c[s>>2]|0)|0;c[G>>2]=(c[G>>2]|0)+8}else if((W|0)==1){a[n]=c[S>>2];if((X|0)!=0){break}c[C>>2]=ib[c[q>>2]&15](c[F>>2]|0,n,1,c[s>>2]|0)|0;c[G>>2]=(c[G>>2]|0)+1}else if((W|0)==4){U=c[S>>2]|0;if((U|0)==0){bd(0,f);break}R=(c[U+12>>2]|0)+1|0;bd(R,f);if((c[C>>2]|0)!=0){break}c[C>>2]=ib[c[q>>2]&15](c[F>>2]|0,U+16|0,R,c[s>>2]|0)|0;c[G>>2]=(c[G>>2]|0)+R}}while(0);Q=Q+1|0;}while((Q|0)<(J|0))}J=c[b+52>>2]|0;ad(J,c[y>>2]|0,f);if((J|0)>0){Q=b+16|0;s=0;do{_c(c[(c[Q>>2]|0)+(s<<2)>>2]|0,c[w>>2]|0,f);s=s+1|0;}while((s|0)<(J|0))}J=f+12|0;if((c[J>>2]|0)==0){ga=c[b+48>>2]|0}else{ga=0}ad(ga,c[y>>2]|0,f);s=c[G>>2]|0;if((s&3|0)!=0){w=f+4|0;Q=f|0;F=f+8|0;q=c[C>>2]|0;W=s;while(1){a[v]=0;if((q|0)==0){s=ib[c[w>>2]&15](c[Q>>2]|0,v,1,c[F>>2]|0)|0;c[C>>2]=s;n=(c[G>>2]|0)+1|0;c[G>>2]=n;ha=s;ia=n}else{ha=q;ia=W}if((ia&3|0)==0){break}else{q=ha;W=ia}}}if((ga|0)>0){ia=b+20|0;W=0;do{ad(c[(c[ia>>2]|0)+(W<<2)>>2]|0,c[y>>2]|0,f);W=W+1|0;}while((W|0)<(ga|0))}do{if((c[J>>2]|0)==0){ga=c[b+56>>2]|0;ad(ga,c[y>>2]|0,f);if((ga|0)<=0){break}W=b+24|0;ia=f+4|0;ha=f|0;q=f+8|0;F=0;do{v=c[(c[W>>2]|0)+(F*12|0)>>2]|0;do{if((v|0)==0){bd(0,f)}else{Q=(c[v+12>>2]|0)+1|0;bd(Q,f);if((c[C>>2]|0)!=0){break}c[C>>2]=ib[c[ia>>2]&15](c[ha>>2]|0,v+16|0,Q,c[q>>2]|0)|0;c[G>>2]=(c[G>>2]|0)+Q}}while(0);ad(c[(c[W>>2]|0)+(F*12|0)+4>>2]|0,c[y>>2]|0,f);ad(c[(c[W>>2]|0)+(F*12|0)+8>>2]|0,c[y>>2]|0,f);F=F+1|0;}while((F|0)<(ga|0))}else{ad(0,c[y>>2]|0,f)}}while(0);if((c[J>>2]|0)!=0){ad(0,c[y>>2]|0,f);i=j;return}J=c[b+36>>2]|0;ad(J,c[y>>2]|0,f);if((J|0)<=0){i=j;return}y=b+28|0;b=f+4|0;ga=f|0;F=f+8|0;W=0;do{q=c[(c[y>>2]|0)+(W<<2)>>2]|0;do{if((q|0)==0){bd(0,f)}else{ha=(c[q+12>>2]|0)+1|0;bd(ha,f);if((c[C>>2]|0)!=0){break}c[C>>2]=ib[c[b>>2]&15](c[ga>>2]|0,q+16|0,ha,c[F>>2]|0)|0;c[G>>2]=(c[G>>2]|0)+ha}}while(0);W=W+1|0;}while((W|0)<(J|0));i=j;return}function $c(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0;h=i;i=i+64|0;j=h|0;k=h+16|0;c[k>>2]=b;c[k+4>>2]=e;c[k+8>>2]=f;c[k+12>>2]=g;g=k+16|0;c[k+20>>2]=1;c[k+24>>2]=4;c[k+28>>2]=4;c[k+32>>2]=8;c[k+36>>2]=0;c[k+40>>2]=0;c[j>>2]=1635077147;a[j+4|0]=81;a[j+5|0]=0;a[j+6|0]=1;a[j+7|0]=4;a[j+8|0]=4;a[j+9|0]=4;a[j+10|0]=8;a[j+11|0]=0;c[g>>2]=ib[e&15](b,j|0,12,f)|0;c[k+44>>2]=12;_c(d,0,k);i=h;return c[g>>2]|0}function ad(d,e,f){d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;i=i+24|0;h=g|0;j=g+8|0;k=g+16|0;if((e|0)==2){if((d+32768|0)>>>0>65535>>>0){c[f+16>>2]=101}l=d&65535;b[j>>1]=l;m=j;if((c[f+20>>2]|0)!=1){a[m]=(l&65535)>>>8;a[m+1|0]=d}l=f+16|0;if((c[l>>2]|0)!=0){i=g;return}c[l>>2]=ib[c[f+4>>2]&15](c[f>>2]|0,m,2,c[f+8>>2]|0)|0;m=f+44|0;c[m>>2]=(c[m>>2]|0)+2;i=g;return}else if((e|0)==4){if((d-2147483647|0)>>>0<2>>>0){c[f+16>>2]=101}c[k>>2]=d;m=k;if((c[f+20>>2]|0)!=1){a[m]=d>>>24;a[m+3|0]=d;a[m+1|0]=d>>>16;a[m+2|0]=d>>>8}k=f+16|0;if((c[k>>2]|0)!=0){i=g;return}c[k>>2]=ib[c[f+4>>2]&15](c[f>>2]|0,m,4,c[f+8>>2]|0)|0;m=f+44|0;c[m>>2]=(c[m>>2]|0)+4;i=g;return}else if((e|0)==1){e=f+16|0;if((d+128|0)>>>0>255>>>0){c[e>>2]=101;a[h]=d;i=g;return}m=(c[e>>2]|0)==0;a[h]=d;if(!m){i=g;return}c[f+16>>2]=ib[c[f+4>>2]&15](c[f>>2]|0,h,1,c[f+8>>2]|0)|0;h=f+44|0;c[h>>2]=(c[h>>2]|0)+1;i=g;return}else{i=g;return}}function bd(d,e){d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;f=i;i=i+24|0;g=f|0;h=f+8|0;j=f+16|0;k=c[e+28>>2]|0;if((k|0)==4){if((d|0)==-1){c[e+16>>2]=101}c[j>>2]=d;l=j;if((c[e+20>>2]|0)!=1){a[l]=d>>>24;a[l+3|0]=d;a[l+1|0]=d>>>16;a[l+2|0]=d>>>8}j=e+16|0;if((c[j>>2]|0)!=0){i=f;return}c[j>>2]=ib[c[e+4>>2]&15](c[e>>2]|0,l,4,c[e+8>>2]|0)|0;l=e+44|0;c[l>>2]=(c[l>>2]|0)+4;i=f;return}else if((k|0)==1){l=e+16|0;if(d>>>0>255>>>0){c[l>>2]=101;a[g]=d;i=f;return}j=(c[l>>2]|0)==0;a[g]=d;if(!j){i=f;return}c[e+16>>2]=ib[c[e+4>>2]&15](c[e>>2]|0,g,1,c[e+8>>2]|0)|0;g=e+44|0;c[g>>2]=(c[g>>2]|0)+1;i=f;return}else if((k|0)==2){if(d>>>0>65535>>>0){c[e+16>>2]=101}k=d&65535;b[h>>1]=k;g=h;if((c[e+20>>2]|0)!=1){a[g]=(k&65535)>>>8;a[g+1|0]=d}d=e+16|0;if((c[d>>2]|0)!=0){i=f;return}c[d>>2]=ib[c[e+4>>2]&15](c[e>>2]|0,g,2,c[e+8>>2]|0)|0;g=e+44|0;c[g>>2]=(c[g>>2]|0)+2;i=f;return}else{i=f;return}}function cd(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0;f=Nd(b,0,0,(d<<2)+20|0)|0;g=f;vd(b,f,6);a[f+6|0]=0;c[f+12>>2]=e;a[f+7|0]=d;if((d|0)==0){return g|0}e=f+20|0;f=d;do{f=f-1|0;c[e+(f<<2)>>2]=0;}while((f|0)!=0);return g|0}function dd(a){a=a|0;var b=0;b=Nd(a,0,0,32)|0;vd(a,b,10);c[b+8>>2]=b+16;c[b+24>>2]=0;return b|0}function ed(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;f=c[b+16>>2]|0;g=b+104|0;h=c[g>>2]|0;a:do{if((h|0)==0){i=g}else{j=g;k=h;while(1){l=c[k+8>>2]|0;if(l>>>0<e>>>0){i=j;break a}m=k;n=k|0;if((l|0)==(e|0)){break}l=c[n>>2]|0;if((l|0)==0){i=n;break a}else{j=n;k=l}}j=k+5|0;l=a[j]|0;if((l&3&((d[f+20|0]|0)^3)|0)==0){o=m;return o|0}a[j]=l^3;o=m;return o|0}}while(0);m=Nd(b,0,0,32)|0;b=m;a[m+4|0]=10;a[m+5|0]=a[f+20|0]&3;c[m+8>>2]=e;c[m>>2]=c[i>>2];c[i>>2]=m;c[m+16>>2]=f+120;i=f+140|0;f=c[i>>2]|0;c[m+20>>2]=f;c[f+16>>2]=b;c[i>>2]=b;o=b;return o|0}function fd(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;if((c[b+8>>2]|0)==(b+16|0)){d=b;e=Nd(a,d,32,0)|0;return}f=b+16|0;g=f;h=f+4|0;c[(c[h>>2]|0)+16>>2]=c[g>>2];c[(c[g>>2]|0)+20>>2]=c[h>>2];d=b;e=Nd(a,d,32,0)|0;return}function gd(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;f=b+104|0;g=c[f>>2]|0;if((g|0)==0){return}h=(c[b+16>>2]|0)+20|0;i=g;while(1){g=i+8|0;if((c[g>>2]|0)>>>0<e>>>0){j=10;break}c[f>>2]=c[i>>2];if((a[i+5|0]&3&((d[h]|0)^3)|0)==0){k=i+16|0;l=k+4|0;c[(c[l>>2]|0)+16>>2]=c[k>>2];c[(c[k>>2]|0)+20>>2]=c[l>>2];l=c[g>>2]|0;m=l;n=k;o=c[m+4>>2]|0;c[n>>2]=c[m>>2];c[n+4>>2]=o;c[k+8>>2]=c[l+8>>2];c[g>>2]=k;wd(b,i)}else{k=i+16|0;if((c[g>>2]|0)!=(k|0)){g=k+4|0;c[(c[g>>2]|0)+16>>2]=c[k>>2];c[(c[k>>2]|0)+20>>2]=c[g>>2]}Nd(b,i,32,0)|0}g=c[f>>2]|0;if((g|0)==0){j=10;break}else{i=g}}if((j|0)==10){return}}function hd(b){b=b|0;var c=0;c=Nd(b,0,0,76)|0;vd(b,c,9);uf(c+8|0,0,60)|0;b=c+72|0;w=0;a[b]=w;w=w>>8;a[b+1|0]=w;w=w>>8;a[b+2|0]=w;w=w>>8;a[b+3|0]=w;return c|0}function id(a,b){a=a|0;b=b|0;Nd(a,c[b+12>>2]|0,c[b+44>>2]<<2,0)|0;Nd(a,c[b+16>>2]|0,c[b+52>>2]<<2,0)|0;Nd(a,c[b+8>>2]|0,c[b+40>>2]<<4,0)|0;Nd(a,c[b+20>>2]|0,c[b+48>>2]<<2,0)|0;Nd(a,c[b+24>>2]|0,(c[b+56>>2]|0)*12|0,0)|0;Nd(a,c[b+28>>2]|0,c[b+36>>2]<<2,0)|0;Nd(a,b,76,0)|0;return}function jd(b,c){b=b|0;c=c|0;var e=0,f=0;e=d[c+7|0]|0;if((a[c+6|0]|0)==0){f=(e<<2)+20|0}else{f=(e<<4)+24|0}Nd(b,c,f,0)|0;return}function kd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;e=c[a+56>>2]|0;if((e|0)<=0){f=0;return f|0}g=c[a+24>>2]|0;a=b;b=0;while(1){if((c[g+(b*12|0)+4>>2]|0)>(d|0)){f=0;h=8;break}if((c[g+(b*12|0)+8>>2]|0)>(d|0)){i=a-1|0;if((i|0)==0){h=6;break}else{j=i}}else{j=a}i=b+1|0;if((i|0)<(e|0)){a=j;b=i}else{f=0;h=8;break}}if((h|0)==6){f=(c[g+(b*12|0)>>2]|0)+16|0;return f|0}else if((h|0)==8){return f|0}return 0}function ld(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;e=b+16|0;b=c[e>>2]|0;f=c[b+112>>2]|0;g=c[f>>2]|0;if((g|0)==0){h=0;return h|0}i=(d|0)==0;d=b+48|0;b=f;f=0;j=g;a:while(1){b:do{if(i){g=f;k=j;while(1){l=k+5|0;m=a[l]|0;if(!((m&3)!=0&(m&8)==0)){n=g;o=k;break b}m=c[k+8>>2]|0;p=m;if((m|0)==0){q=g;r=k;s=l;t=17;break b}if(!((a[p+6|0]&4)==0)){q=g;r=k;s=l;t=17;break b}if((Ge(p,2,c[(c[e>>2]|0)+196>>2]|0)|0)==0){q=g;r=k;s=l;t=17;break b}p=g+24+(c[k+16>>2]|0)|0;a[l]=a[l]|8;l=k|0;c[b>>2]=c[l>>2];m=c[d>>2]|0;if((m|0)==0){c[l>>2]=k}else{c[l>>2]=c[m>>2];c[c[d>>2]>>2]=k}c[d>>2]=k;m=c[b>>2]|0;if((m|0)==0){h=p;t=22;break a}else{g=p;k=m}}}else{k=f;g=j;while(1){m=g+5|0;if(!((a[m]&8)==0)){n=k;o=g;break b}p=c[g+8>>2]|0;l=p;if((p|0)==0){q=k;r=g;s=m;t=17;break b}if(!((a[l+6|0]&4)==0)){q=k;r=g;s=m;t=17;break b}if((Ge(l,2,c[(c[e>>2]|0)+196>>2]|0)|0)==0){q=k;r=g;s=m;t=17;break b}l=k+24+(c[g+16>>2]|0)|0;a[m]=a[m]|8;m=g|0;c[b>>2]=c[m>>2];p=c[d>>2]|0;if((p|0)==0){c[m>>2]=g}else{c[m>>2]=c[p>>2];c[c[d>>2]>>2]=g}c[d>>2]=g;p=c[b>>2]|0;if((p|0)==0){h=l;t=22;break a}else{k=l;g=p}}}}while(0);if((t|0)==17){t=0;a[s]=a[s]|8;n=q;o=r}g=o|0;k=c[g>>2]|0;if((k|0)==0){h=n;t=22;break}else{b=g;f=n;j=k}}if((t|0)==22){return h|0}return 0}function md(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;d=b+16|0;e=c[d>>2]|0;f=e+48|0;g=c[f>>2]|0;h=g|0;i=c[h>>2]|0;if((i|0)==(g|0)){c[f>>2]=0;j=i|0}else{f=i|0;c[h>>2]=c[f>>2];j=f}f=e+112|0;c[j>>2]=c[c[f>>2]>>2];c[c[f>>2]>>2]=i;f=i+5|0;a[f]=a[e+20|0]&3|a[f]&-8;f=c[i+8>>2]|0;j=f;if((f|0)==0){return}if(!((a[j+6|0]&4)==0)){return}f=Ge(j,2,c[(c[d>>2]|0)+196>>2]|0)|0;if((f|0)==0){return}d=b+57|0;j=a[d]|0;h=e+64|0;g=c[h>>2]|0;a[d]=0;c[h>>2]=c[e+68>>2]<<1;e=b+8|0;k=c[e>>2]|0;l=f;m=k;n=c[l+4>>2]|0;c[m>>2]=c[l>>2];c[m+4>>2]=n;c[k+8>>2]=c[f+8>>2];f=c[e>>2]|0;c[f+16>>2]=i;c[f+24>>2]=7;f=c[e>>2]|0;c[e>>2]=f+32;Wc(b,f,0);a[d]=j;c[h>>2]=g;return}function nd(b){b=b|0;var d=0,e=0,f=0;d=c[b+16>>2]|0;a[d+20|0]=67;od(b,d+28|0,-3)|0;e=d+8|0;if((c[e>>2]|0)<=0){return}f=d|0;d=0;do{od(b,(c[f>>2]|0)+(d<<2)|0,-3)|0;d=d+1|0;}while((d|0)<(c[e>>2]|0));return}function od(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;g=b+16|0;h=c[g>>2]|0;i=h+20|0;j=d[i]^3;k=c[e>>2]|0;if((k|0)==0){l=e;return l|0}m=h+28|0;h=f;f=e;e=k;while(1){k=h-1|0;if((h|0)==0){l=f;n=19;break}o=e+4|0;if((a[o]|0)==8){od(b,e+104|0,-3)|0}p=e+5|0;q=a[p]|0;a:do{if(((q&255^3)&j|0)==0){r=e|0;c[f>>2]=c[r>>2];if((e|0)==(c[m>>2]|0)){c[m>>2]=c[r>>2]}switch(d[o]|0){case 9:{id(b,e);s=f;break a;break};case 8:{oe(b,e|0);s=f;break a;break};case 10:{fd(b,e);s=f;break a;break};case 4:{r=(c[g>>2]|0)+4|0;c[r>>2]=(c[r>>2]|0)-1;Nd(b,e,(c[e+12>>2]|0)+17|0,0)|0;s=f;break a;break};case 5:{xe(b,e);s=f;break a;break};case 7:{Nd(b,e,(c[e+16>>2]|0)+24|0,0)|0;s=f;break a;break};case 6:{jd(b,e);s=f;break a;break};default:{s=f;break a}}}else{a[p]=a[i]&3|q&-8;s=e|0}}while(0);q=c[s>>2]|0;if((q|0)==0){l=s;n=19;break}else{h=k;f=s;e=q}}if((n|0)==19){return l|0}return 0}function pd(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;d=c[b+16>>2]|0;e=(c[d+84>>2]|0)*10|0;f=d+68|0;g=d+64|0;h=d+76|0;c[h>>2]=(c[f>>2]|0)-(c[g>>2]|0)+(c[h>>2]|0);i=d+21|0;j=(e|0)==0?2147483646:e;do{j=j-(qd(b)|0)|0;k=a[i]|0;}while(k<<24>>24!=0&(j|0)>0);if(k<<24>>24==0){c[g>>2]=aa(c[d+80>>2]|0,((c[d+72>>2]|0)>>>0)/100|0)|0;return}d=c[h>>2]|0;if(d>>>0<1024>>>0){c[g>>2]=(c[f>>2]|0)+1024;return}else{c[h>>2]=d-1024;c[g>>2]=c[f>>2];return}}function qd(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;e=b+16|0;f=c[e>>2]|0;g=f+21|0;switch(d[g]|0|0){case 0:{rd(b);h=0;return h|0};case 2:{i=f+68|0;j=c[i>>2]|0;k=f+24|0;l=c[k>>2]|0;c[k>>2]=l+1;od(b,(c[f>>2]|0)+(l<<2)|0,-3)|0;if((c[k>>2]|0)>=(c[f+8>>2]|0)){a[g]=3}k=f+72|0;c[k>>2]=(c[i>>2]|0)-j+(c[k>>2]|0);h=10;return h|0};case 3:{k=f+68|0;j=c[k>>2]|0;i=f+32|0;l=od(b,c[i>>2]|0,40)|0;c[i>>2]=l;if((c[l>>2]|0)==0){l=c[e>>2]|0;e=c[l+8>>2]|0;if((c[l+4>>2]|0)>>>0<((e|0)/4|0)>>>0&(e|0)>64){re(b,(e|0)/2|0)}e=l+52|0;i=l+60|0;l=c[i>>2]|0;if(l>>>0>64>>>0){m=l>>>1;if((m+1|0)>>>0<4294967294>>>0){n=e|0;o=Nd(b,c[n>>2]|0,l,m)|0;p=n}else{o=Od(b)|0;p=e|0}c[p>>2]=o;c[i>>2]=m}a[g]=4}m=f+72|0;c[m>>2]=(c[k>>2]|0)-j+(c[m>>2]|0);h=400;return h|0};case 1:{m=f+36|0;if((c[m>>2]|0)!=0){h=yd(f)|0;return h|0}j=f+120|0;k=c[f+140>>2]|0;do{if((k|0)!=(j|0)){i=k;do{do{if((a[i+5|0]&7)==0){o=c[i+8>>2]|0;if((c[o+8>>2]|0)<=3){break}p=c[o>>2]|0;if((a[p+5|0]&3)==0){break}td(f,p)}}while(0);i=c[i+20>>2]|0;}while((i|0)!=(j|0));if((c[m>>2]|0)==0){break}do{yd(f)|0;}while((c[m>>2]|0)!=0)}}while(0);j=f+44|0;c[m>>2]=c[j>>2];c[j>>2]=0;if(!((a[b+5|0]&3)==0)){td(f,b)}xd(f);if((c[m>>2]|0)!=0){do{yd(f)|0;}while((c[m>>2]|0)!=0)}k=f+40|0;i=c[k>>2]|0;c[m>>2]=i;c[k>>2]=0;if((i|0)!=0){do{yd(f)|0;}while((c[m>>2]|0)!=0)}i=ld(b,0)|0;k=f+48|0;p=c[k>>2]|0;if((p|0)!=0){o=f+20|0;e=p;do{e=c[e>>2]|0;p=e+5|0;a[p]=a[o]&3|a[p]&-8;td(f,e);}while((e|0)!=(c[k>>2]|0))}if((c[m>>2]|0)==0){q=0}else{k=0;while(1){e=(yd(f)|0)+k|0;if((c[m>>2]|0)==0){q=e;break}else{k=e}}}k=c[j>>2]|0;if((k|0)!=0){j=k;do{k=j;m=c[j+28>>2]|0;if(!((a[j+5|0]&16)==0|(m|0)==0)){e=j+12|0;o=m;do{o=o-1|0;m=c[e>>2]|0;p=m+(o<<4)+8|0;n=c[p>>2]|0;do{if((n|0)>3){l=(c[m+(o<<4)>>2]|0)+5|0;r=a[l]|0;if((n|0)==4){a[l]=r&-4;break}if((r&3)==0){if((n|0)!=7){break}if((r&8)==0){break}}c[p>>2]=0}}while(0);}while((o|0)!=0)}o=j+16|0;e=1<<(d[k+7|0]|0);do{e=e-1|0;p=c[o>>2]|0;n=p+(e<<5)|0;m=p+(e<<5)+8|0;r=c[m>>2]|0;a:do{if((r|0)!=0){l=p+(e<<5)+24|0;s=c[l>>2]|0;do{if((s|0)>3){t=(c[p+(e<<5)+16>>2]|0)+5|0;u=a[t]|0;if((s|0)==4){a[t]=u&-4;v=c[m>>2]|0;w=42;break}else{if((u&3)==0){v=r;w=42;break}else{break}}}else{v=r;w=42}}while(0);do{if((w|0)==42){w=0;if((v|0)<=3){break a}s=(c[n>>2]|0)+5|0;u=a[s]|0;if((v|0)==4){a[s]=u&-4;break a}if(!((u&3)==0)){break}if((v|0)!=7){break a}if((u&8)==0){break a}}}while(0);c[m>>2]=0;if((c[l>>2]|0)<=3){break}c[l>>2]=11}}while(0);}while((e|0)!=0);j=c[j+24>>2]|0;}while((j|0)!=0)}j=f+20|0;a[j]=a[j]^3;c[f+24>>2]=0;c[f+32>>2]=f+28;a[g]=2;c[f+72>>2]=(c[f+68>>2]|0)-(q+i);h=0;return h|0};case 4:{if((c[f+48>>2]|0)==0){a[g]=0;c[f+76>>2]=0;h=0;return h|0}md(b);b=f+72|0;f=c[b>>2]|0;if(!(f>>>0>100>>>0)){h=100;return h|0}c[b>>2]=f-100;h=100;return h|0};default:{h=0;return h|0}}return 0}function rd(b){b=b|0;var d=0,e=0,f=0,g=0,h=0;d=b+16|0;b=c[d>>2]|0;c[b+36>>2]=0;c[b+40>>2]=0;c[b+44>>2]=0;e=b+112|0;f=c[e>>2]|0;if((a[f+5|0]&3)==0){g=f}else{td(b,f);g=c[e>>2]|0}do{if((c[g+80>>2]|0)>3){e=c[g+72>>2]|0;if((a[e+5|0]&3)==0){break}td(b,e)}}while(0);g=c[d>>2]|0;if((c[g+104>>2]|0)<=3){xd(b);h=b+21|0;a[h]=1;return}d=c[g+96>>2]|0;if((a[d+5|0]&3)==0){xd(b);h=b+21|0;a[h]=1;return}td(b,d);xd(b);h=b+21|0;a[h]=1;return}function sd(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;f=c[b+16>>2]|0;if((a[f+21|0]|0)==1){td(f,e);return}else{e=d+5|0;a[e]=a[f+20|0]&3|a[e]&-8;return}}function td(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=e;a:while(1){g=f+5|0;e=a[g]&-4;a[g]=e;switch(d[f+4|0]|0|0){case 6:{h=13;break a;break};case 10:{h=8;break a;break};case 8:{h=15;break a;break};case 9:{h=16;break a;break};case 5:{h=14;break a;break};case 7:{break};default:{h=17;break a}}i=c[f+8>>2]|0;a[g]=e|4;do{if((i|0)!=0){if((a[i+5|0]&3)==0){break}td(b,i)}}while(0);i=c[f+12>>2]|0;if((a[i+5|0]&3)==0){h=17;break}f=i}if((h|0)==8){i=f+8|0;e=c[i>>2]|0;do{if((c[e+8>>2]|0)>3){j=c[e>>2]|0;if((a[j+5|0]&3)==0){k=e;break}td(b,j);k=c[i>>2]|0}else{k=e}}while(0);if((k|0)!=(f+16|0)){return}a[g]=a[g]|4;return}else if((h|0)==13){g=b+36|0;c[f+8>>2]=c[g>>2];c[g>>2]=f;return}else if((h|0)==14){g=b+36|0;c[f+24>>2]=c[g>>2];c[g>>2]=f;return}else if((h|0)==15){g=b+36|0;c[f+108>>2]=c[g>>2];c[g>>2]=f;return}else if((h|0)==16){g=b+36|0;c[f+68>>2]=c[g>>2];c[g>>2]=f;return}else if((h|0)==17){return}}function ud(b,d){b=b|0;d=d|0;var e=0;e=c[b+16>>2]|0;b=d+5|0;a[b]=a[b]&-5;b=e+40|0;c[d+24>>2]=c[b>>2];c[b>>2]=d;return}function vd(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;f=c[b+16>>2]|0;b=f+28|0;c[d>>2]=c[b>>2];c[b>>2]=d;a[d+5|0]=a[f+20|0]&3;a[d+4|0]=e;return}function wd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=b+16|0;b=c[e>>2]|0;f=b+28|0;c[d>>2]=c[f>>2];c[f>>2]=d;f=d+5|0;g=a[f]|0;if(!((g&7)==0)){return}if((a[b+21|0]|0)!=1){a[f]=a[b+20|0]&3|g&-8;return}a[f]=g|4;b=c[d+8>>2]|0;if((c[b+8>>2]|0)<=3){return}d=c[b>>2]|0;if((a[d+5|0]&3)==0){return}b=c[e>>2]|0;if((a[b+21|0]|0)==1){td(b,d);return}else{a[f]=a[b+20|0]&3|g&-8;return}}function xd(b){b=b|0;var d=0;d=c[b+152>>2]|0;do{if((d|0)!=0){if((a[d+5|0]&3)==0){break}td(b,d)}}while(0);d=c[b+156>>2]|0;do{if((d|0)!=0){if((a[d+5|0]&3)==0){break}td(b,d)}}while(0);d=c[b+160>>2]|0;do{if((d|0)!=0){if((a[d+5|0]&3)==0){break}td(b,d)}}while(0);d=c[b+164>>2]|0;do{if((d|0)!=0){if((a[d+5|0]&3)==0){break}td(b,d)}}while(0);d=c[b+168>>2]|0;do{if((d|0)!=0){if((a[d+5|0]&3)==0){break}td(b,d)}}while(0);d=c[b+172>>2]|0;do{if((d|0)!=0){if((a[d+5|0]&3)==0){break}td(b,d)}}while(0);d=c[b+176>>2]|0;do{if((d|0)!=0){if((a[d+5|0]&3)==0){break}td(b,d)}}while(0);d=c[b+180>>2]|0;do{if((d|0)!=0){if((a[d+5|0]&3)==0){break}td(b,d)}}while(0);d=c[b+184>>2]|0;if((d|0)==0){return}if((a[d+5|0]&3)==0){return}td(b,d);return}function yd(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0;e=b+36|0;f=c[e>>2]|0;g=f+5|0;a[g]=a[g]|4;h=d[f+4|0]|0;if((h|0)==5){i=f;j=f+24|0;c[e>>2]=c[j>>2];k=f+8|0;l=c[k>>2]|0;m=l;do{if((l|0)==0){n=0;o=13}else{if((a[m+5|0]&3)==0){p=m}else{td(b,l);q=c[k>>2]|0;if((q|0)==0){n=0;o=13;break}else{p=q}}if(!((a[p+6|0]&8)==0)){n=0;o=13;break}q=Ge(p,3,c[b+200>>2]|0)|0;if((q|0)==0){n=0;o=13;break}if((c[q+8>>2]|0)!=4){n=0;o=13;break}r=(c[q>>2]|0)+16|0;q=(wa(r|0,107)|0)!=0;s=(wa(r|0,118)|0)!=0;r=s&1;if(q|s){a[g]=r<<4|(q&1)<<3|a[g]&-25&255;t=b+44|0;c[j>>2]=c[t>>2];c[t>>2]=f}if(q&s){u=i+7|0;o=42;break}else{if(s){v=q;w=r;x=1;o=19;break}else{n=q;o=13;break}}}}while(0);do{if((o|0)==13){j=c[f+28>>2]|0;if((j|0)==0){v=n;w=0;x=0;o=19;break}p=f+12|0;k=j;while(1){j=k-1|0;l=c[p>>2]|0;do{if((c[l+(j<<4)+8>>2]|0)>3){m=c[l+(j<<4)>>2]|0;if((a[m+5|0]&3)==0){break}td(b,m)}}while(0);if((j|0)==0){v=n;w=0;x=0;o=19;break}else{k=j}}}}while(0);if((o|0)==19){n=i+7|0;i=(1<<d[n])-1|0;k=f+16|0;a:do{if(v){p=x^1;l=i;while(1){m=c[k>>2]|0;q=m+(l<<5)|0;r=c[m+(l<<5)+8>>2]|0;do{if((r|0)==0){s=m+(l<<5)+24|0;if((c[s>>2]|0)<=3){break}c[s>>2]=11}else{if(!((r|0)>3&p)){break}s=c[q>>2]|0;if((a[s+5|0]&3)==0){break}td(b,s)}}while(0);if((l|0)==0){break a}l=l-1|0}}else{l=i;while(1){p=c[k>>2]|0;q=p+(l<<5)|0;r=p+(l<<5)+8|0;m=p+(l<<5)+24|0;j=(c[m>>2]|0)>3;do{if((c[r>>2]|0)==0){if(!j){break}c[m>>2]=11}else{do{if(j){s=c[p+(l<<5)+16>>2]|0;if((a[s+5|0]&3)==0){break}td(b,s)}}while(0);if(x){break}if((c[r>>2]|0)<=3){break}s=c[q>>2]|0;if((a[s+5|0]&3)==0){break}td(b,s)}}while(0);if((l|0)==0){break a}l=l-1|0}}}while(0);if((w|0)==0&(v^1)){y=n}else{u=n;o=42}}if((o|0)==42){a[g]=a[g]&-5;y=u}z=(c[f+28>>2]<<4)+32+(32<<d[y])|0;return z|0}else if((h|0)==6){y=f;c[e>>2]=c[f+8>>2];u=c[f+12>>2]|0;if(!((a[u+5|0]&3)==0)){td(b,u)}u=f+6|0;do{if((a[u]|0)==0){o=f;n=c[f+16>>2]|0;if(!((a[n+5|0]&3)==0)){td(b,n)}n=y+7|0;v=a[n]|0;if(v<<24>>24==0){A=0;break}else{B=0;C=v}while(1){v=c[o+20+(B<<2)>>2]|0;if((a[v+5|0]&3)==0){D=C}else{td(b,v);D=a[n]|0}v=B+1|0;if((v|0)<(D&255|0)){B=v;C=D}else{A=D;break}}}else{n=y+7|0;o=a[n]|0;if(o<<24>>24==0){A=0;break}else{E=0;F=o}while(1){do{if((c[y+24+(E<<4)+8>>2]|0)>3){o=c[y+24+(E<<4)>>2]|0;if((a[o+5|0]&3)==0){G=F;break}td(b,o);G=a[n]|0}else{G=F}}while(0);o=E+1|0;if((o|0)<(G&255|0)){E=o;F=G}else{A=G;break}}}}while(0);G=A&255;if((a[u]|0)==0){z=(G<<2)+20|0;return z|0}else{z=(G<<4)+24|0;return z|0}}else if((h|0)==8){G=f|0;u=f+108|0;c[e>>2]=c[u>>2];A=b+40|0;c[u>>2]=c[A>>2];c[A>>2]=f;a[g]=a[g]&-5;do{if((c[f+80>>2]|0)>3){g=c[f+72>>2]|0;if((a[g+5|0]&3)==0){break}td(b,g)}}while(0);g=f+8|0;A=c[g>>2]|0;u=f+40|0;F=c[u>>2]|0;E=f+20|0;y=c[E>>2]|0;if(F>>>0>y>>>0){H=A}else{D=A;C=F;while(1){F=c[C+8>>2]|0;B=D>>>0<F>>>0?F:D;F=C+24|0;if(F>>>0>y>>>0){H=B;break}else{D=B;C=F}}}C=f+32|0;D=c[C>>2]|0;if(D>>>0<A>>>0){y=D;F=A;while(1){do{if((c[y+8>>2]|0)>3){A=c[y>>2]|0;if((a[A+5|0]&3)==0){I=F;break}td(b,A);I=c[g>>2]|0}else{I=F}}while(0);A=y+16|0;if(A>>>0<I>>>0){y=A;F=I}else{J=A;break}}}else{J=D}if(!(J>>>0>H>>>0)){D=J;do{c[D+8>>2]=0;D=D+16|0;}while(!(D>>>0>H>>>0))}D=H-(c[C>>2]|0)|0;C=f+48|0;H=c[C>>2]|0;do{if((H|0)>2e4){K=f+44|0}else{if(((((c[E>>2]|0)-(c[u>>2]|0)|0)/24|0)<<2|0)<(H|0)&(H|0)>16){Rc(G,(H|0)/2|0)}J=f+44|0;I=c[J>>2]|0;if(!((D>>2|0)<(I|0)&(I|0)>90)){K=J;break}Qc(G,(I|0)/2|0);K=J}}while(0);z=(c[K>>2]<<4)+120+((c[C>>2]|0)*24|0)|0;return z|0}else if((h|0)==9){c[e>>2]=c[f+68>>2];e=c[f+32>>2]|0;if((e|0)!=0){h=e+5|0;a[h]=a[h]&-4}h=f+40|0;e=c[h>>2]|0;if((e|0)>0){C=f+8|0;K=0;G=e;while(1){e=c[C>>2]|0;do{if((c[e+(K<<4)+8>>2]|0)>3){D=c[e+(K<<4)>>2]|0;if((a[D+5|0]&3)==0){L=G;break}td(b,D);L=c[h>>2]|0}else{L=G}}while(0);e=K+1|0;if((e|0)<(L|0)){K=e;G=L}else{break}}}L=f+36|0;G=c[L>>2]|0;if((G|0)>0){K=f+28|0;C=0;e=G;while(1){G=c[(c[K>>2]|0)+(C<<2)>>2]|0;if((G|0)==0){M=e}else{D=G+5|0;a[D]=a[D]&-4;M=c[L>>2]|0}D=C+1|0;if((D|0)<(M|0)){C=D;e=M}else{break}}}M=f+52|0;e=c[M>>2]|0;if((e|0)>0){C=f+16|0;K=0;D=e;while(1){G=c[(c[C>>2]|0)+(K<<2)>>2]|0;do{if((G|0)==0){N=D}else{if((a[G+5|0]&3)==0){N=D;break}td(b,G);N=c[M>>2]|0}}while(0);G=K+1|0;if((G|0)<(N|0)){K=G;D=N}else{O=N;break}}}else{O=e}e=f+56|0;N=c[e>>2]|0;if((N|0)>0){D=f+24|0;K=0;b=N;while(1){C=c[(c[D>>2]|0)+(K*12|0)>>2]|0;if((C|0)==0){P=b}else{G=C+5|0;a[G]=a[G]&-4;P=c[e>>2]|0}G=K+1|0;if((G|0)<(P|0)){K=G;b=P}else{break}}Q=c[M>>2]|0;R=P}else{Q=O;R=N}z=(c[h>>2]<<4)+76+(R*12|0)+(Q+(c[f+44>>2]|0)+(c[f+48>>2]|0)+(c[L>>2]|0)<<2)|0;return z|0}else{z=0;return z|0}return 0}function zd(b){b=b|0;var d=0,e=0,f=0;d=0;do{e=c[40+(d<<2)>>2]|0;f=se(b,e,qf(e|0)|0)|0;e=f+5|0;a[e]=a[e]|32;d=d+1|0;a[f+6|0]=d;}while((d|0)<21);return}function Ad(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;if((b|0)>=257){e=c[40+(b-257<<2)>>2]|0;i=d;return e|0}f=(Za(b|0)|0)==0;g=c[a+52>>2]|0;if(f){f=Vd(g,1952,(h=i,i=i+8|0,c[h>>2]=b,h)|0)|0;i=h;e=f;i=d;return e|0}else{f=Vd(g,1984,(h=i,i=i+8|0,c[h>>2]=b,h)|0)|0;i=h;e=f;i=d;return e|0}return 0}function Bd(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;f=i;i=i+160|0;g=f|0;h=f+80|0;j=b+64|0;Wd(h,(c[j>>2]|0)+16|0,80);k=b+52|0;l=b+4|0;m=c[l>>2]|0;n=Vd(c[k>>2]|0,1928,(o=i,i=i+24|0,c[o>>2]=h,c[o+8>>2]=m,c[o+16>>2]=d,o)|0)|0;i=o;if((e|0)==0){p=c[k>>2]|0;Oc(p,3);q=80;r=0;i=f;return}d=c[k>>2]|0;do{if((e-284|0)>>>0<3>>>0){m=b+60|0;h=c[m>>2]|0;s=h+4|0;t=c[s>>2]|0;u=h+8|0;v=c[u>>2]|0;if((t+1|0)>>>0>v>>>0){if(v>>>0>2147483645>>>0){w=g|0;Wd(w,(c[j>>2]|0)+16|0,80);x=c[l>>2]|0;Vd(c[k>>2]|0,1928,(o=i,i=i+24|0,c[o>>2]=w,c[o+8>>2]=x,c[o+16>>2]=1664,o)|0)|0;i=o;Oc(c[k>>2]|0,3);y=c[u>>2]|0;z=c[k>>2]|0}else{y=v;z=d}v=y<<1;if((v|0)==-2){A=Od(z)|0;B=h|0}else{x=h|0;A=Nd(z,c[x>>2]|0,y,v)|0;B=x}c[B>>2]=A;c[u>>2]=v;C=c[s>>2]|0;D=A}else{C=t;D=c[h>>2]|0}c[s>>2]=C+1;a[D+C|0]=0;E=c[c[m>>2]>>2]|0}else{if((e|0)>=257){E=c[40+(e-257<<2)>>2]|0;break}m=(Za(e|0)|0)==0;s=c[k>>2]|0;if(m){m=Vd(s,1952,(o=i,i=i+8|0,c[o>>2]=e,o)|0)|0;i=o;E=m;break}else{m=Vd(s,1984,(o=i,i=i+8|0,c[o>>2]=e,o)|0)|0;i=o;E=m;break}}}while(0);Vd(d,1904,(o=i,i=i+16|0,c[o>>2]=n,c[o+8>>2]=E,o)|0)|0;i=o;p=c[k>>2]|0;Oc(p,3);q=80;r=0;i=f;return}function Cd(a,b){a=a|0;b=b|0;Bd(a,b,c[a+16>>2]|0);return}function Dd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=c[a+52>>2]|0;f=se(e,b,d)|0;d=De(e,c[(c[a+48>>2]|0)+4>>2]|0,f)|0;a=d+8|0;if((c[a>>2]|0)!=0){return f|0}c[d>>2]=1;c[a>>2]=1;a=c[e+16>>2]|0;if((c[a+68>>2]|0)>>>0<(c[a+64>>2]|0)>>>0){return f|0}pd(e);return f|0}function Ed(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0;a[e+68|0]=46;c[e+52>>2]=b;c[e+32>>2]=287;h=e+56|0;c[h>>2]=f;c[e+48>>2]=0;c[e+4>>2]=1;c[e+8>>2]=1;c[e+64>>2]=g;g=e+60|0;f=c[g>>2]|0;i=Nd(b,c[f>>2]|0,c[f+8>>2]|0,32)|0;c[c[g>>2]>>2]=i;c[(c[g>>2]|0)+8>>2]=32;g=c[h>>2]|0;h=g|0;i=c[h>>2]|0;c[h>>2]=i-1;if((i|0)==0){j=Te(g)|0;k=e|0;c[k>>2]=j;return}else{i=g+8|0;g=c[i>>2]|0;c[i>>2]=g+1;j=d[g]|0;k=e|0;c[k>>2]=j;return}}function Fd(a){a=a|0;var b=0,d=0,e=0;c[a+8>>2]=c[a+4>>2];b=a+32|0;d=b|0;if((c[d>>2]|0)==287){c[a+16>>2]=Gd(a,a+24|0)|0;return}else{e=a+16|0;a=b;c[e>>2]=c[a>>2];c[e+4>>2]=c[a+4>>2];c[e+8>>2]=c[a+8>>2];c[e+12>>2]=c[a+12>>2];c[d>>2]=287;return}}function Gd(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Ga=0,Ha=0,Ja=0,Ka=0,La=0,Ma=0,Na=0,Oa=0,Pa=0,Qa=0,Ra=0,Sa=0,Ta=0,Ua=0,Va=0,Wa=0,Xa=0,Ya=0,Za=0,_a=0,$a=0,ab=0,bb=0,cb=0,eb=0,fb=0,gb=0,hb=0,ib=0,jb=0,kb=0,lb=0,mb=0,nb=0,ob=0,pb=0,qb=0,rb=0,sb=0,tb=0,ub=0,vb=0,wb=0,xb=0,yb=0,zb=0,Ab=0;f=i;i=i+960|0;g=f|0;h=f+80|0;j=f+160|0;k=f+240|0;l=f+320|0;m=f+400|0;n=f+480|0;o=f+560|0;p=f+640|0;q=f+720|0;r=f+800|0;s=f+880|0;t=b+60|0;c[(c[t>>2]|0)+4>>2]=0;u=b|0;v=b+56|0;a:while(1){w=c[u>>2]|0;b:while(1){switch(w|0){case 91:{x=21;break a;break};case 62:{x=41;break a;break};case 60:{x=33;break a;break};case 10:case 13:{x=4;break b;break};case 126:{x=49;break a;break};case 45:{break b;break};case 34:case 39:{x=57;break a;break};case 61:{break a;break};case 46:{x=164;break a;break};case-1:{y=287;x=238;break a;break};default:{}}if((Ia(w|0)|0)==0){x=210;break a}z=c[v>>2]|0;A=z|0;B=c[A>>2]|0;c[A>>2]=B-1;if((B|0)==0){C=Te(z)|0}else{B=z+8|0;z=c[B>>2]|0;c[B>>2]=z+1;C=d[z]|0}c[u>>2]=C;w=C}if((x|0)==4){x=0;Id(b);continue}z=c[v>>2]|0;B=z|0;A=c[B>>2]|0;c[B>>2]=A-1;if((A|0)==0){D=Te(z)|0}else{A=z+8|0;z=c[A>>2]|0;c[A>>2]=z+1;D=d[z]|0}c[u>>2]=D;if((D|0)!=45){y=45;x=238;break}z=c[v>>2]|0;A=z|0;B=c[A>>2]|0;c[A>>2]=B-1;if((B|0)==0){E=Te(z)|0}else{B=z+8|0;z=c[B>>2]|0;c[B>>2]=z+1;E=d[z]|0}c[u>>2]=E;do{if((E|0)==91){z=Jd(b)|0;c[(c[t>>2]|0)+4>>2]=0;if((z|0)>-1){Kd(b,0,z);c[(c[t>>2]|0)+4>>2]=0;continue a}else{F=c[u>>2]|0;break}}else{F=E}}while(0);while(1){if((F|0)==10|(F|0)==13|(F|0)==(-1|0)){continue a}z=c[v>>2]|0;B=z|0;A=c[B>>2]|0;c[B>>2]=A-1;if((A|0)==0){G=Te(z)|0}else{A=z+8|0;z=c[A>>2]|0;c[A>>2]=z+1;G=d[z]|0}c[u>>2]=G;F=G}}do{if((x|0)==21){G=Jd(b)|0;if((G|0)>-1){Kd(b,e,G);y=286;i=f;return y|0}if((G|0)==-1){y=91;i=f;return y|0}else{Bd(b,1864,286);break}}else if((x|0)==33){G=c[v>>2]|0;F=G|0;E=c[F>>2]|0;c[F>>2]=E-1;if((E|0)==0){H=Te(G)|0}else{E=G+8|0;G=c[E>>2]|0;c[E>>2]=G+1;H=d[G]|0}c[u>>2]=H;if((H|0)!=61){y=60;i=f;return y|0}G=c[v>>2]|0;E=G|0;F=c[E>>2]|0;c[E>>2]=F-1;if((F|0)==0){I=Te(G)|0}else{F=G+8|0;G=c[F>>2]|0;c[F>>2]=G+1;I=d[G]|0}c[u>>2]=I;y=282;i=f;return y|0}else if((x|0)==41){G=c[v>>2]|0;F=G|0;E=c[F>>2]|0;c[F>>2]=E-1;if((E|0)==0){J=Te(G)|0}else{E=G+8|0;G=c[E>>2]|0;c[E>>2]=G+1;J=d[G]|0}c[u>>2]=J;if((J|0)!=61){y=62;i=f;return y|0}G=c[v>>2]|0;E=G|0;F=c[E>>2]|0;c[E>>2]=F-1;if((F|0)==0){K=Te(G)|0}else{F=G+8|0;G=c[F>>2]|0;c[F>>2]=G+1;K=d[G]|0}c[u>>2]=K;y=281;i=f;return y|0}else if((x|0)==49){G=c[v>>2]|0;F=G|0;E=c[F>>2]|0;c[F>>2]=E-1;if((E|0)==0){L=Te(G)|0}else{E=G+8|0;G=c[E>>2]|0;c[E>>2]=G+1;L=d[G]|0}c[u>>2]=L;if((L|0)!=61){y=126;i=f;return y|0}G=c[v>>2]|0;E=G|0;F=c[E>>2]|0;c[E>>2]=F-1;if((F|0)==0){M=Te(G)|0}else{F=G+8|0;G=c[F>>2]|0;c[F>>2]=G+1;M=d[G]|0}c[u>>2]=M;y=283;i=f;return y|0}else if((x|0)==57){G=c[t>>2]|0;F=G+4|0;E=c[F>>2]|0;D=G+8|0;C=c[D>>2]|0;if((E+1|0)>>>0>C>>>0){if(C>>>0>2147483645>>>0){z=r|0;Wd(z,(c[b+64>>2]|0)+16|0,80);A=b+52|0;B=c[b+4>>2]|0;Vd(c[A>>2]|0,1928,(N=i,i=i+24|0,c[N>>2]=z,c[N+8>>2]=B,c[N+16>>2]=1664,N)|0)|0;i=N;Oc(c[A>>2]|0,3);O=c[D>>2]|0;P=A}else{O=C;P=b+52|0}C=O<<1;A=c[P>>2]|0;if((C|0)==-2){Q=Od(A)|0;R=G|0}else{B=G|0;Q=Nd(A,c[B>>2]|0,O,C)|0;R=B}c[R>>2]=Q;c[D>>2]=C;S=c[F>>2]|0;T=Q}else{S=E;T=c[G>>2]|0}G=w&255;c[F>>2]=S+1;a[T+S|0]=G;F=c[v>>2]|0;E=F|0;C=c[E>>2]|0;c[E>>2]=C-1;if((C|0)==0){U=Te(F)|0}else{C=F+8|0;F=c[C>>2]|0;c[C>>2]=F+1;U=d[F]|0}c[u>>2]=U;if((U|0)==(w|0)){V=U&255}else{F=m|0;C=b+64|0;E=b+52|0;D=b+4|0;B=s|0;A=p|0;z=o|0;W=n|0;X=q|0;Y=U;while(1){c:do{if((Y|0)==(-1|0)){Wd(B,(c[C>>2]|0)+16|0,80);Z=c[D>>2]|0;_=Vd(c[E>>2]|0,1928,(N=i,i=i+24|0,c[N>>2]=B,c[N+8>>2]=Z,c[N+16>>2]=1640,N)|0)|0;i=N;Vd(c[E>>2]|0,1904,(N=i,i=i+16|0,c[N>>2]=_,c[N+8>>2]=2e3,N)|0)|0;i=N;Oc(c[E>>2]|0,3);x=71}else if((Y|0)==10|(Y|0)==13){Bd(b,1640,286);x=71}else if((Y|0)==92){_=c[v>>2]|0;Z=_|0;$=c[Z>>2]|0;c[Z>>2]=$-1;if(($|0)==0){aa=Te(_)|0}else{$=_+8|0;_=c[$>>2]|0;c[$>>2]=_+1;aa=d[_]|0}c[u>>2]=aa;switch(aa|0){case 98:{ba=8;break};case 102:{ba=12;break};case 110:{ba=10;break};case 114:{ba=13;break};case 116:{ba=9;break};case 118:{ba=11;break};case 10:case 13:{_=c[t>>2]|0;$=_+4|0;Z=c[$>>2]|0;ca=_+8|0;da=c[ca>>2]|0;if((Z+1|0)>>>0>da>>>0){if(da>>>0>2147483645>>>0){Wd(X,(c[C>>2]|0)+16|0,80);ea=c[D>>2]|0;Vd(c[E>>2]|0,1928,(N=i,i=i+24|0,c[N>>2]=X,c[N+8>>2]=ea,c[N+16>>2]=1664,N)|0)|0;i=N;Oc(c[E>>2]|0,3);fa=c[ca>>2]|0}else{fa=da}da=fa<<1;ea=c[E>>2]|0;if((da|0)==-2){ga=Od(ea)|0;ha=_|0}else{ia=_|0;ga=Nd(ea,c[ia>>2]|0,fa,da)|0;ha=ia}c[ha>>2]=ga;c[ca>>2]=da;ja=c[$>>2]|0;ka=ga}else{ja=Z;ka=c[_>>2]|0}c[$>>2]=ja+1;a[ka+ja|0]=10;Id(b);x=71;break c;break};case 97:{ba=7;break};case-1:{la=-1;break c;break};default:{if((aa-48|0)>>>0<10>>>0){ma=0;na=0;oa=aa}else{$=c[t>>2]|0;_=$+4|0;Z=c[_>>2]|0;da=$+8|0;ca=c[da>>2]|0;if((Z+1|0)>>>0>ca>>>0){if(ca>>>0>2147483645>>>0){Wd(A,(c[C>>2]|0)+16|0,80);ia=c[D>>2]|0;Vd(c[E>>2]|0,1928,(N=i,i=i+24|0,c[N>>2]=A,c[N+8>>2]=ia,c[N+16>>2]=1664,N)|0)|0;i=N;Oc(c[E>>2]|0,3);pa=c[da>>2]|0}else{pa=ca}ca=pa<<1;ia=c[E>>2]|0;if((ca|0)==-2){qa=Od(ia)|0;ra=$|0}else{ea=$|0;qa=Nd(ia,c[ea>>2]|0,pa,ca)|0;ra=ea}c[ra>>2]=qa;c[da>>2]=ca;sa=c[_>>2]|0;ta=qa}else{sa=Z;ta=c[$>>2]|0}c[_>>2]=sa+1;a[ta+sa|0]=aa;_=c[v>>2]|0;$=_|0;Z=c[$>>2]|0;c[$>>2]=Z-1;if((Z|0)==0){ua=Te(_)|0}else{Z=_+8|0;_=c[Z>>2]|0;c[Z>>2]=_+1;ua=d[_]|0}c[u>>2]=ua;la=ua;break c}while(1){va=oa-48+(na*10|0)|0;_=c[v>>2]|0;Z=_|0;$=c[Z>>2]|0;c[Z>>2]=$-1;if(($|0)==0){wa=Te(_)|0}else{$=_+8|0;_=c[$>>2]|0;c[$>>2]=_+1;wa=d[_]|0}c[u>>2]=wa;_=ma+1|0;if((_|0)>=3){break}if((wa-48|0)>>>0<10>>>0){ma=_;na=va;oa=wa}else{break}}if((va|0)>255){Bd(b,1568,286)}_=c[t>>2]|0;$=_+4|0;Z=c[$>>2]|0;ca=_+8|0;da=c[ca>>2]|0;if((Z+1|0)>>>0>da>>>0){if(da>>>0>2147483645>>>0){Wd(z,(c[C>>2]|0)+16|0,80);ea=c[D>>2]|0;Vd(c[E>>2]|0,1928,(N=i,i=i+24|0,c[N>>2]=z,c[N+8>>2]=ea,c[N+16>>2]=1664,N)|0)|0;i=N;Oc(c[E>>2]|0,3);xa=c[ca>>2]|0}else{xa=da}da=xa<<1;ea=c[E>>2]|0;if((da|0)==-2){za=Od(ea)|0;Aa=_|0}else{ia=_|0;za=Nd(ea,c[ia>>2]|0,xa,da)|0;Aa=ia}c[Aa>>2]=za;c[ca>>2]=da;Ba=c[$>>2]|0;Ca=za}else{Ba=Z;Ca=c[_>>2]|0}c[$>>2]=Ba+1;a[Ca+Ba|0]=va;x=71;break c}}$=c[t>>2]|0;_=$+4|0;Z=c[_>>2]|0;da=$+8|0;ca=c[da>>2]|0;if((Z+1|0)>>>0>ca>>>0){if(ca>>>0>2147483645>>>0){Wd(W,(c[C>>2]|0)+16|0,80);ia=c[D>>2]|0;Vd(c[E>>2]|0,1928,(N=i,i=i+24|0,c[N>>2]=W,c[N+8>>2]=ia,c[N+16>>2]=1664,N)|0)|0;i=N;Oc(c[E>>2]|0,3);Da=c[da>>2]|0}else{Da=ca}ca=Da<<1;ia=c[E>>2]|0;if((ca|0)==-2){Ea=Od(ia)|0;Ga=$|0}else{ea=$|0;Ea=Nd(ia,c[ea>>2]|0,Da,ca)|0;Ga=ea}c[Ga>>2]=Ea;c[da>>2]=ca;Ha=c[_>>2]|0;Ja=Ea}else{Ha=Z;Ja=c[$>>2]|0}c[_>>2]=Ha+1;a[Ja+Ha|0]=ba;_=c[v>>2]|0;$=_|0;Z=c[$>>2]|0;c[$>>2]=Z-1;if((Z|0)==0){Ka=Te(_)|0}else{Z=_+8|0;_=c[Z>>2]|0;c[Z>>2]=_+1;Ka=d[_]|0}c[u>>2]=Ka;la=Ka}else{_=c[t>>2]|0;Z=_+4|0;$=c[Z>>2]|0;ca=_+8|0;da=c[ca>>2]|0;if(($+1|0)>>>0>da>>>0){if(da>>>0>2147483645>>>0){Wd(F,(c[C>>2]|0)+16|0,80);ea=c[D>>2]|0;Vd(c[E>>2]|0,1928,(N=i,i=i+24|0,c[N>>2]=F,c[N+8>>2]=ea,c[N+16>>2]=1664,N)|0)|0;i=N;Oc(c[E>>2]|0,3);La=c[ca>>2]|0}else{La=da}da=La<<1;ea=c[E>>2]|0;if((da|0)==-2){Ma=Od(ea)|0;Na=_|0}else{ia=_|0;Ma=Nd(ea,c[ia>>2]|0,La,da)|0;Na=ia}c[Na>>2]=Ma;c[ca>>2]=da;Oa=c[Z>>2]|0;Pa=Ma}else{Oa=$;Pa=c[_>>2]|0}c[Z>>2]=Oa+1;a[Pa+Oa|0]=Y;Z=c[v>>2]|0;_=Z|0;$=c[_>>2]|0;c[_>>2]=$-1;if(($|0)==0){Qa=Te(Z)|0}else{$=Z+8|0;Z=c[$>>2]|0;c[$>>2]=Z+1;Qa=d[Z]|0}c[u>>2]=Qa;la=Qa}}while(0);if((x|0)==71){x=0;la=c[u>>2]|0}if((la|0)==(w|0)){V=G;break}else{Y=la}}}Y=c[t>>2]|0;G=Y+4|0;E=c[G>>2]|0;F=Y+8|0;D=c[F>>2]|0;if((E+1|0)>>>0>D>>>0){if(D>>>0>2147483645>>>0){C=l|0;Wd(C,(c[b+64>>2]|0)+16|0,80);W=b+52|0;z=c[b+4>>2]|0;Vd(c[W>>2]|0,1928,(N=i,i=i+24|0,c[N>>2]=C,c[N+8>>2]=z,c[N+16>>2]=1664,N)|0)|0;i=N;Oc(c[W>>2]|0,3);Ra=c[F>>2]|0;Sa=W}else{Ra=D;Sa=b+52|0}D=Ra<<1;W=c[Sa>>2]|0;if((D|0)==-2){Ta=Od(W)|0;Ua=Y|0}else{z=Y|0;Ta=Nd(W,c[z>>2]|0,Ra,D)|0;Ua=z}c[Ua>>2]=Ta;c[F>>2]=D;Va=c[G>>2]|0;Wa=Ta}else{Va=E;Wa=c[Y>>2]|0}c[G>>2]=Va+1;a[Wa+Va|0]=V;G=c[v>>2]|0;Y=G|0;E=c[Y>>2]|0;c[Y>>2]=E-1;if((E|0)==0){Xa=Te(G)|0}else{E=G+8|0;G=c[E>>2]|0;c[E>>2]=G+1;Xa=d[G]|0}c[u>>2]=Xa;G=c[t>>2]|0;E=c[b+52>>2]|0;Y=se(E,(c[G>>2]|0)+1|0,(c[G+4>>2]|0)-2|0)|0;G=De(E,c[(c[b+48>>2]|0)+4>>2]|0,Y)|0;D=G+8|0;do{if((c[D>>2]|0)==0){c[G>>2]=1;c[D>>2]=1;F=c[E+16>>2]|0;if((c[F+68>>2]|0)>>>0<(c[F+64>>2]|0)>>>0){break}pd(E)}}while(0);c[e>>2]=Y;y=286;i=f;return y|0}else if((x|0)==164){E=c[t>>2]|0;D=E+4|0;G=c[D>>2]|0;F=E+8|0;z=c[F>>2]|0;if((G+1|0)>>>0>z>>>0){if(z>>>0>2147483645>>>0){W=k|0;Wd(W,(c[b+64>>2]|0)+16|0,80);C=b+52|0;A=c[b+4>>2]|0;Vd(c[C>>2]|0,1928,(N=i,i=i+24|0,c[N>>2]=W,c[N+8>>2]=A,c[N+16>>2]=1664,N)|0)|0;i=N;Oc(c[C>>2]|0,3);Ya=c[F>>2]|0;Za=C}else{Ya=z;Za=b+52|0}z=Ya<<1;C=c[Za>>2]|0;if((z|0)==-2){_a=Od(C)|0;$a=E|0}else{A=E|0;_a=Nd(C,c[A>>2]|0,Ya,z)|0;$a=A}c[$a>>2]=_a;c[F>>2]=z;ab=c[D>>2]|0;bb=_a}else{ab=G;bb=c[E>>2]|0}c[D>>2]=ab+1;a[bb+ab|0]=46;D=c[v>>2]|0;E=D|0;G=c[E>>2]|0;c[E>>2]=G-1;if((G|0)==0){cb=Te(D)|0}else{G=D+8|0;D=c[G>>2]|0;c[G>>2]=D+1;cb=d[D]|0}c[u>>2]=cb;if((db(1856,cb|0,2)|0)==0){if(!((cb-48|0)>>>0<10>>>0)){y=46;i=f;return y|0}Ld(b,e);y=284;i=f;return y|0}D=c[t>>2]|0;G=D+4|0;E=c[G>>2]|0;z=D+8|0;F=c[z>>2]|0;if((E+1|0)>>>0>F>>>0){if(F>>>0>2147483645>>>0){A=h|0;Wd(A,(c[b+64>>2]|0)+16|0,80);C=b+52|0;W=c[b+4>>2]|0;Vd(c[C>>2]|0,1928,(N=i,i=i+24|0,c[N>>2]=A,c[N+8>>2]=W,c[N+16>>2]=1664,N)|0)|0;i=N;Oc(c[C>>2]|0,3);eb=c[z>>2]|0;fb=C}else{eb=F;fb=b+52|0}F=eb<<1;C=c[fb>>2]|0;if((F|0)==-2){gb=Od(C)|0;hb=D|0}else{W=D|0;gb=Nd(C,c[W>>2]|0,eb,F)|0;hb=W}c[hb>>2]=gb;c[z>>2]=F;ib=c[G>>2]|0;jb=gb}else{ib=E;jb=c[D>>2]|0}c[G>>2]=ib+1;a[jb+ib|0]=cb;G=c[v>>2]|0;D=G|0;E=c[D>>2]|0;c[D>>2]=E-1;if((E|0)==0){kb=Te(G)|0}else{E=G+8|0;G=c[E>>2]|0;c[E>>2]=G+1;kb=d[G]|0}c[u>>2]=kb;if((db(1856,kb|0,2)|0)==0){y=278;i=f;return y|0}G=c[t>>2]|0;E=G+4|0;D=c[E>>2]|0;F=G+8|0;z=c[F>>2]|0;if((D+1|0)>>>0>z>>>0){if(z>>>0>2147483645>>>0){W=g|0;Wd(W,(c[b+64>>2]|0)+16|0,80);C=b+52|0;A=c[b+4>>2]|0;Vd(c[C>>2]|0,1928,(N=i,i=i+24|0,c[N>>2]=W,c[N+8>>2]=A,c[N+16>>2]=1664,N)|0)|0;i=N;Oc(c[C>>2]|0,3);lb=c[F>>2]|0;mb=C}else{lb=z;mb=b+52|0}z=lb<<1;C=c[mb>>2]|0;if((z|0)==-2){nb=Od(C)|0;ob=G|0}else{A=G|0;nb=Nd(C,c[A>>2]|0,lb,z)|0;ob=A}c[ob>>2]=nb;c[F>>2]=z;pb=c[E>>2]|0;qb=nb}else{pb=D;qb=c[G>>2]|0}c[E>>2]=pb+1;a[qb+pb|0]=kb;E=c[v>>2]|0;G=E|0;D=c[G>>2]|0;c[G>>2]=D-1;if((D|0)==0){rb=Te(E)|0}else{D=E+8|0;E=c[D>>2]|0;c[D>>2]=E+1;rb=d[E]|0}c[u>>2]=rb;y=279;i=f;return y|0}else if((x|0)==210){E=c[u>>2]|0;if((E-48|0)>>>0<10>>>0){Ld(b,e);y=284;i=f;return y|0}do{if((Fa(E|0)|0)==0){D=c[u>>2]|0;if((D|0)==95){break}G=c[v>>2]|0;z=G|0;F=c[z>>2]|0;c[z>>2]=F-1;if((F|0)==0){sb=Te(G)|0}else{F=G+8|0;G=c[F>>2]|0;c[F>>2]=G+1;sb=d[G]|0}c[u>>2]=sb;y=D;i=f;return y|0}}while(0);E=j|0;Y=b+64|0;D=b+52|0;G=b+4|0;while(1){F=c[u>>2]|0;z=c[t>>2]|0;A=z+4|0;C=c[A>>2]|0;W=z+8|0;X=c[W>>2]|0;if((C+1|0)>>>0>X>>>0){if(X>>>0>2147483645>>>0){Wd(E,(c[Y>>2]|0)+16|0,80);B=c[G>>2]|0;Vd(c[D>>2]|0,1928,(N=i,i=i+24|0,c[N>>2]=E,c[N+8>>2]=B,c[N+16>>2]=1664,N)|0)|0;i=N;Oc(c[D>>2]|0,3);tb=c[W>>2]|0}else{tb=X}X=tb<<1;B=c[D>>2]|0;if((X|0)==-2){ub=Od(B)|0;vb=z|0}else{Z=z|0;ub=Nd(B,c[Z>>2]|0,tb,X)|0;vb=Z}c[vb>>2]=ub;c[W>>2]=X;wb=c[A>>2]|0;xb=ub}else{wb=C;xb=c[z>>2]|0}c[A>>2]=wb+1;a[xb+wb|0]=F;F=c[v>>2]|0;A=F|0;z=c[A>>2]|0;c[A>>2]=z-1;if((z|0)==0){yb=Te(F)|0}else{z=F+8|0;F=c[z>>2]|0;c[z>>2]=F+1;yb=d[F]|0}c[u>>2]=yb;if((ya(yb|0)|0)!=0){continue}if((c[u>>2]|0)!=95){break}}E=c[t>>2]|0;G=c[D>>2]|0;Y=se(G,c[E>>2]|0,c[E+4>>2]|0)|0;E=De(G,c[(c[b+48>>2]|0)+4>>2]|0,Y)|0;F=E+8|0;do{if((c[F>>2]|0)==0){c[E>>2]=1;c[F>>2]=1;z=c[G+16>>2]|0;if((c[z+68>>2]|0)>>>0<(c[z+64>>2]|0)>>>0){break}pd(G)}}while(0);G=a[Y+6|0]|0;if(G<<24>>24==0){c[e>>2]=Y;y=285;i=f;return y|0}else{y=G&255|256;i=f;return y|0}}else if((x|0)==238){i=f;return y|0}}while(0);x=c[v>>2]|0;e=x|0;b=c[e>>2]|0;c[e>>2]=b-1;if((b|0)==0){zb=Te(x)|0}else{b=x+8|0;x=c[b>>2]|0;c[b>>2]=x+1;zb=d[x]|0}c[u>>2]=zb;if((zb|0)!=61){y=61;i=f;return y|0}zb=c[v>>2]|0;v=zb|0;x=c[v>>2]|0;c[v>>2]=x-1;if((x|0)==0){Ab=Te(zb)|0}else{x=zb+8|0;zb=c[x>>2]|0;c[x>>2]=zb+1;Ab=d[zb]|0}c[u>>2]=Ab;y=280;i=f;return y|0}function Hd(a){a=a|0;c[a+32>>2]=Gd(a,a+40|0)|0;return}function Id(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;b=a|0;e=c[b>>2]|0;f=a+56|0;g=c[f>>2]|0;h=g|0;i=c[h>>2]|0;c[h>>2]=i-1;if((i|0)==0){j=Te(g)|0}else{i=g+8|0;g=c[i>>2]|0;c[i>>2]=g+1;j=d[g]|0}c[b>>2]=j;do{if((j|0)==10|(j|0)==13){if((j|0)==(e|0)){break}g=c[f>>2]|0;i=g|0;h=c[i>>2]|0;c[i>>2]=h-1;if((h|0)==0){k=Te(g)|0}else{h=g+8|0;g=c[h>>2]|0;c[h>>2]=g+1;k=d[g]|0}c[b>>2]=k}}while(0);k=a+4|0;b=c[k>>2]|0;c[k>>2]=b+1;if((b|0)<=2147483643){return}Bd(a,1416,c[a+16>>2]|0);return}function Jd(b){b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0;e=i;i=i+160|0;f=e|0;g=e+80|0;h=b|0;j=c[h>>2]|0;k=b+60|0;l=c[k>>2]|0;m=l+4|0;n=c[m>>2]|0;o=l+8|0;p=c[o>>2]|0;if((n+1|0)>>>0>p>>>0){if(p>>>0>2147483645>>>0){q=g|0;Wd(q,(c[b+64>>2]|0)+16|0,80);g=b+52|0;r=c[b+4>>2]|0;Vd(c[g>>2]|0,1928,(s=i,i=i+24|0,c[s>>2]=q,c[s+8>>2]=r,c[s+16>>2]=1664,s)|0)|0;i=s;Oc(c[g>>2]|0,3);t=c[o>>2]|0;u=g}else{t=p;u=b+52|0}p=t<<1;g=c[u>>2]|0;if((p|0)==-2){v=Od(g)|0;w=l|0}else{u=l|0;v=Nd(g,c[u>>2]|0,t,p)|0;w=u}c[w>>2]=v;c[o>>2]=p;x=c[m>>2]|0;y=v}else{x=n;y=c[l>>2]|0}c[m>>2]=x+1;a[y+x|0]=j;x=b+56|0;y=c[x>>2]|0;m=y|0;l=c[m>>2]|0;c[m>>2]=l-1;if((l|0)==0){z=Te(y)|0}else{l=y+8|0;y=c[l>>2]|0;c[l>>2]=y+1;z=d[y]|0}c[h>>2]=z;if((z|0)!=61){A=z;B=0;C=(A|0)!=(j|0);D=C<<31>>31;E=D^B;i=e;return E|0}z=f|0;f=b+64|0;y=b+52|0;l=b+4|0;b=61;m=0;while(1){n=c[k>>2]|0;v=n+4|0;p=c[v>>2]|0;o=n+8|0;w=c[o>>2]|0;if((p+1|0)>>>0>w>>>0){if(w>>>0>2147483645>>>0){Wd(z,(c[f>>2]|0)+16|0,80);u=c[l>>2]|0;Vd(c[y>>2]|0,1928,(s=i,i=i+24|0,c[s>>2]=z,c[s+8>>2]=u,c[s+16>>2]=1664,s)|0)|0;i=s;Oc(c[y>>2]|0,3);F=c[o>>2]|0}else{F=w}w=F<<1;u=c[y>>2]|0;if((w|0)==-2){G=Od(u)|0;H=n|0}else{t=n|0;G=Nd(u,c[t>>2]|0,F,w)|0;H=t}c[H>>2]=G;c[o>>2]=w;I=c[v>>2]|0;J=G}else{I=p;J=c[n>>2]|0}c[v>>2]=I+1;a[J+I|0]=b;v=c[x>>2]|0;n=v|0;p=c[n>>2]|0;c[n>>2]=p-1;if((p|0)==0){K=Te(v)|0}else{p=v+8|0;v=c[p>>2]|0;c[p>>2]=v+1;K=d[v]|0}c[h>>2]=K;v=m+1|0;if((K|0)==61){b=K&255;m=v}else{A=K;B=v;break}}C=(A|0)!=(j|0);D=C<<31>>31;E=D^B;i=e;return E|0}function Kd(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0;g=i;i=i+480|0;h=g|0;j=g+80|0;k=g+160|0;l=g+240|0;m=g+320|0;n=g+400|0;o=b|0;p=c[o>>2]|0;q=b+60|0;r=c[q>>2]|0;s=r+4|0;t=c[s>>2]|0;u=r+8|0;v=c[u>>2]|0;if((t+1|0)>>>0>v>>>0){if(v>>>0>2147483645>>>0){w=m|0;Wd(w,(c[b+64>>2]|0)+16|0,80);m=b+52|0;x=c[b+4>>2]|0;Vd(c[m>>2]|0,1928,(y=i,i=i+24|0,c[y>>2]=w,c[y+8>>2]=x,c[y+16>>2]=1664,y)|0)|0;i=y;Oc(c[m>>2]|0,3);z=c[u>>2]|0;A=m}else{z=v;A=b+52|0}v=z<<1;m=c[A>>2]|0;if((v|0)==-2){B=Od(m)|0;C=r|0}else{A=r|0;B=Nd(m,c[A>>2]|0,z,v)|0;C=A}c[C>>2]=B;c[u>>2]=v;D=c[s>>2]|0;E=B}else{D=t;E=c[r>>2]|0}c[s>>2]=D+1;a[E+D|0]=p;p=b+56|0;D=c[p>>2]|0;E=D|0;s=c[E>>2]|0;c[E>>2]=s-1;if((s|0)==0){F=Te(D)|0}else{s=D+8|0;D=c[s>>2]|0;c[s>>2]=D+1;F=d[D]|0}c[o>>2]=F;if((F|0)==10|(F|0)==13){Id(b);G=15}else{H=F}a:while(1){if((G|0)==15){G=0;H=c[o>>2]|0}I=(e|0)==0;F=h|0;J=b+64|0;K=b+52|0;L=b+4|0;D=l|0;s=(f|0)==0;E=H;b:while(1){c:do{if(I){r=E;while(1){switch(r|0){case-1:{G=24;break b;break};case 93:{G=39;break b;break};case 91:{break c;break};case 10:case 13:{G=52;break b;break};default:{}}t=c[p>>2]|0;B=t|0;v=c[B>>2]|0;c[B>>2]=v-1;if((v|0)==0){M=Te(t)|0}else{v=t+8|0;t=c[v>>2]|0;c[v>>2]=t+1;M=d[t]|0}c[o>>2]=M;r=M}}else{r=E;while(1){switch(r|0){case-1:{G=24;break b;break};case 93:{G=39;break b;break};case 91:{break c;break};case 10:case 13:{G=52;break b;break};default:{}}t=c[q>>2]|0;v=t+4|0;B=c[v>>2]|0;u=t+8|0;C=c[u>>2]|0;if((B+1|0)>>>0>C>>>0){if(C>>>0>2147483645>>>0){Wd(F,(c[J>>2]|0)+16|0,80);A=c[L>>2]|0;Vd(c[K>>2]|0,1928,(y=i,i=i+24|0,c[y>>2]=F,c[y+8>>2]=A,c[y+16>>2]=1664,y)|0)|0;i=y;Oc(c[K>>2]|0,3);N=c[u>>2]|0}else{N=C}C=N<<1;A=c[K>>2]|0;if((C|0)==-2){O=Od(A)|0;P=t|0}else{z=t|0;O=Nd(A,c[z>>2]|0,N,C)|0;P=z}c[P>>2]=O;c[u>>2]=C;Q=c[v>>2]|0;R=O}else{Q=B;R=c[t>>2]|0}c[v>>2]=Q+1;a[R+Q|0]=r;v=c[p>>2]|0;t=v|0;B=c[t>>2]|0;c[t>>2]=B-1;if((B|0)==0){S=Te(v)|0}else{B=v+8|0;v=c[B>>2]|0;c[B>>2]=v+1;S=d[v]|0}c[o>>2]=S;r=S}}}while(0);if((Jd(b)|0)!=(f|0)){G=15;continue a}r=c[o>>2]|0;v=c[q>>2]|0;B=v+4|0;t=c[B>>2]|0;C=v+8|0;u=c[C>>2]|0;if((t+1|0)>>>0>u>>>0){if(u>>>0>2147483645>>>0){Wd(D,(c[J>>2]|0)+16|0,80);z=c[L>>2]|0;Vd(c[K>>2]|0,1928,(y=i,i=i+24|0,c[y>>2]=D,c[y+8>>2]=z,c[y+16>>2]=1664,y)|0)|0;i=y;Oc(c[K>>2]|0,3);T=c[C>>2]|0}else{T=u}u=T<<1;z=c[K>>2]|0;if((u|0)==-2){U=Od(z)|0;V=v|0}else{A=v|0;U=Nd(z,c[A>>2]|0,T,u)|0;V=A}c[V>>2]=U;c[C>>2]=u;W=c[B>>2]|0;X=U}else{W=t;X=c[v>>2]|0}c[B>>2]=W+1;a[X+W|0]=r;r=c[p>>2]|0;B=r|0;v=c[B>>2]|0;c[B>>2]=v-1;if((v|0)==0){Y=Te(r)|0}else{v=r+8|0;r=c[v>>2]|0;c[v>>2]=r+1;Y=d[r]|0}c[o>>2]=Y;if(s){G=38;break}else{E=Y}}if((G|0)==24){G=0;E=n|0;Wd(E,(c[J>>2]|0)+16|0,80);s=c[L>>2]|0;D=Vd(c[K>>2]|0,1928,(y=i,i=i+24|0,c[y>>2]=E,c[y+8>>2]=s,c[y+16>>2]=(e|0)!=0?1536:1512,y)|0)|0;i=y;Vd(c[K>>2]|0,1904,(y=i,i=i+16|0,c[y>>2]=D,c[y+8>>2]=2e3,y)|0)|0;i=y;Oc(c[K>>2]|0,3);G=15;continue}else if((G|0)==38){G=0;Bd(b,1448,91);G=15;continue}else if((G|0)==39){G=0;if((Jd(b)|0)==(f|0)){break}else{G=15;continue}}else if((G|0)==52){G=0;D=c[q>>2]|0;s=D+4|0;E=c[s>>2]|0;F=D+8|0;r=c[F>>2]|0;if((E+1|0)>>>0>r>>>0){if(r>>>0>2147483645>>>0){v=j|0;Wd(v,(c[J>>2]|0)+16|0,80);B=c[L>>2]|0;Vd(c[K>>2]|0,1928,(y=i,i=i+24|0,c[y>>2]=v,c[y+8>>2]=B,c[y+16>>2]=1664,y)|0)|0;i=y;Oc(c[K>>2]|0,3);Z=c[F>>2]|0}else{Z=r}r=Z<<1;B=c[K>>2]|0;if((r|0)==-2){_=Od(B)|0;$=D|0}else{v=D|0;_=Nd(B,c[v>>2]|0,Z,r)|0;$=v}c[$>>2]=_;c[F>>2]=r;aa=c[s>>2]|0;ba=_}else{aa=E;ba=c[D>>2]|0}c[s>>2]=aa+1;a[ba+aa|0]=10;Id(b);if(!I){G=15;continue}c[(c[q>>2]|0)+4>>2]=0;G=15;continue}}G=c[o>>2]|0;aa=c[q>>2]|0;ba=aa+4|0;_=c[ba>>2]|0;$=aa+8|0;Z=c[$>>2]|0;if((_+1|0)>>>0>Z>>>0){if(Z>>>0>2147483645>>>0){j=k|0;Wd(j,(c[J>>2]|0)+16|0,80);J=c[L>>2]|0;Vd(c[K>>2]|0,1928,(y=i,i=i+24|0,c[y>>2]=j,c[y+8>>2]=J,c[y+16>>2]=1664,y)|0)|0;i=y;Oc(c[K>>2]|0,3);ca=c[$>>2]|0}else{ca=Z}Z=ca<<1;y=c[K>>2]|0;if((Z|0)==-2){da=Od(y)|0;ea=aa|0}else{J=aa|0;da=Nd(y,c[J>>2]|0,ca,Z)|0;ea=J}c[ea>>2]=da;c[$>>2]=Z;fa=c[ba>>2]|0;ga=da}else{fa=_;ga=c[aa>>2]|0}c[ba>>2]=fa+1;a[ga+fa|0]=G;G=c[p>>2]|0;p=G|0;fa=c[p>>2]|0;c[p>>2]=fa-1;if((fa|0)==0){ha=Te(G)|0}else{fa=G+8|0;G=c[fa>>2]|0;c[fa>>2]=G+1;ha=d[G]|0}c[o>>2]=ha;if(I){i=g;return}I=c[q>>2]|0;q=f+2|0;f=c[K>>2]|0;K=se(f,(c[I>>2]|0)+q|0,(c[I+4>>2]|0)-(q<<1)|0)|0;q=De(f,c[(c[b+48>>2]|0)+4>>2]|0,K)|0;b=q+8|0;do{if((c[b>>2]|0)==0){c[q>>2]=1;c[b>>2]=1;I=c[f+16>>2]|0;if((c[I+68>>2]|0)>>>0<(c[I+64>>2]|0)>>>0){break}pd(f)}}while(0);c[e>>2]=K;i=g;return}function Ld(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0;f=i;i=i+400|0;g=f|0;h=f+80|0;j=f+160|0;k=f+240|0;l=b|0;m=b+60|0;n=f+320|0;o=b+64|0;p=b+52|0;q=b+4|0;r=b+56|0;s=c[l>>2]&255;while(1){t=c[m>>2]|0;u=t+4|0;v=c[u>>2]|0;w=t+8|0;x=c[w>>2]|0;if((v+1|0)>>>0>x>>>0){if(x>>>0>2147483645>>>0){Wd(n,(c[o>>2]|0)+16|0,80);y=c[q>>2]|0;Vd(c[p>>2]|0,1928,(z=i,i=i+24|0,c[z>>2]=n,c[z+8>>2]=y,c[z+16>>2]=1664,z)|0)|0;i=z;Oc(c[p>>2]|0,3);A=c[w>>2]|0}else{A=x}x=A<<1;y=c[p>>2]|0;if((x|0)==-2){B=Od(y)|0;C=t|0}else{D=t|0;B=Nd(y,c[D>>2]|0,A,x)|0;C=D}c[C>>2]=B;c[w>>2]=x;E=c[u>>2]|0;F=B}else{E=v;F=c[t>>2]|0}c[u>>2]=E+1;a[F+E|0]=s;u=c[r>>2]|0;t=u|0;v=c[t>>2]|0;c[t>>2]=v-1;if((v|0)==0){G=Te(u)|0}else{v=u+8|0;u=c[v>>2]|0;c[v>>2]=u+1;G=d[u]|0}c[l>>2]=G;if((G-48|0)>>>0<10>>>0|(G|0)==46){s=G&255}else{break}}do{if((db(1728,G|0,3)|0)==0){H=G}else{s=c[m>>2]|0;E=s+4|0;F=c[E>>2]|0;B=s+8|0;C=c[B>>2]|0;if((F+1|0)>>>0>C>>>0){if(C>>>0>2147483645>>>0){A=h|0;Wd(A,(c[o>>2]|0)+16|0,80);n=c[q>>2]|0;Vd(c[p>>2]|0,1928,(z=i,i=i+24|0,c[z>>2]=A,c[z+8>>2]=n,c[z+16>>2]=1664,z)|0)|0;i=z;Oc(c[p>>2]|0,3);I=c[B>>2]|0}else{I=C}C=I<<1;n=c[p>>2]|0;if((C|0)==-2){J=Od(n)|0;K=s|0}else{A=s|0;J=Nd(n,c[A>>2]|0,I,C)|0;K=A}c[K>>2]=J;c[B>>2]=C;L=c[E>>2]|0;M=J}else{L=F;M=c[s>>2]|0}c[E>>2]=L+1;a[M+L|0]=G;E=c[r>>2]|0;s=E|0;F=c[s>>2]|0;c[s>>2]=F-1;if((F|0)==0){N=Te(E)|0}else{F=E+8|0;E=c[F>>2]|0;c[F>>2]=E+1;N=d[E]|0}c[l>>2]=N;if((db(1720,N|0,3)|0)==0){H=N;break}E=c[m>>2]|0;F=E+4|0;s=c[F>>2]|0;C=E+8|0;B=c[C>>2]|0;if((s+1|0)>>>0>B>>>0){if(B>>>0>2147483645>>>0){A=g|0;Wd(A,(c[o>>2]|0)+16|0,80);n=c[q>>2]|0;Vd(c[p>>2]|0,1928,(z=i,i=i+24|0,c[z>>2]=A,c[z+8>>2]=n,c[z+16>>2]=1664,z)|0)|0;i=z;Oc(c[p>>2]|0,3);O=c[C>>2]|0}else{O=B}B=O<<1;n=c[p>>2]|0;if((B|0)==-2){P=Od(n)|0;Q=E|0}else{A=E|0;P=Nd(n,c[A>>2]|0,O,B)|0;Q=A}c[Q>>2]=P;c[C>>2]=B;R=c[F>>2]|0;S=P}else{R=s;S=c[E>>2]|0}c[F>>2]=R+1;a[S+R|0]=N;F=c[r>>2]|0;E=F|0;s=c[E>>2]|0;c[E>>2]=s-1;if((s|0)==0){T=Te(F)|0}else{s=F+8|0;F=c[s>>2]|0;c[s>>2]=F+1;T=d[F]|0}c[l>>2]=T;H=T}}while(0);T=k|0;k=H;while(1){H=(ya(k|0)|0)==0;N=c[l>>2]|0;if(H){if((N|0)==95){U=95}else{break}}else{U=N&255}N=c[m>>2]|0;H=N+4|0;R=c[H>>2]|0;S=N+8|0;P=c[S>>2]|0;if((R+1|0)>>>0>P>>>0){if(P>>>0>2147483645>>>0){Wd(T,(c[o>>2]|0)+16|0,80);Q=c[q>>2]|0;Vd(c[p>>2]|0,1928,(z=i,i=i+24|0,c[z>>2]=T,c[z+8>>2]=Q,c[z+16>>2]=1664,z)|0)|0;i=z;Oc(c[p>>2]|0,3);V=c[S>>2]|0}else{V=P}P=V<<1;Q=c[p>>2]|0;if((P|0)==-2){W=Od(Q)|0;X=N|0}else{O=N|0;W=Nd(Q,c[O>>2]|0,V,P)|0;X=O}c[X>>2]=W;c[S>>2]=P;Y=c[H>>2]|0;Z=W}else{Y=R;Z=c[N>>2]|0}c[H>>2]=Y+1;a[Z+Y|0]=U;H=c[r>>2]|0;N=H|0;R=c[N>>2]|0;c[N>>2]=R-1;if((R|0)==0){_=Te(H)|0}else{R=H+8|0;H=c[R>>2]|0;c[R>>2]=H+1;_=d[H]|0}c[l>>2]=_;k=_}_=c[m>>2]|0;k=_+4|0;l=c[k>>2]|0;r=_+8|0;U=c[r>>2]|0;if((l+1|0)>>>0>U>>>0){if(U>>>0>2147483645>>>0){Y=j|0;Wd(Y,(c[o>>2]|0)+16|0,80);o=c[q>>2]|0;Vd(c[p>>2]|0,1928,(z=i,i=i+24|0,c[z>>2]=Y,c[z+8>>2]=o,c[z+16>>2]=1664,z)|0)|0;i=z;Oc(c[p>>2]|0,3);$=c[r>>2]|0}else{$=U}U=$<<1;z=c[p>>2]|0;if((U|0)==-2){aa=Od(z)|0;ba=_|0}else{p=_|0;aa=Nd(z,c[p>>2]|0,$,U)|0;ba=p}c[ba>>2]=aa;c[r>>2]=U;ca=c[k>>2]|0;da=aa}else{ca=l;da=c[_>>2]|0}c[k>>2]=ca+1;a[da+ca|0]=0;ca=b+68|0;da=a[ca]|0;k=c[m>>2]|0;_=c[k>>2]|0;l=c[k+4>>2]|0;if((l|0)==0){ea=_}else{k=l;do{k=k-1|0;l=_+k|0;if((a[l]|0)==46){a[l]=da}}while((k|0)!=0);ea=c[c[m>>2]>>2]|0}k=e|0;if((Td(ea,k)|0)!=0){i=f;return}ea=Xa()|0;e=a[ca]|0;if((ea|0)==0){fa=46}else{fa=a[c[ea>>2]|0]|0}a[ca]=fa;ea=c[m>>2]|0;da=c[ea>>2]|0;_=c[ea+4>>2]|0;if((_|0)==0){ga=da}else{ea=_;do{ea=ea-1|0;_=da+ea|0;if((a[_]|0)==e<<24>>24){a[_]=fa}}while((ea|0)!=0);ga=c[c[m>>2]>>2]|0}if((Td(ga,k)|0)!=0){i=f;return}k=a[ca]|0;ca=c[m>>2]|0;m=c[ca>>2]|0;ga=c[ca+4>>2]|0;if((ga|0)!=0){ca=ga;do{ca=ca-1|0;ga=m+ca|0;if((a[ga]|0)==k<<24>>24){a[ga]=46}}while((ca|0)!=0)}Bd(b,1696,284);i=f;return}function Md(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0;h=i;j=c[d>>2]|0;do{if((j|0)<((f|0)/2|0|0)){k=j<<1;l=(k|0)<4?4:k}else{if((j|0)<(f|0)){l=f;break}Jc(a,g,(m=i,i=i+1|0,i=i+7&-8,c[m>>2]=0,m)|0);i=m;l=f}}while(0);if((l+1|0)>>>0>(4294967293/(e>>>0)|0)>>>0){Jc(a,1816,(m=i,i=i+1|0,i=i+7&-8,c[m>>2]=0,m)|0);i=m;n=0;c[d>>2]=l;i=h;return n|0}m=aa(c[d>>2]|0,e)|0;f=aa(l,e)|0;e=c[a+16>>2]|0;g=ib[c[e+12>>2]&15](c[e+16>>2]|0,b,m,f)|0;if(!((g|0)!=0|(f|0)==0)){Oc(a,4)}a=e+68|0;c[a>>2]=f-m+(c[a>>2]|0);n=g;c[d>>2]=l;i=h;return n|0}function Nd(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=c[a+16>>2]|0;g=ib[c[f+12>>2]&15](c[f+16>>2]|0,b,d,e)|0;if(!((g|0)!=0|(e|0)==0)){Oc(a,4)}a=f+68|0;c[a>>2]=e-d+(c[a>>2]|0);return g|0}function Od(a){a=a|0;var b=0;b=i;Jc(a,1816,(a=i,i=i+1|0,i=i+7&-8,c[a>>2]=0,a)|0);i=a;i=b;return 0}function Pd(a){a=a|0;var b=0,c=0,d=0,e=0,f=0,g=0;if(a>>>0>15>>>0){b=a;c=1;do{d=b+1|0;b=d>>>1;c=c+1|0;}while(d>>>0>31>>>0);e=b;f=c<<3}else{e=a;f=8}if(e>>>0<8>>>0){g=e;return g|0}g=f|e-8;return g|0}function Qd(a){a=a|0;var b=0,c=0;b=a>>>3&31;if((b|0)==0){c=a;return c|0}c=(a&7|8)<<b-1;return c|0}function Rd(a){a=a|0;var b=0,c=0,e=0,f=0,g=0,h=0;if(a>>>0>255>>>0){b=a;c=-1;while(1){e=c+8|0;f=b>>>8;if(b>>>0>65535>>>0){b=f;c=e}else{g=f;h=e;break}}}else{g=a;h=-1}return(d[344+g|0]|0)+h|0}function Sd(a,b){a=a|0;b=b|0;var d=0,e=0;d=c[a+8>>2]|0;if((d|0)!=(c[b+8>>2]|0)){e=0;return e|0}if((d|0)==1){e=(c[a>>2]|0)==(c[b>>2]|0)|0;return e|0}else if((d|0)==3){e=+h[a>>3]==+h[b>>3]|0;return e|0}else if((d|0)==2){e=(c[a>>2]|0)==(c[b>>2]|0)|0;return e|0}else if((d|0)==0){e=1;return e|0}else{e=(c[a>>2]|0)==(c[b>>2]|0)|0;return e|0}return 0}function Td(b,e){b=b|0;e=e|0;var f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;i=i+8|0;g=f|0;h[e>>3]=+nf(b,g);j=c[g>>2]|0;if((j|0)==(b|0)){k=0;i=f;return k|0}l=a[j]|0;if((l<<24>>24|0)==120|(l<<24>>24|0)==88){h[e>>3]=+((sa(b|0,g|0,16)|0)>>>0>>>0);b=c[g>>2]|0;m=b;n=a[b]|0}else{m=j;n=l}if(n<<24>>24==0){k=1;i=f;return k|0}if((Ia(n&255|0)|0)==0){o=m}else{n=m;do{n=n+1|0;}while((Ia(d[n]|0)|0)!=0);c[g>>2]=n;o=n}k=(a[o]|0)==0|0;i=f;return k|0}function Ud(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0;f=i;i=i+40|0;g=f|0;j=f+32|0;k=b+8|0;l=c[k>>2]|0;c[l>>2]=se(b,3392,0)|0;c[l+8>>2]=4;l=b+28|0;m=c[k>>2]|0;if(((c[l>>2]|0)-m|0)<17){Sc(b,1);n=c[k>>2]|0}else{n=m}m=n+16|0;c[k>>2]=m;n=wa(d|0,37)|0;a:do{if((n|0)==0){o=1;p=d;q=m}else{r=j|0;s=j+1|0;t=j+2|0;u=g|0;w=g+1|0;x=f+8|0;y=1;z=d;A=n;B=m;while(1){c[B>>2]=se(b,z,A-z|0)|0;c[B+8>>2]=4;C=c[k>>2]|0;if(((c[l>>2]|0)-C|0)<17){Sc(b,1);D=c[k>>2]|0}else{D=C}C=D+16|0;c[k>>2]=C;E=A+1|0;switch(a[E]|0){case 100:{h[C>>3]=+((v=c[e+4>>2]|0,c[e+4>>2]=v+8,c[(c[e>>2]|0)+v>>2]|0)|0);c[D+24>>2]=3;F=c[k>>2]|0;if(((c[l>>2]|0)-F|0)<17){Sc(b,1);G=c[k>>2]|0}else{G=F}F=G+16|0;c[k>>2]=F;H=F;break};case 115:{F=(v=c[e+4>>2]|0,c[e+4>>2]=v+8,c[(c[e>>2]|0)+v>>2]|0);I=(F|0)==0?2952:F;F=c[k>>2]|0;c[F>>2]=se(b,I,qf(I|0)|0)|0;c[F+8>>2]=4;F=c[k>>2]|0;if(((c[l>>2]|0)-F|0)<17){Sc(b,1);J=c[k>>2]|0}else{J=F}F=J+16|0;c[k>>2]=F;H=F;break};case 102:{h[C>>3]=(v=c[e+4>>2]|0,c[e+4>>2]=v+8,+h[(c[e>>2]|0)+v>>3]);c[D+24>>2]=3;F=c[k>>2]|0;if(((c[l>>2]|0)-F|0)<17){Sc(b,1);K=c[k>>2]|0}else{K=F}F=K+16|0;c[k>>2]=F;H=F;break};case 99:{a[u]=(v=c[e+4>>2]|0,c[e+4>>2]=v+8,c[(c[e>>2]|0)+v>>2]|0);a[w]=0;F=c[k>>2]|0;c[F>>2]=se(b,u,qf(u|0)|0)|0;c[F+8>>2]=4;F=c[k>>2]|0;if(((c[l>>2]|0)-F|0)<17){Sc(b,1);L=c[k>>2]|0}else{L=F}F=L+16|0;c[k>>2]=F;H=F;break};case 112:{F=(v=c[e+4>>2]|0,c[e+4>>2]=v+8,c[(c[e>>2]|0)+v>>2]|0);Ha(x|0,2352,(I=i,i=i+8|0,c[I>>2]=F,I)|0)|0;i=I;I=c[k>>2]|0;c[I>>2]=se(b,x,qf(x|0)|0)|0;c[I+8>>2]=4;I=c[k>>2]|0;if(((c[l>>2]|0)-I|0)<17){Sc(b,1);M=c[k>>2]|0}else{M=I}I=M+16|0;c[k>>2]=I;H=I;break};case 37:{c[C>>2]=se(b,1920,1)|0;c[D+24>>2]=4;I=c[k>>2]|0;if(((c[l>>2]|0)-I|0)<17){Sc(b,1);N=c[k>>2]|0}else{N=I}I=N+16|0;c[k>>2]=I;H=I;break};default:{a[r]=37;a[s]=a[E]|0;a[t]=0;c[C>>2]=se(b,r,qf(r|0)|0)|0;c[D+24>>2]=4;C=c[k>>2]|0;if(((c[l>>2]|0)-C|0)<17){Sc(b,1);O=c[k>>2]|0}else{O=C}C=O+16|0;c[k>>2]=C;H=C}}C=y+2|0;E=A+2|0;I=wa(E|0,37)|0;if((I|0)==0){o=C;p=E;q=H;break a}else{y=C;z=E;A=I;B=H}}}}while(0);c[q>>2]=se(b,p,qf(p|0)|0)|0;c[q+8>>2]=4;q=c[k>>2]|0;if(((c[l>>2]|0)-q|0)>=17){P=q;Q=P+16|0;c[k>>2]=Q;R=o+1|0;S=b+12|0;T=c[S>>2]|0;U=Q;V=T;W=U-V|0;X=W>>4;Y=X-1|0;Re(b,R,Y);Z=c[k>>2]|0;_=-o|0;$=Z+(_<<4)|0;c[k>>2]=$;aa=~o;ba=Z+(aa<<4)|0;ca=ba;da=c[ca>>2]|0;ea=da+16|0;fa=ea;i=f;return fa|0}Sc(b,1);P=c[k>>2]|0;Q=P+16|0;c[k>>2]=Q;R=o+1|0;S=b+12|0;T=c[S>>2]|0;U=Q;V=T;W=U-V|0;X=W>>4;Y=X-1|0;Re(b,R,Y);Z=c[k>>2]|0;_=-o|0;$=Z+(_<<4)|0;c[k>>2]=$;aa=~o;ba=Z+(aa<<4)|0;ca=ba;da=c[ca>>2]|0;ea=da+16|0;fa=ea;i=f;return fa|0}function Vd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+16|0;f=e|0;g=f;c[g>>2]=d;c[g+4>>2]=0;g=Ud(a,b,f|0)|0;i=e;return g|0}function Wd(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=a[c]|0;if((e<<24>>24|0)==64){f=c+1|0;g=qf(f|0)|0;a[b]=0;if(g>>>0>(d-8|0)>>>0){h=b+(qf(b|0)|0)|0;w=3026478;a[h]=w;w=w>>8;a[h+1|0]=w;w=w>>8;a[h+2|0]=w;w=w>>8;a[h+3|0]=w;i=c+(8-d+1+g)|0}else{i=f}wf(b|0,i|0)|0;return}else if((e<<24>>24|0)==61){vf(b|0,c+1|0,d|0)|0;a[b+(d-1)|0]=0;return}else{e=Ma(c|0,1304)|0;i=d-17|0;d=e>>>0>i>>>0?i:e;rf(b|0,1152,10)|0;if((a[c+d|0]|0)==0){wf(b|0,c|0)|0}else{Ja(b|0,c|0,d|0)|0;d=b+(qf(b|0)|0)|0;w=3026478;a[d]=w;w=w>>8;a[d+1|0]=w;w=w>>8;a[d+2|0]=w;w=w>>8;a[d+3|0]=w}d=b+(qf(b|0)|0)|0;a[d]=a[984]|0;a[d+1|0]=a[985]|0;a[d+2|0]=a[986]|0;return}}function Xd(e,f,g,h){e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;j=i;i=i+648|0;k=j|0;l=j+72|0;c[k+60>>2]=g;Ed(e,k,f,se(e,h,qf(h|0)|0)|0);Yd(k,l);h=l|0;a[(c[h>>2]|0)+74|0]=2;Fd(k);l=k+52|0;e=(c[l>>2]|0)+52|0;f=(b[e>>1]|0)+1&65535;b[e>>1]=f;if((f&65535)>>>0>200>>>0){Bd(k,2040,0)}f=k+16|0;e=k+48|0;a:while(1){switch(c[f>>2]|0){case 287:{m=5;break a;break};case 260:case 261:case 262:case 276:{m=9;break a;break};default:{}}g=_d(k)|0;if((c[f>>2]|0)==59){Fd(k)}n=c[e>>2]|0;c[n+36>>2]=d[n+50|0]|0;if((g|0)!=0){m=10;break}}do{if((m|0)==5){e=(c[l>>2]|0)+52|0;b[e>>1]=(b[e>>1]|0)-1;Zd(k);o=c[h>>2]|0;p=572;q=0;r=72;s=0;i=j;return o|0}else if((m|0)==9){e=c[l>>2]|0;g=e+52|0;b[g>>1]=(b[g>>1]|0)-1;t=e}else if((m|0)==10){e=(c[f>>2]|0)==287;g=c[l>>2]|0;n=g+52|0;b[n>>1]=(b[n>>1]|0)-1;if(!e){t=g;break}Zd(k);o=c[h>>2]|0;p=572;q=0;r=72;s=0;i=j;return o|0}}while(0);l=Ad(k,287)|0;f=Vd(t,2144,(t=i,i=i+8|0,c[t>>2]=l,t)|0)|0;i=t;Cd(k,f);Zd(k);o=c[h>>2]|0;p=572;q=0;r=72;s=0;i=j;return o|0}function Yd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;e=c[b+52>>2]|0;f=hd(e)|0;c[d>>2]=f;g=b+48|0;c[d+8>>2]=c[g>>2];c[d+12>>2]=b;c[d+16>>2]=e;c[g>>2]=d;c[d+24>>2]=0;c[d+28>>2]=-1;c[d+32>>2]=-1;c[d+20>>2]=0;uf(d+36|0,0,15)|0;c[f+32>>2]=c[b+64>>2];a[f+75|0]=2;b=ve(e,0,0)|0;c[d+4>>2]=b;d=e+8|0;g=c[d>>2]|0;c[g>>2]=b;c[g+8>>2]=5;g=e+28|0;b=c[d>>2]|0;if(((c[g>>2]|0)-b|0)<17){Sc(e,1);h=c[d>>2]|0}else{h=b}b=h+16|0;c[d>>2]=b;c[b>>2]=f;c[h+24>>2]=9;h=c[d>>2]|0;if(((c[g>>2]|0)-h|0)>=17){i=h;j=i+16|0;c[d>>2]=j;return}Sc(e,1);i=c[d>>2]|0;j=i+16|0;c[d>>2]=j;return}function Zd(f){f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;g=c[f+52>>2]|0;h=f+48|0;i=c[h>>2]|0;j=c[i>>2]|0;k=i+50|0;l=a[k]|0;m=i+24|0;if(!(l<<24>>24==0)){n=j+24|0;o=l;do{l=c[m>>2]|0;p=o-1&255;a[k]=p;c[(c[n>>2]|0)+((e[i+172+((p&255)<<1)>>1]|0)*12|0)+8>>2]=l;o=a[k]|0;}while(!(o<<24>>24==0))}bc(i,0,0);o=c[m>>2]|0;if((o+1|0)>>>0<1073741824>>>0){k=j+12|0;n=j+44|0;q=Nd(g,c[k>>2]|0,c[n>>2]<<2,o<<2)|0;r=k;s=n}else{q=Od(g)|0;r=j+12|0;s=j+44|0}c[r>>2]=q;c[s>>2]=c[m>>2];s=c[m>>2]|0;if((s+1|0)>>>0<1073741824>>>0){q=j+20|0;r=j+48|0;t=Nd(g,c[q>>2]|0,c[r>>2]<<2,s<<2)|0;u=q;v=r}else{t=Od(g)|0;u=j+20|0;v=j+48|0}c[u>>2]=t;c[v>>2]=c[m>>2];m=i+40|0;v=c[m>>2]|0;if((v+1|0)>>>0<268435456>>>0){t=j+8|0;u=j+40|0;w=Nd(g,c[t>>2]|0,c[u>>2]<<4,v<<4)|0;x=t;y=u}else{w=Od(g)|0;x=j+8|0;y=j+40|0}c[x>>2]=w;c[y>>2]=c[m>>2];m=i+44|0;y=c[m>>2]|0;if((y+1|0)>>>0<1073741824>>>0){w=j+16|0;x=j+52|0;z=Nd(g,c[w>>2]|0,c[x>>2]<<2,y<<2)|0;A=w;B=x}else{z=Od(g)|0;A=j+16|0;B=j+52|0}c[A>>2]=z;c[B>>2]=c[m>>2];m=i+48|0;B=b[m>>1]|0;if((B+1|0)>>>0<357913942>>>0){z=j+24|0;A=j+56|0;C=Nd(g,c[z>>2]|0,(c[A>>2]|0)*12|0,B*12|0)|0;D=z;E=A}else{C=Od(g)|0;D=j+24|0;E=j+56|0}c[D>>2]=C;c[E>>2]=b[m>>1]|0;m=j+72|0;E=j+28|0;C=j+36|0;c[E>>2]=Nd(g,c[E>>2]|0,c[C>>2]<<2,d[m]<<2)|0;c[C>>2]=d[m]|0;c[h>>2]=c[i+8>>2];if((i|0)==0){F=g+8|0;G=c[F>>2]|0;H=G-32|0;c[F>>2]=H;return}if(!(((c[f+16>>2]|0)-285|0)>>>0<2>>>0)){F=g+8|0;G=c[F>>2]|0;H=G-32|0;c[F>>2]=H;return}i=c[f+24>>2]|0;Dd(f,i+16|0,c[i+12>>2]|0)|0;F=g+8|0;G=c[F>>2]|0;H=G-32|0;c[F>>2]=H;return}function _d(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0;g=i;i=i+392|0;h=g|0;j=g+24|0;k=g+48|0;l=g+72|0;m=g+104|0;n=g+128|0;o=g+152|0;p=g+176|0;q=g+200|0;r=g+224|0;s=g+248|0;t=g+272|0;u=g+288|0;v=g+304|0;w=g+328|0;x=g+344|0;y=g+368|0;z=g+384|0;A=f+4|0;B=c[A>>2]|0;C=f+16|0;switch(c[C>>2]|0){case 264:{D=f+48|0;E=c[D>>2]|0;c[w+4>>2]=-1;a[w+10|0]=1;F=E+50|0;a[w+8|0]=a[F]|0;a[w+9|0]=0;G=E+20|0;c[w>>2]=c[G>>2];c[G>>2]=w;Fd(f);if((c[C>>2]|0)!=285){w=c[f+52>>2]|0;H=Ad(f,285)|0;I=Vd(w,2144,(J=i,i=i+8|0,c[J>>2]=H,J)|0)|0;i=J;Cd(f,I)}I=f+24|0;H=c[I>>2]|0;Fd(f);w=c[C>>2]|0;if((w|0)==44|(w|0)==267){K=c[D>>2]|0;L=c[K+36>>2]|0;ge(f,Dd(f,2608,15)|0,0);ge(f,Dd(f,2568,11)|0,1);ge(f,Dd(f,2520,13)|0,2);ge(f,H,3);M=c[C>>2]|0;if((M|0)==44){N=f+52|0;O=4;while(1){Fd(f);if((c[C>>2]|0)!=285){P=c[N>>2]|0;Q=Ad(f,285)|0;R=Vd(P,2144,(J=i,i=i+8|0,c[J>>2]=Q,J)|0)|0;i=J;Cd(f,R)}R=c[I>>2]|0;Fd(f);ge(f,R,O);S=c[C>>2]|0;if((S|0)==44){O=O+1|0}else{break}}T=O-2|0;U=S}else{T=1;U=M}if((U|0)!=267){U=c[f+52>>2]|0;M=Ad(f,267)|0;S=Vd(U,2144,(J=i,i=i+8|0,c[J>>2]=M,J)|0)|0;i=J;Cd(f,S)}Fd(f);S=c[A>>2]|0;de(f,v,0)|0;if((c[C>>2]|0)==44){M=1;while(1){Fd(f);nc(c[D>>2]|0,v);de(f,v,0)|0;U=M+1|0;if((c[C>>2]|0)==44){M=U}else{V=U;break}}}else{V=1}M=c[D>>2]|0;U=3-V|0;V=c[v>>2]|0;do{if((V|0)==13|(V|0)==14){O=U+1|0;I=(O|0)<0?0:O;kc(M,v,I);if((I|0)<=1){break}gc(M,I-1|0)}else if((V|0)==0){W=44}else{nc(M,v);W=44}}while(0);do{if((W|0)==44){if((U|0)<=0){break}v=c[M+36>>2]|0;gc(M,U);Yb(M,v,U)}}while(0);fc(K,3);me(f,L,S,T,0);}else if((w|0)==61){w=c[D>>2]|0;T=w+36|0;S=c[T>>2]|0;ge(f,Dd(f,2464,11)|0,0);ge(f,Dd(f,2368,11)|0,1);ge(f,Dd(f,2328,10)|0,2);ge(f,H,3);if((c[C>>2]|0)!=61){H=c[f+52>>2]|0;L=Ad(f,61)|0;K=Vd(H,2144,(J=i,i=i+8|0,c[J>>2]=L,J)|0)|0;i=J;Cd(f,K)}Fd(f);de(f,k,0)|0;nc(c[D>>2]|0,k);if((c[C>>2]|0)!=44){k=c[f+52>>2]|0;K=Ad(f,44)|0;L=Vd(k,2144,(J=i,i=i+8|0,c[J>>2]=K,J)|0)|0;i=J;Cd(f,L)}Fd(f);de(f,j,0)|0;nc(c[D>>2]|0,j);if((c[C>>2]|0)==44){Fd(f);de(f,h,0)|0;nc(c[D>>2]|0,h);}else{h=c[T>>2]|0;$b(w,1,h,jc(w,1.0)|0)|0;gc(w,1)}me(f,S,B,1,1)}else{Cd(f,2640)}ae(f,262,264,B);S=c[G>>2]|0;c[G>>2]=c[S>>2];G=S+8|0;w=a[G]|0;h=c[(c[E+12>>2]|0)+48>>2]|0;T=h+50|0;D=a[T]|0;if((D&255)>>>0>(w&255)>>>0){j=h+24|0;L=(c[h>>2]|0)+24|0;K=D;do{D=c[j>>2]|0;k=K-1&255;a[T]=k;c[(c[L>>2]|0)+((e[h+172+((k&255)<<1)>>1]|0)*12|0)+8>>2]=D;K=a[T]|0;}while((K&255)>>>0>(w&255)>>>0)}if((a[S+9|0]|0)!=0){Zb(E,35,d[G]|0,0,0)|0}c[E+36>>2]=d[F]|0;ec(E,c[S+4>>2]|0);X=0;i=g;return X|0};case 277:{S=f+48|0;E=c[S>>2]|0;Fd(f);F=cc(E)|0;de(f,x,0)|0;G=x|0;if((c[G>>2]|0)==1){c[G>>2]=3}uc(c[S>>2]|0,x);S=c[x+20>>2]|0;c[y+4>>2]=-1;a[y+10|0]=1;x=E+50|0;a[y+8|0]=a[x]|0;a[y+9|0]=0;G=E+20|0;c[y>>2]=c[G>>2];c[G>>2]=y;if((c[C>>2]|0)!=259){y=c[f+52>>2]|0;w=Ad(f,259)|0;K=Vd(y,2144,(J=i,i=i+8|0,c[J>>2]=w,J)|0)|0;i=J;Cd(f,K)}Fd(f);$d(f);dc(E,_b(E)|0,F);ae(f,262,277,B);F=c[G>>2]|0;c[G>>2]=c[F>>2];G=F+8|0;K=a[G]|0;w=c[(c[E+12>>2]|0)+48>>2]|0;y=w+50|0;T=a[y]|0;if((T&255)>>>0>(K&255)>>>0){h=w+24|0;L=(c[w>>2]|0)+24|0;j=T;do{T=c[h>>2]|0;D=j-1&255;a[y]=D;c[(c[L>>2]|0)+((e[w+172+((D&255)<<1)>>1]|0)*12|0)+8>>2]=T;j=a[y]|0;}while((j&255)>>>0>(K&255)>>>0)}if((a[F+9|0]|0)!=0){Zb(E,35,d[G]|0,0,0)|0}c[E+36>>2]=d[x]|0;ec(E,c[F+4>>2]|0);ec(E,S);X=0;i=g;return X|0};case 266:{S=c[f+48>>2]|0;c[z>>2]=-1;E=ne(f)|0;while(1){F=c[C>>2]|0;if((F|0)==260){W=5;break}else if((F|0)!=261){W=6;break}ac(S,z,_b(S)|0);ec(S,E);E=ne(f)|0}if((W|0)==5){ac(S,z,_b(S)|0);ec(S,E);Fd(f);$d(f)}else if((W|0)==6){ac(S,z,E)}ec(S,c[z>>2]|0);ae(f,262,266,B);X=0;i=g;return X|0};case 259:{Fd(f);$d(f);ae(f,262,259,B);X=0;i=g;return X|0};case 272:{z=f+48|0;S=c[z>>2]|0;E=cc(S)|0;c[t+4>>2]=-1;a[t+10|0]=1;F=S+50|0;a[t+8|0]=a[F]|0;a[t+9|0]=0;x=S+20|0;c[t>>2]=c[x>>2];c[x>>2]=t;c[u+4>>2]=-1;a[u+10|0]=0;a[u+8|0]=a[F]|0;t=u+9|0;a[t]=0;c[u>>2]=c[x>>2];c[x>>2]=u;Fd(f);u=f+52|0;G=(c[u>>2]|0)+52|0;K=(b[G>>1]|0)+1&65535;b[G>>1]=K;if((K&65535)>>>0>200>>>0){Bd(f,2040,0)}a:do{switch(c[C>>2]|0){case 260:case 261:case 262:case 276:case 287:{break a;break};default:{}}K=_d(f)|0;if((c[C>>2]|0)==59){Fd(f)}G=c[z>>2]|0;c[G+36>>2]=d[G+50|0]|0;}while((K|0)==0);K=(c[u>>2]|0)+52|0;b[K>>1]=(b[K>>1]|0)-1;ae(f,276,272,B);de(f,s,0)|0;K=s|0;if((c[K>>2]|0)==1){c[K>>2]=3}uc(c[z>>2]|0,s);K=c[s+20>>2]|0;if((a[t]|0)==0){t=c[x>>2]|0;c[x>>2]=c[t>>2];s=t+8|0;u=a[s]|0;G=c[(c[S+12>>2]|0)+48>>2]|0;j=G+50|0;y=a[j]|0;if((y&255)>>>0>(u&255)>>>0){w=G+24|0;L=(c[G>>2]|0)+24|0;h=y;do{y=c[w>>2]|0;T=h-1&255;a[j]=T;c[(c[L>>2]|0)+((e[G+172+((T&255)<<1)>>1]|0)*12|0)+8>>2]=y;h=a[j]|0;}while((h&255)>>>0>(u&255)>>>0)}if((a[t+9|0]|0)!=0){Zb(S,35,d[s]|0,0,0)|0}c[S+36>>2]=d[F]|0;ec(S,c[t+4>>2]|0);dc(c[z>>2]|0,K,E)}else{t=c[z>>2]|0;s=c[t+20>>2]|0;b:do{if((s|0)==0){Y=0;W=72}else{u=0;h=s;while(1){if((a[h+10|0]|0)!=0){Z=u;_=h;break b}j=d[h+9|0]|u;G=c[h>>2]|0;if((G|0)==0){Y=j;W=72;break}else{u=j;h=G}}}}while(0);if((W|0)==72){Cd(f,2728);Z=Y;_=0}if((Z|0)!=0){Zb(t,35,d[_+8|0]|0,0,0)|0}ac(t,_+4|0,_b(t)|0);ec(c[z>>2]|0,K);K=c[x>>2]|0;c[x>>2]=c[K>>2];t=K+8|0;_=a[t]|0;Z=c[(c[S+12>>2]|0)+48>>2]|0;Y=Z+50|0;s=a[Y]|0;if((s&255)>>>0>(_&255)>>>0){h=Z+24|0;u=(c[Z>>2]|0)+24|0;G=s;do{s=c[h>>2]|0;j=G-1&255;a[Y]=j;c[(c[u>>2]|0)+((e[Z+172+((j&255)<<1)>>1]|0)*12|0)+8>>2]=s;G=a[Y]|0;}while((G&255)>>>0>(_&255)>>>0)}if((a[K+9|0]|0)!=0){Zb(S,35,d[t]|0,0,0)|0}c[S+36>>2]=d[F]|0;ec(S,c[K+4>>2]|0);K=c[z>>2]|0;dc(K,_b(S)|0,E)}E=c[x>>2]|0;c[x>>2]=c[E>>2];x=E+8|0;K=a[x]|0;z=c[(c[S+12>>2]|0)+48>>2]|0;t=z+50|0;_=a[t]|0;if((_&255)>>>0>(K&255)>>>0){G=z+24|0;Y=(c[z>>2]|0)+24|0;Z=_;do{_=c[G>>2]|0;u=Z-1&255;a[t]=u;c[(c[Y>>2]|0)+((e[z+172+((u&255)<<1)>>1]|0)*12|0)+8>>2]=_;Z=a[t]|0;}while((Z&255)>>>0>(K&255)>>>0)}if((a[E+9|0]|0)!=0){Zb(S,35,d[x]|0,0,0)|0}c[S+36>>2]=d[F]|0;ec(S,c[E+4>>2]|0);X=0;i=g;return X|0};case 273:{E=f+48|0;S=c[E>>2]|0;Fd(f);c:do{switch(c[C>>2]|0){case 260:case 261:case 262:case 276:case 287:case 59:{$=0;aa=0;break};default:{de(f,m,0)|0;if((c[C>>2]|0)==44){F=1;while(1){Fd(f);nc(c[E>>2]|0,m);de(f,m,0)|0;x=F+1|0;if((c[C>>2]|0)==44){F=x}else{ba=x;break}}}else{ba=1}if(((c[m>>2]|0)-13|0)>>>0<2>>>0){kc(S,m,-1);$=-1;aa=d[S+50|0]|0;break c}if((ba|0)==1){$=1;aa=pc(S,m)|0;break c}else{nc(S,m);$=ba;aa=d[S+50|0]|0;break c}}}}while(0);bc(S,aa,$);X=1;i=g;return X|0};case 268:{Fd(f);$=c[C>>2]|0;if(($|0)==265){Fd(f);aa=f+48|0;S=c[aa>>2]|0;if((c[C>>2]|0)!=285){ba=c[f+52>>2]|0;m=Ad(f,285)|0;E=Vd(ba,2144,(J=i,i=i+8|0,c[J>>2]=m,J)|0)|0;i=J;Cd(f,E)}E=c[f+24>>2]|0;Fd(f);ge(f,E,0);E=c[S+36>>2]|0;c[o+16>>2]=-1;c[o+20>>2]=-1;c[o>>2]=6;c[o+8>>2]=E;gc(S,1);E=c[aa>>2]|0;aa=E+50|0;m=(a[aa]|0)+1&255;a[aa]=m;c[(c[(c[E>>2]|0)+24>>2]|0)+((e[E+172+((m&255)-1<<1)>>1]|0)*12|0)+4>>2]=c[E+24>>2];fe(f,p,0,c[A>>2]|0);sc(S,o,p);c[(c[(c[S>>2]|0)+24>>2]|0)+((e[S+172+((d[S+50|0]|0)-1<<1)>>1]|0)*12|0)+4>>2]=c[S+24>>2];X=0;i=g;return X|0}S=f+24|0;p=f+52|0;o=0;A=$;while(1){if((A|0)!=285){$=c[p>>2]|0;E=Ad(f,285)|0;m=Vd($,2144,(J=i,i=i+8|0,c[J>>2]=E,J)|0)|0;i=J;Cd(f,m)}m=c[S>>2]|0;Fd(f);ca=o+1|0;ge(f,m,o);m=c[C>>2]|0;if((m|0)==61){W=104;break}else if((m|0)!=44){W=107;break}Fd(f);o=ca;A=c[C>>2]|0}do{if((W|0)==104){Fd(f);de(f,n,0)|0;if((c[C>>2]|0)==44){A=f+48|0;S=1;while(1){Fd(f);nc(c[A>>2]|0,n);de(f,n,0)|0;p=S+1|0;if((c[C>>2]|0)==44){S=p}else{da=p;break}}}else{da=1}S=c[n>>2]|0;A=f+48|0;p=c[A>>2]|0;m=ca-da|0;if((S|0)==0){ea=A;fa=p;ga=m;W=112;break}else if(!((S|0)==13|(S|0)==14)){nc(p,n);ea=A;fa=p;ga=m;W=112;break}S=m+1|0;m=(S|0)<0?0:S;kc(p,n,m);if((m|0)<=1){ha=A;break}gc(p,m-1|0);ha=A}else if((W|0)==107){c[n>>2]=0;A=f+48|0;ea=A;fa=c[A>>2]|0;ga=ca;W=112}}while(0);do{if((W|0)==112){if((ga|0)<=0){ha=ea;break}n=c[fa+36>>2]|0;gc(fa,ga);Yb(fa,n,ga);ha=ea}}while(0);ea=c[ha>>2]|0;ha=ea+50|0;ga=(d[ha]|0)+ca|0;a[ha]=ga;if((ca|0)==0){X=0;i=g;return X|0}fa=ea+24|0;n=c[(c[ea>>2]|0)+24>>2]|0;c[n+((e[ea+172+((ga&255)-ca<<1)>>1]|0)*12|0)+4>>2]=c[fa>>2];if((o|0)==0){X=0;i=g;return X|0}else{ia=o}while(1){c[n+((e[ea+172+((d[ha]|0)-ia<<1)>>1]|0)*12|0)+4>>2]=c[fa>>2];o=ia-1|0;if((o|0)==0){X=0;break}else{ia=o}}i=g;return X|0};case 265:{Fd(f);if((c[C>>2]|0)!=285){ia=c[f+52>>2]|0;fa=Ad(f,285)|0;ha=Vd(ia,2144,(J=i,i=i+8|0,c[J>>2]=fa,J)|0)|0;i=J;Cd(f,ha)}ha=c[f+24>>2]|0;Fd(f);J=f+48|0;fa=c[J>>2]|0;if((le(fa,ha,q,1)|0)==8){c[q+8>>2]=hc(fa,ha)|0}while(1){ha=c[C>>2]|0;if((ha|0)==58){W=93;break}else if((ha|0)!=46){ja=0;break}je(f,q)}if((W|0)==93){je(f,q);ja=1}fe(f,r,ja,B);sc(c[J>>2]|0,q,r);Ac(c[J>>2]|0,B);X=0;i=g;return X|0};case 258:{Fd(f);B=c[f+48>>2]|0;J=c[B+20>>2]|0;d:do{if((J|0)==0){ka=0;W=129}else{r=0;q=J;while(1){if((a[q+10|0]|0)!=0){la=r;ma=q;break d}ja=d[q+9|0]|r;C=c[q>>2]|0;if((C|0)==0){ka=ja;W=129;break}else{r=ja;q=C}}}}while(0);if((W|0)==129){Cd(f,2728);la=ka;ma=0}if((la|0)!=0){Zb(B,35,d[ma+8|0]|0,0,0)|0}ac(B,ma+4|0,_b(B)|0);X=1;i=g;return X|0};default:{B=c[f+48>>2]|0;ma=l+8|0;be(f,ma);if((c[ma>>2]|0)==13){ma=(c[(c[B>>2]|0)+12>>2]|0)+(c[l+16>>2]<<2)|0;c[ma>>2]=c[ma>>2]&-8372225|16384;X=0;i=g;return X|0}else{c[l>>2]=0;ce(f,l,1);X=0;i=g;return X|0}}}return 0}function $d(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;g=i;i=i+16|0;h=g|0;j=f+48|0;k=c[j>>2]|0;c[h+4>>2]=-1;a[h+10|0]=0;l=k+50|0;a[h+8|0]=a[l]|0;a[h+9|0]=0;m=k+20|0;c[h>>2]=c[m>>2];c[m>>2]=h;h=f+52|0;n=(c[h>>2]|0)+52|0;o=(b[n>>1]|0)+1&65535;b[n>>1]=o;if((o&65535)>>>0>200>>>0){Bd(f,2040,0)}o=f+16|0;a:do{switch(c[o>>2]|0){case 260:case 261:case 262:case 276:case 287:{break a;break};default:{}}n=_d(f)|0;if((c[o>>2]|0)==59){Fd(f)}p=c[j>>2]|0;c[p+36>>2]=d[p+50|0]|0;}while((n|0)==0);j=(c[h>>2]|0)+52|0;b[j>>1]=(b[j>>1]|0)-1;j=c[m>>2]|0;c[m>>2]=c[j>>2];m=j+8|0;h=a[m]|0;f=c[(c[k+12>>2]|0)+48>>2]|0;o=f+50|0;n=a[o]|0;if((n&255)>>>0>(h&255)>>>0){p=f+24|0;q=(c[f>>2]|0)+24|0;r=n;do{n=c[p>>2]|0;s=r-1&255;a[o]=s;c[(c[q>>2]|0)+((e[f+172+((s&255)<<1)>>1]|0)*12|0)+8>>2]=n;r=a[o]|0;}while((r&255)>>>0>(h&255)>>>0)}if((a[j+9|0]|0)==0){t=a[l]|0;u=t&255;v=k+36|0;c[v>>2]=u;w=j+4|0;x=c[w>>2]|0;ec(k,x);i=g;return}Zb(k,35,d[m]|0,0,0)|0;t=a[l]|0;u=t&255;v=k+36|0;c[v>>2]=u;w=j+4|0;x=c[w>>2]|0;ec(k,x);i=g;return}function ae(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;if((c[a+16>>2]|0)==(b|0)){Fd(a);i=f;return}g=(c[a+4>>2]|0)==(e|0);h=c[a+52>>2]|0;j=Ad(a,b)|0;if(g){g=Vd(h,2144,(k=i,i=i+8|0,c[k>>2]=j,k)|0)|0;i=k;Cd(a,g);i=f;return}else{g=Ad(a,d)|0;d=Vd(h,2216,(k=i,i=i+24|0,c[k>>2]=j,c[k+8>>2]=g,c[k+16>>2]=e,k)|0)|0;i=k;Cd(a,d);i=f;return}}function be(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;d=i;i=i+48|0;e=d|0;f=d+24|0;g=a+48|0;h=c[g>>2]|0;j=a+16|0;k=c[j>>2]|0;do{if((k|0)==40){l=c[a+4>>2]|0;Fd(a);de(a,b,0)|0;ae(a,41,40,l);mc(c[g>>2]|0,b)}else if((k|0)==285){l=c[a+24>>2]|0;Fd(a);m=c[g>>2]|0;if((le(m,l,b,1)|0)!=8){break}c[b+8>>2]=hc(m,l)|0}else{Cd(a,2920)}}while(0);k=a+24|0;l=f+16|0;m=f+20|0;n=f|0;o=f+8|0;p=a+52|0;a:while(1){switch(c[j>>2]|0){case 40:case 286:case 123:{nc(h,b);ke(a,b);continue a;break};case 91:{pc(h,b)|0;ie(a,e);vc(h,b,e);continue a;break};case 46:{je(a,b);continue a;break};case 58:{Fd(a);if((c[j>>2]|0)!=285){q=c[p>>2]|0;r=Ad(a,285)|0;s=Vd(q,2144,(q=i,i=i+8|0,c[q>>2]=r,q)|0)|0;i=q;Cd(a,s)}s=c[k>>2]|0;Fd(a);q=hc(c[g>>2]|0,s)|0;c[l>>2]=-1;c[m>>2]=-1;c[n>>2]=4;c[o>>2]=q;tc(h,b,f);ke(a,b);continue a;break};default:{break a}}}i=d;return}function ce(a,b,d){a=a|0;b=b|0;d=d|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;f=i;i=i+56|0;g=f|0;h=f+24|0;j=b+8|0;if(!(((c[j>>2]|0)-6|0)>>>0<4>>>0)){Cd(a,1320)}k=a+16|0;l=c[k>>2]|0;if((l|0)==61){m=22}else if((l|0)==44){Fd(a);c[h>>2]=b;l=h+8|0;be(a,l);do{if((c[l>>2]|0)==6){n=c[a+48>>2]|0;o=n+36|0;p=c[o>>2]|0;if((b|0)==0){break}q=h+16|0;r=b;s=0;while(1){do{if((c[r+8>>2]|0)==9){t=r+16|0;u=t;v=c[q>>2]|0;if((c[u>>2]|0)==(v|0)){c[u>>2]=p;w=1;x=c[q>>2]|0}else{w=s;x=v}v=t+4|0;if((c[v>>2]|0)!=(x|0)){y=w;break}c[v>>2]=p;y=1}else{y=s}}while(0);v=c[r>>2]|0;if((v|0)==0){break}else{r=v;s=y}}if((y|0)==0){break}Zb(n,0,c[o>>2]|0,c[q>>2]|0,0)|0;gc(n,1)}}while(0);y=200-(e[(c[a+52>>2]|0)+52>>1]|0)|0;w=a+48|0;if((y|0)<(d|0)){x=c[w>>2]|0;b=c[(c[x>>2]|0)+60>>2]|0;l=c[x+16>>2]|0;if((b|0)==0){s=Vd(l,3304,(z=i,i=i+16|0,c[z>>2]=y,c[z+8>>2]=2888,z)|0)|0;i=z;A=s}else{s=Vd(l,3176,(z=i,i=i+24|0,c[z>>2]=b,c[z+8>>2]=y,c[z+16>>2]=2888,z)|0)|0;i=z;A=s}Bd(c[x+12>>2]|0,A,0)}ce(a,h,d+1|0);B=w;C=g|0}else{w=c[a+52>>2]|0;h=Ad(a,61)|0;A=Vd(w,2144,(z=i,i=i+8|0,c[z>>2]=h,z)|0)|0;i=z;Cd(a,A);m=22}do{if((m|0)==22){Fd(a);de(a,g,0)|0;A=a+48|0;if((c[k>>2]|0)==44){z=1;while(1){Fd(a);nc(c[A>>2]|0,g);de(a,g,0)|0;h=z+1|0;if((c[k>>2]|0)==44){z=h}else{D=h;break}}}else{D=1}z=c[A>>2]|0;if((D|0)==(d|0)){lc(z,g);sc(c[A>>2]|0,j,g);i=f;return}n=d-D|0;q=g|0;o=c[q>>2]|0;do{if((o|0)==0){m=29}else if((o|0)==13|(o|0)==14){h=n+1|0;w=(h|0)<0?0:h;kc(z,g,w);if((w|0)<=1){break}gc(z,w-1|0)}else{nc(z,g);m=29}}while(0);do{if((m|0)==29){if((n|0)<=0){break}o=c[z+36>>2]|0;gc(z,n);Yb(z,o,n)}}while(0);if((D|0)<=(d|0)){B=A;C=q;break}z=(c[A>>2]|0)+36|0;c[z>>2]=n+(c[z>>2]|0);B=A;C=q}}while(0);d=c[B>>2]|0;B=(c[d+36>>2]|0)-1|0;c[g+16>>2]=-1;c[g+20>>2]=-1;c[C>>2]=12;c[g+8>>2]=B;sc(d,j,g);i=f;return}function de(e,f,g){e=e|0;f=f|0;g=g|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;j=i;i=i+24|0;k=j|0;l=e+52|0;m=(c[l>>2]|0)+52|0;n=(b[m>>1]|0)+1&65535;b[m>>1]=n;if((n&65535)>>>0>200>>>0){Bd(e,2040,0)}n=e+16|0;switch(c[n>>2]|0){case 265:{Fd(e);fe(e,f,0,c[e+4>>2]|0);break};case 269:{c[f+16>>2]=-1;c[f+20>>2]=-1;c[f>>2]=1;c[f+8>>2]=0;o=18;break};case 286:{m=hc(c[e+48>>2]|0,c[e+24>>2]|0)|0;c[f+16>>2]=-1;c[f+20>>2]=-1;c[f>>2]=4;c[f+8>>2]=m;o=18;break};case 123:{ee(e,f);break};case 263:{c[f+16>>2]=-1;c[f+20>>2]=-1;c[f>>2]=3;c[f+8>>2]=0;o=18;break};case 270:{p=1;o=6;break};case 45:{p=0;o=6;break};case 284:{c[f+16>>2]=-1;c[f+20>>2]=-1;c[f>>2]=5;c[f+8>>2]=0;h[f+8>>3]=+h[e+24>>3];o=18;break};case 35:{p=2;o=6;break};case 279:{m=c[e+48>>2]|0;q=m|0;r=c[q>>2]|0;s=a[r+74|0]|0;if(s<<24>>24==0){Cd(e,2272);t=c[q>>2]|0;u=t;v=a[t+74|0]|0}else{u=r;v=s}a[u+74|0]=v&-5;v=Zb(m,37,0,1,0)|0;c[f+16>>2]=-1;c[f+20>>2]=-1;c[f>>2]=14;c[f+8>>2]=v;o=18;break};case 275:{c[f+16>>2]=-1;c[f+20>>2]=-1;c[f>>2]=2;c[f+8>>2]=0;o=18;break};default:{be(e,f)}}if((o|0)==6){Fd(e);de(e,f,8)|0;wc(c[e+48>>2]|0,p,f)}else if((o|0)==18){Fd(e)}switch(c[n>>2]|0){case 278:{w=6;break};case 62:{w=11;break};case 45:{w=1;break};case 43:{w=0;break};case 257:{w=13;break};case 283:{w=7;break};case 60:{w=9;break};case 42:{w=2;break};case 282:{w=10;break};case 271:{w=14;break};case 281:{w=12;break};case 47:{w=3;break};case 94:{w=5;break};case 37:{w=4;break};case 280:{w=8;break};default:{x=15;y=c[l>>2]|0;z=y+52|0;A=b[z>>1]|0;B=A-1&65535;b[z>>1]=B;i=j;return x|0}}n=e+48|0;p=w;while(1){if(!((d[8+(p<<1)|0]|0)>>>0>g>>>0)){x=p;o=37;break}Fd(e);yc(c[n>>2]|0,p,f);w=de(e,k,d[9+(p<<1)|0]|0)|0;zc(c[n>>2]|0,p,f,k);if((w|0)==15){x=15;o=37;break}else{p=w}}if((o|0)==37){y=c[l>>2]|0;z=y+52|0;A=b[z>>1]|0;B=A-1&65535;b[z>>1]=B;i=j;return x|0}return 0}function ee(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;d=i;i=i+40|0;e=d|0;f=a+48|0;g=c[f>>2]|0;h=c[a+4>>2]|0;j=Zb(g,10,0,0,0)|0;k=e+36|0;c[k>>2]=0;l=e+28|0;c[l>>2]=0;m=e+32|0;c[m>>2]=0;n=e+24|0;c[n>>2]=b;c[b+16>>2]=-1;c[b+20>>2]=-1;c[b>>2]=11;c[b+8>>2]=j;o=e|0;c[e+16>>2]=-1;c[e+20>>2]=-1;p=e|0;c[p>>2]=0;c[e+8>>2]=0;nc(c[f>>2]|0,b);b=a+16|0;if((c[b>>2]|0)!=123){q=c[a+52>>2]|0;r=Ad(a,123)|0;s=Vd(q,2144,(t=i,i=i+8|0,c[t>>2]=r,t)|0)|0;i=t;Cd(a,s)}Fd(a);a:do{if((c[b>>2]|0)!=125){s=a+32|0;do{do{if((c[p>>2]|0)!=0){nc(g,o);c[p>>2]=0;if((c[k>>2]|0)!=50){break}Cc(g,c[(c[n>>2]|0)+8>>2]|0,c[m>>2]|0,50);c[k>>2]=0}}while(0);r=c[b>>2]|0;do{if((r|0)==285){Hd(a);if((c[s>>2]|0)==61){he(a,e);break}de(a,o,0)|0;q=c[m>>2]|0;if((q|0)>2147483645){u=c[f>>2]|0;v=c[(c[u>>2]|0)+60>>2]|0;w=c[u+16>>2]|0;if((v|0)==0){x=Vd(w,3304,(t=i,i=i+16|0,c[t>>2]=2147483645,c[t+8>>2]=744,t)|0)|0;i=t;y=x}else{x=Vd(w,3176,(t=i,i=i+24|0,c[t>>2]=v,c[t+8>>2]=2147483645,c[t+16>>2]=744,t)|0)|0;i=t;y=x}Bd(c[u+12>>2]|0,y,0);z=c[m>>2]|0}else{z=q}c[m>>2]=z+1;c[k>>2]=(c[k>>2]|0)+1}else if((r|0)==91){he(a,e)}else{de(a,o,0)|0;q=c[m>>2]|0;if((q|0)>2147483645){u=c[f>>2]|0;x=c[(c[u>>2]|0)+60>>2]|0;v=c[u+16>>2]|0;if((x|0)==0){w=Vd(v,3304,(t=i,i=i+16|0,c[t>>2]=2147483645,c[t+8>>2]=744,t)|0)|0;i=t;A=w}else{w=Vd(v,3176,(t=i,i=i+24|0,c[t>>2]=x,c[t+8>>2]=2147483645,c[t+16>>2]=744,t)|0)|0;i=t;A=w}Bd(c[u+12>>2]|0,A,0);B=c[m>>2]|0}else{B=q}c[m>>2]=B+1;c[k>>2]=(c[k>>2]|0)+1}}while(0);r=c[b>>2]|0;if((r|0)==59){Fd(a)}else if((r|0)==44){Fd(a)}else{break a}}while((c[b>>2]|0)!=125)}}while(0);ae(a,125,123,h);h=c[k>>2]|0;do{if((h|0)!=0){a=c[p>>2]|0;if((a|0)==0){C=h}else if((a|0)==13|(a|0)==14){kc(g,o,-1);Cc(g,c[(c[n>>2]|0)+8>>2]|0,c[m>>2]|0,-1);c[m>>2]=(c[m>>2]|0)-1;break}else{nc(g,o);C=c[k>>2]|0}Cc(g,c[(c[n>>2]|0)+8>>2]|0,c[m>>2]|0,C)}}while(0);C=g|0;g=c[(c[(c[C>>2]|0)+12>>2]|0)+(j<<2)>>2]&8388607;n=(Pd(c[m>>2]|0)|0)<<23|g;c[(c[(c[C>>2]|0)+12>>2]|0)+(j<<2)>>2]=n;g=(Pd(c[l>>2]|0)|0)<<14&8372224|n&-8372225;c[(c[(c[C>>2]|0)+12>>2]|0)+(j<<2)>>2]=g;i=d;return}function fe(f,g,h,j){f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;k=i;i=i+576|0;l=k|0;Yd(f,l);m=l|0;c[(c[m>>2]|0)+60>>2]=j;n=f+16|0;if((c[n>>2]|0)!=40){o=c[f+52>>2]|0;p=Ad(f,40)|0;q=Vd(o,2144,(r=i,i=i+8|0,c[r>>2]=p,r)|0)|0;i=r;Cd(f,q)}Fd(f);if((h|0)==0){s=f+48|0}else{ge(f,Dd(f,1896,4)|0,0);h=f+48|0;q=c[h>>2]|0;p=q+50|0;o=(a[p]|0)+1&255;a[p]=o;c[(c[(c[q>>2]|0)+24>>2]|0)+((e[q+172+((o&255)-1<<1)>>1]|0)*12|0)+4>>2]=c[q+24>>2];s=h}h=c[s>>2]|0;q=c[h>>2]|0;o=q+74|0;a[o]=0;p=c[n>>2]|0;a:do{if((p|0)==41){t=0}else{u=f+24|0;v=0;w=p;while(1){if((w|0)==279){break}else if((w|0)==285){x=c[u>>2]|0;Fd(f);ge(f,x,v);y=v+1|0}else{Cd(f,1120);y=v}if((a[o]|0)!=0){t=y;break a}if((c[n>>2]|0)!=44){t=y;break a}Fd(f);v=y;w=c[n>>2]|0}Fd(f);ge(f,Dd(f,1272,3)|0,v);a[o]=7;t=v+1|0}}while(0);y=c[s>>2]|0;p=y+50|0;w=(d[p]|0)+t|0;a[p]=w;do{if((t|0)!=0){u=y+24|0;x=c[(c[y>>2]|0)+24>>2]|0;c[x+((e[y+172+((w&255)-t<<1)>>1]|0)*12|0)+4>>2]=c[u>>2];z=t-1|0;if((z|0)==0){break}else{A=z}do{c[x+((e[y+172+((d[p]|0)-A<<1)>>1]|0)*12|0)+4>>2]=c[u>>2];A=A-1|0;}while((A|0)!=0)}}while(0);A=h+50|0;a[q+73|0]=(a[A]|0)-(a[o]&1);gc(h,d[A]|0);A=f+52|0;if((c[n>>2]|0)!=41){h=c[A>>2]|0;o=Ad(f,41)|0;q=Vd(h,2144,(r=i,i=i+8|0,c[r>>2]=o,r)|0)|0;i=r;Cd(f,q)}Fd(f);q=(c[A>>2]|0)+52|0;r=(b[q>>1]|0)+1&65535;b[q>>1]=r;if((r&65535)>>>0>200>>>0){Bd(f,2040,0)}b:do{switch(c[n>>2]|0){case 260:case 261:case 262:case 276:case 287:{break b;break};default:{}}r=_d(f)|0;if((c[n>>2]|0)==59){Fd(f)}q=c[s>>2]|0;c[q+36>>2]=d[q+50|0]|0;}while((r|0)==0);n=(c[A>>2]|0)+52|0;b[n>>1]=(b[n>>1]|0)-1;c[(c[m>>2]|0)+64>>2]=c[f+4>>2];ae(f,262,265,j);Zd(f);f=c[s>>2]|0;s=c[f>>2]|0;j=s+52|0;n=c[j>>2]|0;r=f+44|0;if((c[r>>2]|0)<(n|0)){B=n;C=s+16|0}else{q=s+16|0;c[q>>2]=Md(c[A>>2]|0,c[q>>2]|0,j,4,262143,1488)|0;B=c[j>>2]|0;C=q}if((n|0)<(B|0)){q=n;while(1){n=q+1|0;c[(c[C>>2]|0)+(q<<2)>>2]=0;if((n|0)<(B|0)){q=n}else{break}}}q=c[m>>2]|0;B=c[r>>2]|0;n=B+1|0;c[r>>2]=n;c[(c[C>>2]|0)+(B<<2)>>2]=q;q=c[m>>2]|0;B=q;do{if((a[q+5|0]&3)==0){D=n}else{if((a[s+5|0]&4)==0){D=n;break}sd(c[A>>2]|0,s,B);D=c[r>>2]|0}}while(0);r=$b(f,36,0,D-1|0)|0;c[g+16>>2]=-1;c[g+20>>2]=-1;c[g>>2]=11;c[g+8>>2]=r;if((a[(c[m>>2]|0)+72|0]|0)==0){E=572;F=0;i=k;return}else{G=0}do{Zb(f,(a[l+51+(G<<1)|0]|0)==6?0:4,0,d[l+51+(G<<1)+1|0]|0,0)|0;G=G+1|0;}while((G|0)<(d[(c[m>>2]|0)+72|0]|0));E=572;F=0;i=k;return}function ge(e,f,g){e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;h=i;j=e+48|0;k=c[j>>2]|0;l=k+50|0;if(((d[l]|0)+g|0)>199){m=c[(c[k>>2]|0)+60>>2]|0;n=c[k+16>>2]|0;if((m|0)==0){o=Vd(n,3304,(p=i,i=i+16|0,c[p>>2]=200,c[p+8>>2]=968,p)|0)|0;i=p;q=o}else{o=Vd(n,3176,(p=i,i=i+24|0,c[p>>2]=m,c[p+8>>2]=200,c[p+16>>2]=968,p)|0)|0;i=p;q=o}Bd(c[k+12>>2]|0,q,0);r=c[j>>2]|0}else{r=k}j=c[r>>2]|0;q=j+56|0;o=c[q>>2]|0;p=r+48|0;if((b[p>>1]|0)<(o|0)){s=o;t=j+24|0}else{r=j+24|0;c[r>>2]=Md(c[e+52>>2]|0,c[r>>2]|0,q,12,32767,840)|0;s=c[q>>2]|0;t=r}if((o|0)<(s|0)){r=o;while(1){o=r+1|0;c[(c[t>>2]|0)+(r*12|0)>>2]=0;if((o|0)<(s|0)){r=o}else{break}}}r=b[p>>1]|0;c[(c[t>>2]|0)+((r<<16>>16)*12|0)>>2]=f;if((a[f+5|0]&3)==0){u=r;v=u+1&65535;b[p>>1]=v;w=a[l]|0;x=w&255;y=x+g|0;z=k+172+(y<<1)|0;b[z>>1]=u;i=h;return}if((a[j+5|0]&4)==0){u=r;v=u+1&65535;b[p>>1]=v;w=a[l]|0;x=w&255;y=x+g|0;z=k+172+(y<<1)|0;b[z>>1]=u;i=h;return}sd(c[e+52>>2]|0,j,f);u=b[p>>1]|0;v=u+1&65535;b[p>>1]=v;w=a[l]|0;x=w&255;y=x+g|0;z=k+172+(y<<1)|0;b[z>>1]=u;i=h;return}



function he(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;d=i;i=i+48|0;e=d|0;f=d+24|0;g=a+48|0;h=c[g>>2]|0;j=h+36|0;k=c[j>>2]|0;l=a+16|0;if((c[l>>2]|0)==285){m=b+28|0;do{if((c[m>>2]|0)>2147483645){n=c[(c[h>>2]|0)+60>>2]|0;o=c[h+16>>2]|0;if((n|0)==0){p=Vd(o,3304,(q=i,i=i+16|0,c[q>>2]=2147483645,c[q+8>>2]=744,q)|0)|0;i=q;r=p}else{p=Vd(o,3176,(q=i,i=i+24|0,c[q>>2]=n,c[q+8>>2]=2147483645,c[q+16>>2]=744,q)|0)|0;i=q;r=p}Bd(c[h+12>>2]|0,r,0);if((c[l>>2]|0)==285){break}p=c[a+52>>2]|0;n=Ad(a,285)|0;o=Vd(p,2144,(q=i,i=i+8|0,c[q>>2]=n,q)|0)|0;i=q;Cd(a,o)}}while(0);r=c[a+24>>2]|0;Fd(a);o=hc(c[g>>2]|0,r)|0;c[e+16>>2]=-1;c[e+20>>2]=-1;c[e>>2]=4;c[e+8>>2]=o;s=m}else{ie(a,e);s=b+28|0}c[s>>2]=(c[s>>2]|0)+1;if((c[l>>2]|0)==61){Fd(a);t=rc(h,e)|0;u=de(a,f,0)|0;v=b+24|0;w=c[v>>2]|0;x=w+8|0;y=x;z=c[y>>2]|0;A=rc(h,f)|0;B=Zb(h,9,z,t,A)|0;c[j>>2]=k;i=d;return}l=c[a+52>>2]|0;s=Ad(a,61)|0;m=Vd(l,2144,(q=i,i=i+8|0,c[q>>2]=s,q)|0)|0;i=q;Cd(a,m);Fd(a);t=rc(h,e)|0;u=de(a,f,0)|0;v=b+24|0;w=c[v>>2]|0;x=w+8|0;y=x;z=c[y>>2]|0;A=rc(h,f)|0;B=Zb(h,9,z,t,A)|0;c[j>>2]=k;i=d;return}function ie(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=i;Fd(a);de(a,b,0)|0;qc(c[a+48>>2]|0,b);if((c[a+16>>2]|0)==93){Fd(a);i=d;return}b=c[a+52>>2]|0;e=Ad(a,93)|0;f=Vd(b,2144,(b=i,i=i+8|0,c[b>>2]=e,b)|0)|0;i=b;Cd(a,f);Fd(a);i=d;return}function je(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0;d=i;i=i+24|0;e=d|0;f=a+48|0;g=c[f>>2]|0;pc(g,b)|0;Fd(a);if((c[a+16>>2]|0)!=285){h=c[a+52>>2]|0;j=Ad(a,285)|0;k=Vd(h,2144,(h=i,i=i+8|0,c[h>>2]=j,h)|0)|0;i=h;Cd(a,k)}k=c[a+24>>2]|0;Fd(a);a=hc(c[f>>2]|0,k)|0;c[e+16>>2]=-1;c[e+20>>2]=-1;c[e>>2]=4;c[e+8>>2]=a;vc(g,b,e);i=d;return}function ke(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;d=i;i=i+24|0;e=d|0;f=a+48|0;g=c[f>>2]|0;h=c[a+4>>2]|0;j=a+16|0;k=c[j>>2]|0;if((k|0)==286){l=hc(g,c[a+24>>2]|0)|0;c[e+16>>2]=-1;c[e+20>>2]=-1;c[e>>2]=4;c[e+8>>2]=l;Fd(a)}else if((k|0)==40){if((h|0)!=(c[a+8>>2]|0)){Cd(a,3064)}Fd(a);if((c[j>>2]|0)==41){c[e>>2]=0}else{de(a,e,0)|0;if((c[j>>2]|0)==44){do{Fd(a);nc(c[f>>2]|0,e);de(a,e,0)|0;}while((c[j>>2]|0)==44)}kc(g,e,-1)}ae(a,41,40,h)}else if((k|0)==123){ee(a,e)}else{Cd(a,2968);i=d;return}a=b+8|0;k=c[a>>2]|0;j=c[e>>2]|0;if((j|0)==13|(j|0)==14){m=0}else if((j|0)==0){n=15}else{nc(g,e);n=15}if((n|0)==15){m=(c[g+36>>2]|0)-k|0}n=Zb(g,28,k,m,2)|0;c[b+16>>2]=-1;c[b+20>>2]=-1;c[b>>2]=13;c[a>>2]=n;Ac(g,h);c[g+36>>2]=k+1;i=d;return}function le(b,f,g,h){b=b|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;j=i;if((b|0)==0){c[g+16>>2]=-1;c[g+20>>2]=-1;c[g>>2]=8;c[g+8>>2]=255;k=8;i=j;return k|0}l=b|0;m=d[b+50|0]|0;while(1){n=m-1|0;if((m|0)<=0){break}if((c[(c[(c[l>>2]|0)+24>>2]|0)+((e[b+172+(n<<1)>>1]|0)*12|0)>>2]|0)==(f|0)){o=6;break}else{m=n}}if((o|0)==6){c[g+16>>2]=-1;c[g+20>>2]=-1;c[g>>2]=6;c[g+8>>2]=n;if((h|0)!=0){k=6;i=j;return k|0}h=c[b+20>>2]|0;if((h|0)==0){k=6;i=j;return k|0}else{p=h}while(1){if((d[p+8|0]|0|0)<=(n|0)){break}h=c[p>>2]|0;if((h|0)==0){k=6;o=32;break}else{p=h}}if((o|0)==32){i=j;return k|0}a[p+9|0]=1;k=6;i=j;return k|0}if((le(c[b+8>>2]|0,f,g,0)|0)==8){k=8;i=j;return k|0}p=c[l>>2]|0;l=p+36|0;n=c[l>>2]|0;h=p+72|0;m=a[h]|0;q=m&255;a:do{if(m<<24>>24==0){r=0;o=17}else{s=c[g>>2]|0;t=g+8|0;u=0;while(1){if((d[b+51+(u<<1)|0]|0|0)==(s|0)){if((d[b+51+(u<<1)+1|0]|0|0)==(c[t>>2]|0)){v=u;break a}}w=u+1|0;if((w|0)<(q|0)){u=w}else{r=m;o=17;break}}}}while(0);if((o|0)==17){if((q+1|0)>>>0>60>>>0){q=c[p+60>>2]|0;o=c[b+16>>2]|0;if((q|0)==0){m=Vd(o,3304,(x=i,i=i+16|0,c[x>>2]=60,c[x+8>>2]=2864,x)|0)|0;i=x;y=m}else{m=Vd(o,3176,(x=i,i=i+24|0,c[x>>2]=q,c[x+8>>2]=60,c[x+16>>2]=2864,x)|0)|0;i=x;y=m}Bd(c[b+12>>2]|0,y,0);z=a[h]|0;A=c[l>>2]|0}else{z=r;A=n}if((z&255|0)<(A|0)){B=A;C=p+28|0}else{A=p+28|0;c[A>>2]=Md(c[b+16>>2]|0,c[A>>2]|0,l,4,2147483645,3400)|0;B=c[l>>2]|0;C=A}if((n|0)<(B|0)){A=n;while(1){n=A+1|0;c[(c[C>>2]|0)+(A<<2)>>2]=0;if((n|0)<(B|0)){A=n}else{break}}}c[(c[C>>2]|0)+((d[h]|0)<<2)>>2]=f;C=f;do{if(!((a[f+5|0]&3)==0)){if((a[p+5|0]&4)==0){break}sd(c[b+16>>2]|0,p,C)}}while(0);a[b+51+((d[h]|0)<<1)|0]=c[g>>2];a[b+51+((d[h]|0)<<1)+1|0]=c[g+8>>2];b=a[h]|0;a[h]=b+1;v=b&255}c[g+8>>2]=v;c[g>>2]=7;k=7;i=j;return k|0}function me(b,f,g,h,j){b=b|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;k=i;i=i+16|0;l=k|0;m=b+48|0;n=c[m>>2]|0;o=n+50|0;p=(a[o]|0)+3&255;a[o]=p;q=n+24|0;r=c[(c[n>>2]|0)+24>>2]|0;c[r+((e[n+172+((p&255)-3<<1)>>1]|0)*12|0)+4>>2]=c[q>>2];c[r+((e[n+172+((d[o]|0)-2<<1)>>1]|0)*12|0)+4>>2]=c[q>>2];c[r+((e[n+172+((d[o]|0)-1<<1)>>1]|0)*12|0)+4>>2]=c[q>>2];if((c[b+16>>2]|0)!=259){q=c[b+52>>2]|0;r=Ad(b,259)|0;p=Vd(q,2144,(q=i,i=i+8|0,c[q>>2]=r,q)|0)|0;i=q;Cd(b,p)}Fd(b);p=(j|0)!=0;if(p){s=$b(n,32,f,131070)|0}else{s=_b(n)|0}c[l+4>>2]=-1;a[l+10|0]=0;a[l+8|0]=a[o]|0;a[l+9|0]=0;j=n+20|0;c[l>>2]=c[j>>2];c[j>>2]=l;l=c[m>>2]|0;m=l+50|0;q=(d[m]|0)+h|0;a[m]=q;do{if((h|0)!=0){r=l+24|0;t=c[(c[l>>2]|0)+24>>2]|0;c[t+((e[l+172+((q&255)-h<<1)>>1]|0)*12|0)+4>>2]=c[r>>2];u=h-1|0;if((u|0)==0){break}else{v=u}do{c[t+((e[l+172+((d[m]|0)-v<<1)>>1]|0)*12|0)+4>>2]=c[r>>2];v=v-1|0;}while((v|0)!=0)}}while(0);gc(n,h);$d(b);b=c[j>>2]|0;c[j>>2]=c[b>>2];j=b+8|0;v=a[j]|0;m=c[(c[n+12>>2]|0)+48>>2]|0;l=m+50|0;q=a[l]|0;if((q&255)>>>0>(v&255)>>>0){r=m+24|0;t=(c[m>>2]|0)+24|0;u=q;do{q=c[r>>2]|0;w=u-1&255;a[l]=w;c[(c[t>>2]|0)+((e[m+172+((w&255)<<1)>>1]|0)*12|0)+8>>2]=q;u=a[l]|0;}while((u&255)>>>0>(v&255)>>>0)}if((a[b+9|0]|0)!=0){Zb(n,35,d[j]|0,0,0)|0}c[n+36>>2]=d[o]|0;ec(n,c[b+4>>2]|0);ec(n,s);if(p){p=$b(n,31,f,131070)|0;Ac(n,g);x=p;y=s+1|0;dc(n,x,y);i=k;return}else{Zb(n,33,f,0,h)|0;Ac(n,g);x=_b(n)|0;y=s+1|0;dc(n,x,y);i=k;return}}function ne(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;b=i;i=i+24|0;d=b|0;Fd(a);de(a,d,0)|0;e=d|0;if((c[e>>2]|0)==1){c[e>>2]=3}uc(c[a+48>>2]|0,d);e=c[d+20>>2]|0;if((c[a+16>>2]|0)==274){Fd(a);$d(a);i=b;return e|0}d=c[a+52>>2]|0;f=Ad(a,274)|0;g=Vd(d,2144,(d=i,i=i+8|0,c[d>>2]=f,d)|0)|0;i=d;Cd(a,g);Fd(a);$d(a);i=b;return e|0}function oe(a,b){a=a|0;b=b|0;var d=0;d=b+32|0;gd(b,c[d>>2]|0);Nd(a,c[b+40>>2]|0,(c[b+48>>2]|0)*24|0,0)|0;Nd(a,c[d>>2]|0,c[b+44>>2]<<4,0)|0;Nd(a,b,120,0)|0;return}function pe(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;e=ib[b&15](d,0,0,376)|0;if((e|0)==0){f=0;return f|0}g=e;h=e+120|0;c[e>>2]=0;a[e+4|0]=8;a[e+140|0]=33;a[e+5|0]=97;i=e+16|0;c[i>>2]=h;j=e+32|0;c[j>>2]=0;k=e+44|0;c[k>>2]=0;c[e+112>>2]=0;c[e+68>>2]=0;a[e+56|0]=0;c[e+60>>2]=0;a[e+57|0]=1;c[e+64>>2]=0;c[e+104>>2]=0;l=e+48|0;a[e+6|0]=0;c[e+20>>2]=0;m=e+40|0;c[m>>2]=0;c[e+24>>2]=0;c[e+116>>2]=0;c[e+80>>2]=0;n=l;c[n>>2]=0;c[n+4>>2]=0;c[e+132>>2]=b;c[e+136>>2]=d;c[e+232>>2]=g;d=e+240|0;c[e+256>>2]=d;c[e+260>>2]=d;c[e+184>>2]=0;c[e+128>>2]=0;c[e+124>>2]=0;c[h>>2]=0;c[e+224>>2]=0;c[e+172>>2]=0;c[e+176>>2]=0;c[e+180>>2]=0;c[e+208>>2]=0;a[e+141|0]=0;h=e+148|0;c[h>>2]=e;c[e+144>>2]=0;c[e+152>>2]=h;uf(e+156|0,0,16)|0;c[e+188>>2]=376;c[e+200>>2]=200;c[e+204>>2]=200;c[e+196>>2]=0;uf(e+272|0,0,36)|0;if((Pc(g,4,0)|0)==0){f=g;return f|0}h=c[i>>2]|0;gd(g,c[j>>2]|0);nd(g);d=c[i>>2]|0;Nd(g,c[d>>2]|0,c[d+8>>2]<<2,0)|0;d=h+52|0;i=h+60|0;c[d>>2]=Nd(g,c[d>>2]|0,c[i>>2]|0,0)|0;c[i>>2]=0;Nd(g,c[m>>2]|0,(c[l>>2]|0)*24|0,0)|0;Nd(g,c[j>>2]|0,c[k>>2]<<4,0)|0;ib[c[h+12>>2]&15](c[h+16>>2]|0,e,376,0)|0;f=0;return f|0}function qe(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;d=b+16|0;e=c[d>>2]|0;f=Nd(b,0,0,192)|0;g=f;c[b+40>>2]=g;h=b+20|0;c[h>>2]=g;c[b+48>>2]=8;c[b+36>>2]=f+168;f=Nd(b,0,0,720)|0;g=f;c[b+32>>2]=g;c[b+44>>2]=45;i=b+8|0;c[i>>2]=g;c[b+28>>2]=f+624;c[(c[h>>2]|0)+4>>2]=g;g=c[i>>2]|0;f=g+16|0;c[i>>2]=f;c[g+8>>2]=0;c[c[h>>2]>>2]=f;c[b+12>>2]=f;c[(c[h>>2]|0)+8>>2]=(c[i>>2]|0)+320;c[b+72>>2]=ve(b,0,2)|0;c[b+80>>2]=5;i=c[d>>2]|0;c[i+96>>2]=ve(b,0,2)|0;c[i+104>>2]=5;re(b,32);Fe(b);zd(b);i=(se(b,1280,17)|0)+5|0;a[i]=a[i]|32;c[e+64>>2]=c[e+68>>2]<<2;return}function re(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=b+16|0;if((a[(c[e>>2]|0)+21|0]|0)==2){return}if((d+1|0)>>>0<1073741824>>>0){f=Nd(b,0,0,d<<2)|0}else{f=Od(b)|0}g=f;h=c[e>>2]|0;if((d|0)>0){uf(f|0,0,d<<2|0)|0}f=h+8|0;e=c[f>>2]|0;i=h|0;h=c[i>>2]|0;if((e|0)>0){j=d-1|0;k=0;l=h;while(1){m=c[l+(k<<2)>>2]|0;if((m|0)==0){n=l}else{o=m;while(1){m=o|0;p=c[m>>2]|0;q=g+((c[o+8>>2]&j)<<2)|0;c[m>>2]=c[q>>2];c[q>>2]=o;if((p|0)==0){break}else{o=p}}n=c[i>>2]|0}o=k+1|0;if((o|0)<(e|0)){k=o;l=n}else{r=n;break}}}else{r=h}Nd(b,r,e<<2,0)|0;c[f>>2]=d;c[i>>2]=g;return}function se(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;g=(f>>>5)+1|0;if(g>>>0>f>>>0){h=f}else{i=f;j=f;while(1){k=(i<<5)+(i>>>2)+(d[e+(j-1)|0]|0)^i;l=j-g|0;if(l>>>0<g>>>0){h=k;break}else{i=k;j=l}}}j=b+16|0;i=c[j>>2]|0;g=c[(c[i>>2]|0)+(((c[i+8>>2]|0)-1&h)<<2)>>2]|0;a:do{if((g|0)!=0){l=g;while(1){if((c[l+12>>2]|0)==(f|0)){m=l;if((of(e,l+16|0,f)|0)==0){break}}k=c[l>>2]|0;if((k|0)==0){break a}else{l=k}}k=l+5|0;n=a[k]|0;if((n&3&((d[i+20|0]|0)^3)|0)==0){o=m;return o|0}a[k]=n^3;o=m;return o|0}}while(0);if((f+1|0)>>>0>4294967277>>>0){Od(b)|0}m=Nd(b,0,0,f+17|0)|0;i=m;c[m+12>>2]=f;c[m+8>>2]=h;a[m+5|0]=a[(c[j>>2]|0)+20|0]&3;a[m+4|0]=4;a[m+6|0]=0;rf(m+16|0,e|0,f)|0;a[m+(f+16)|0]=0;f=c[j>>2]|0;j=c[f+8>>2]|0;e=j-1&h;h=f|0;c[m>>2]=c[(c[h>>2]|0)+(e<<2)>>2];c[(c[h>>2]|0)+(e<<2)>>2]=m;m=f+4|0;f=(c[m>>2]|0)+1|0;c[m>>2]=f;if(!(f>>>0>j>>>0&(j|0)<1073741823)){o=i;return o|0}re(b,j<<1);o=i;return o|0}function te(a,b,e){a=a|0;b=b|0;e=e|0;var f=0;if((c[b+16>>2]|0)==600){f=0}else{f=1<<(d[b+7|0]|0)}ue(a,b,e,f);return}function ue(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0.0,B=0,C=0,E=0.0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;j=i;i=i+16|0;l=j|0;m=e+28|0;n=c[m>>2]|0;o=e+7|0;p=d[o]|0;q=e+16|0;r=c[q>>2]|0;if((n|0)<(f|0)){if((f+1|0)>>>0<268435456>>>0){s=e+12|0;t=Nd(b,c[s>>2]|0,n<<4,f<<4)|0;u=s}else{t=Od(b)|0;u=e+12|0}s=t;c[u>>2]=s;u=c[m>>2]|0;if((u|0)<(f|0)){t=u;do{c[s+(t<<4)+8>>2]=0;t=t+1|0;}while((t|0)<(f|0))}c[m>>2]=f}we(b,e,g);if((n|0)>(f|0)){c[m>>2]=f;g=e+12|0;t=l|0;s=l+8|0;u=f;while(1){v=c[g>>2]|0;w=v+(u<<4)+8|0;x=u+1|0;if((c[w>>2]|0)!=0){a:do{if(u>>>0<(c[m>>2]|0)>>>0){y=v+(u<<4)|0;z=20}else{A=+(x|0);if((x|0)==0){B=c[q>>2]|0}else{h[k>>3]=A;B=(c[q>>2]|0)+(((((c[k+4>>2]|0)+(c[k>>2]|0)|0)>>>0)%(((1<<(d[o]|0))-1|1)>>>0)|0)<<5)|0}while(1){if((c[B+24>>2]|0)==3){if(+h[B+16>>3]==A){break}}C=c[B+28>>2]|0;if((C|0)==0){E=A;z=22;break a}else{B=C}}y=B|0;z=20}}while(0);do{if((z|0)==20){z=0;if((y|0)!=328){F=y;break}E=+(x|0);z=22}}while(0);if((z|0)==22){z=0;h[t>>3]=E;c[s>>2]=3;F=Be(b,e,l)|0}C=v+(u<<4)|0;G=F;H=c[C+4>>2]|0;c[G>>2]=c[C>>2];c[G+4>>2]=H;c[F+8>>2]=c[w>>2]}if((x|0)<(n|0)){u=x}else{break}}if((f+1|0)>>>0<268435456>>>0){u=e+12|0;I=Nd(b,c[u>>2]|0,n<<4,f<<4)|0;J=u}else{I=Od(b)|0;J=e+12|0}c[J>>2]=I}I=1<<p;if((I|0)>0){p=e+6|0;J=I;do{J=J-1|0;u=r+(J<<5)+8|0;if((c[u>>2]|0)!=0){f=r+(J<<5)|0;n=r+(J<<5)+16|0;F=n;l=ze(e,F)|0;a[p]=0;if((l|0)==328){s=c[r+(J<<5)+24>>2]|0;do{if((s|0)==0){Jc(b,1216,(K=i,i=i+1|0,i=i+7&-8,c[K>>2]=0,K)|0);i=K}else if((s|0)==3){E=+h[n>>3];if(!(E!=E)&!(D=0.0,D!=D)){break}Jc(b,2832,(K=i,i=i+1|0,i=i+7&-8,c[K>>2]=0,K)|0);i=K}}while(0);L=Be(b,e,F)|0}else{L=l}n=f;s=L;x=c[n+4>>2]|0;c[s>>2]=c[n>>2];c[s+4>>2]=x;c[L+8>>2]=c[u>>2]}}while((J|0)>0)}if((r|0)==600){i=j;return}Nd(b,r,I<<5,0)|0;i=j;return}function ve(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=Nd(b,0,0,32)|0;g=f;vd(b,f,5);c[f+8>>2]=0;a[f+6|0]=-1;h=f+12|0;c[h>>2]=0;i=f+28|0;c[i>>2]=0;a[f+7|0]=0;c[f+16>>2]=600;if((d+1|0)>>>0<268435456>>>0){j=Nd(b,0,0,d<<4)|0}else{j=Od(b)|0}f=j;c[h>>2]=f;h=c[i>>2]|0;if((h|0)<(d|0)){k=h}else{c[i>>2]=d;we(b,g,e);return g|0}do{c[f+(k<<4)+8>>2]=0;k=k+1|0;}while((k|0)<(d|0));c[i>>2]=d;we(b,g,e);return g|0}function we(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;f=i;do{if((e|0)==0){c[d+16>>2]=600;g=0;h=0;j=600}else{k=Rd(e-1|0)|0;l=k+1|0;if((k|0)>25){Jc(b,2184,(k=i,i=i+1|0,i=i+7&-8,c[k>>2]=0,k)|0);i=k}k=1<<l;if((k+1|0)>>>0<134217728>>>0){m=Nd(b,0,0,k<<5)|0}else{m=Od(b)|0}n=m;o=d+16|0;c[o>>2]=n;p=l&255;if((k|0)>0){q=0;r=n}else{g=k;h=p;j=n;break}while(1){c[r+(q<<5)+28>>2]=0;c[r+(q<<5)+24>>2]=0;c[r+(q<<5)+8>>2]=0;n=q+1|0;l=c[o>>2]|0;if((n|0)<(k|0)){q=n;r=l}else{g=k;h=p;j=l;break}}}}while(0);a[d+7|0]=h;c[d+20>>2]=j+(g<<5);i=f;return}function xe(a,b){a=a|0;b=b|0;var e=0;e=c[b+16>>2]|0;if((e|0)!=600){Nd(a,e,32<<(d[b+7|0]|0),0)|0}Nd(a,c[b+12>>2]|0,c[b+28>>2]<<4,0)|0;Nd(a,b,32,0)|0;return}function ye(a,b){a=a|0;b=b|0;var e=0,f=0,g=0;e=(c[a+16>>2]|0)+(((1<<(d[a+7|0]|0))-1&c[b+8>>2])<<5)|0;while(1){if((c[e+24>>2]|0)==4){if((c[e+16>>2]|0)==(b|0)){break}}a=c[e+28>>2]|0;if((a|0)==0){f=328;g=6;break}else{e=a}}if((g|0)==6){return f|0}f=e|0;return f|0}function ze(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,i=0,j=0,l=0.0,m=0.0,n=0,o=0;a:do{switch(c[b+8>>2]|0){case 4:{e=c[b>>2]|0;f=(c[a+16>>2]|0)+(((1<<(d[a+7|0]|0))-1&c[e+8>>2])<<5)|0;while(1){if((c[f+24>>2]|0)==4){if((c[f+16>>2]|0)==(e|0)){break}}g=c[f+28>>2]|0;if((g|0)==0){i=328;j=26;break}else{f=g}}if((j|0)==26){return i|0}i=f|0;return i|0};case 3:{l=+h[b>>3];e=~~l;m=+(e|0);if(!(m==l)){g=b|0;if(+h[g>>3]==0.0){n=c[a+16>>2]|0;break a}else{n=(c[a+16>>2]|0)+(((((c[g+4>>2]|0)+(c[g>>2]|0)|0)>>>0)%(((1<<(d[a+7|0]|0))-1|1)>>>0)|0)<<5)|0;break a}}g=e-1|0;if(g>>>0<(c[a+28>>2]|0)>>>0){i=(c[a+12>>2]|0)+(g<<4)|0;return i|0}if((e|0)==0){o=c[a+16>>2]|0}else{h[k>>3]=m;o=(c[a+16>>2]|0)+(((((c[k+4>>2]|0)+(c[k>>2]|0)|0)>>>0)%(((1<<(d[a+7|0]|0))-1|1)>>>0)|0)<<5)|0}while(1){if((c[o+24>>2]|0)==3){if(+h[o+16>>3]==m){break}}e=c[o+28>>2]|0;if((e|0)==0){i=328;j=26;break}else{o=e}}if((j|0)==26){return i|0}i=o|0;return i|0};case 1:{n=(c[a+16>>2]|0)+(((1<<(d[a+7|0]|0))-1&c[b>>2])<<5)|0;break};case 2:{n=(c[a+16>>2]|0)+((((c[b>>2]|0)>>>0)%(((1<<(d[a+7|0]|0))-1|1)>>>0)|0)<<5)|0;break};case 0:{i=328;return i|0};default:{n=(c[a+16>>2]|0)+((((c[b>>2]|0)>>>0)%(((1<<(d[a+7|0]|0))-1|1)>>>0)|0)<<5)|0}}}while(0);while(1){if((Sd(n+16|0,b)|0)!=0){break}a=c[n+28>>2]|0;if((a|0)==0){i=328;j=26;break}else{n=a}}if((j|0)==26){return i|0}i=n|0;return i|0}function Ae(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0,l=0.0;f=i;g=ze(d,e)|0;a[d+6|0]=0;if((g|0)!=328){j=g;i=f;return j|0}g=c[e+8>>2]|0;do{if((g|0)==0){Jc(b,1216,(k=i,i=i+1|0,i=i+7&-8,c[k>>2]=0,k)|0);i=k}else if((g|0)==3){l=+h[e>>3];if(!(l!=l)&!(D=0.0,D!=D)){break}Jc(b,2832,(k=i,i=i+1|0,i=i+7&-8,c[k>>2]=0,k)|0);i=k}}while(0);j=Be(b,d,e)|0;i=f;return j|0}function Be(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0.0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;g=i;i=i+112|0;j=g|0;k=j;l=f+8|0;m=c[l>>2]|0;do{if((m|0)==3){n=f|0;if(+h[n>>3]==0.0){o=c[e+16>>2]|0;p=o;q=o;break}else{o=c[e+16>>2]|0;p=o+(((((c[n+4>>2]|0)+(c[n>>2]|0)|0)>>>0)%(((1<<(d[e+7|0]|0))-1|1)>>>0)|0)<<5)|0;q=o;break}}else if((m|0)==4){o=c[e+16>>2]|0;p=o+(((1<<(d[e+7|0]|0))-1&c[(c[f>>2]|0)+8>>2])<<5)|0;q=o}else if((m|0)==2){o=c[e+16>>2]|0;p=o+((((c[f>>2]|0)>>>0)%(((1<<(d[e+7|0]|0))-1|1)>>>0)|0)<<5)|0;q=o}else if((m|0)==1){o=c[e+16>>2]|0;p=o+(((1<<(d[e+7|0]|0))-1&c[f>>2])<<5)|0;q=o}else{o=c[e+16>>2]|0;p=o+((((c[f>>2]|0)>>>0)%(((1<<(d[e+7|0]|0))-1|1)>>>0)|0)<<5)|0;q=o}}while(0);m=p+8|0;do{if((c[m>>2]|0)!=0|(p|0)==600){o=e+20|0;n=e+16|0;r=c[o>>2]|0;while(1){s=r-32|0;if(!(r>>>0>q>>>0)){break}if((c[r-32+24>>2]|0)==0){t=43;break}else{r=s}}if((t|0)==43){c[o>>2]=s;u=p+16|0;v=c[p+24>>2]|0;do{if((v|0)==3){w=u|0;if(+h[w>>3]==0.0){x=q;break}x=q+(((((c[w+4>>2]|0)+(c[w>>2]|0)|0)>>>0)%(((1<<(d[e+7|0]|0))-1|1)>>>0)|0)<<5)|0}else if((v|0)==4){x=q+(((1<<(d[e+7|0]|0))-1&c[(c[u>>2]|0)+8>>2])<<5)|0}else if((v|0)==1){x=q+(((1<<(d[e+7|0]|0))-1&c[u>>2])<<5)|0}else if((v|0)==2){x=q+((((c[u>>2]|0)>>>0)%(((1<<(d[e+7|0]|0))-1|1)>>>0)|0)<<5)|0}else{x=q+((((c[u>>2]|0)>>>0)%(((1<<(d[e+7|0]|0))-1|1)>>>0)|0)<<5)|0}}while(0);if((x|0)==(p|0)){u=p+28|0;c[r-32+28>>2]=c[u>>2];c[u>>2]=s;y=s;break}else{z=x}do{A=z+28|0;z=c[A>>2]|0;}while((z|0)!=(p|0));c[A>>2]=s;r=s;u=p;c[r>>2]=c[u>>2];c[r+4>>2]=c[u+4>>2];c[r+8>>2]=c[u+8>>2];c[r+12>>2]=c[u+12>>2];c[r+16>>2]=c[u+16>>2];c[r+20>>2]=c[u+20>>2];c[r+24>>2]=c[u+24>>2];c[r+28>>2]=c[u+28>>2];c[p+28>>2]=0;c[m>>2]=0;y=p;break}c[o>>2]=s;uf(k|0,0,108)|0;u=e+12|0;r=c[e+28>>2]|0;v=0;w=1;B=0;C=1;while(1){if((w|0)>(r|0)){if((C|0)>(r|0)){E=B;break}else{F=r}}else{F=w}if((C|0)>(F|0)){G=C;H=0}else{I=c[u>>2]|0;J=C;K=0;while(1){L=((c[I+(J-1<<4)+8>>2]|0)!=0)+K|0;if((J|0)<(F|0)){J=J+1|0;K=L}else{break}}G=F+1|0;H=L}K=j+(v<<2)|0;c[K>>2]=(c[K>>2]|0)+H;K=H+B|0;J=v+1|0;if((J|0)<27){v=J;w=w<<1;B=K;C=G}else{E=K;break}}C=0;B=1<<(d[e+7|0]|0);w=0;a:while(1){v=B;while(1){M=v-1|0;if((v|0)==0){break a}N=c[n>>2]|0;if((c[N+(M<<5)+8>>2]|0)==0){v=M}else{break}}do{if((c[N+(M<<5)+24>>2]|0)==3){O=+h[N+(M<<5)+16>>3];v=~~O;u=v-1|0;if(!(+(v|0)==O&u>>>0<67108864>>>0)){P=0;break}v=j+((Rd(u)|0)+1<<2)|0;c[v>>2]=(c[v>>2]|0)+1;P=1}else{P=0}}while(0);C=C+1|0;B=M;w=P+w|0}B=w+E|0;do{if((c[l>>2]|0)==3){O=+h[f>>3];n=~~O;v=n-1|0;if(!(+(n|0)==O&v>>>0<67108864>>>0)){Q=0;break}n=j+((Rd(v)|0)+1<<2)|0;c[n>>2]=(c[n>>2]|0)+1;Q=1}else{Q=0}}while(0);w=B+Q|0;b:do{if((w|0)>0){n=0;v=1;u=0;r=0;o=0;K=0;while(1){J=c[j+(n<<2)>>2]|0;if((J|0)>0){I=J+u|0;J=(I|0)>(K|0);R=J?v:o;S=J?I:r;T=I}else{R=o;S=r;T=u}if((T|0)==(w|0)){U=R;V=S;break b}I=v<<1;J=(I|0)/2|0;if((J|0)<(w|0)){n=n+1|0;v=I;u=T;r=S;o=R;K=J}else{U=R;V=S;break}}}else{U=0;V=0}}while(0);ue(b,e,U,E+1+C-V|0);w=ze(e,f)|0;a[e+6|0]=0;if((w|0)!=328){W=w;i=g;return W|0}w=c[l>>2]|0;do{if((w|0)==0){Jc(b,1216,(X=i,i=i+1|0,i=i+7&-8,c[X>>2]=0,X)|0);i=X}else if((w|0)==3){O=+h[f>>3];if(!(O!=O)&!(D=0.0,D!=D)){break}Jc(b,2832,(X=i,i=i+1|0,i=i+7&-8,c[X>>2]=0,X)|0);i=X}}while(0);W=Be(b,e,f)|0;i=g;return W|0}else{y=p}}while(0);p=f;X=y+16|0;V=c[p+4>>2]|0;c[X>>2]=c[p>>2];c[X+4>>2]=V;c[y+24>>2]=c[l>>2];do{if((c[l>>2]|0)>3){if((a[(c[f>>2]|0)+5|0]&3)==0){break}if((a[e+5|0]&4)==0){break}ud(b,e)}}while(0);W=y|0;i=g;return W|0}function Ce(a,b,e){a=a|0;b=b|0;e=e|0;var f=0,g=0,j=0,l=0,m=0,n=0.0,o=0,p=0,q=0.0,r=0;f=i;i=i+16|0;g=f|0;j=e-1|0;a:do{if(j>>>0<(c[b+28>>2]|0)>>>0){l=(c[b+12>>2]|0)+(j<<4)|0;m=10}else{n=+(e|0);if((e|0)==0){o=c[b+16>>2]|0}else{h[k>>3]=n;o=(c[b+16>>2]|0)+(((((c[k+4>>2]|0)+(c[k>>2]|0)|0)>>>0)%(((1<<(d[b+7|0]|0))-1|1)>>>0)|0)<<5)|0}while(1){if((c[o+24>>2]|0)==3){if(+h[o+16>>3]==n){break}}p=c[o+28>>2]|0;if((p|0)==0){q=n;break a}else{o=p}}l=o|0;m=10}}while(0);do{if((m|0)==10){if((l|0)==328){q=+(e|0);break}else{r=l;i=f;return r|0}}}while(0);h[g>>3]=q;c[g+8>>2]=3;r=Be(a,b,g)|0;i=f;return r|0}function De(a,b,e){a=a|0;b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;f=i;i=i+16|0;g=f|0;h=(c[b+16>>2]|0)+(((1<<(d[b+7|0]|0))-1&c[e+8>>2])<<5)|0;while(1){if((c[h+24>>2]|0)==4){if((c[h+16>>2]|0)==(e|0)){j=5;break}}k=c[h+28>>2]|0;if((k|0)==0){break}else{h=k}}do{if((j|0)==5){k=h|0;if((k|0)==328){break}else{l=k}i=f;return l|0}}while(0);c[g>>2]=e;c[g+8>>2]=4;l=Be(a,b,g)|0;i=f;return l|0}function Ee(a){a=a|0;var b=0,e=0,f=0,g=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0.0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;b=c[a+28>>2]|0;do{if((b|0)!=0){e=c[a+12>>2]|0;if((c[e+(b-1<<4)+8>>2]|0)!=0){break}if(b>>>0>1>>>0){f=b;g=0}else{i=0;return i|0}while(1){j=(g+f|0)>>>1;l=(c[e+(j-1<<4)+8>>2]|0)==0;m=l?j:f;n=l?g:j;if((m-n|0)>>>0>1>>>0){f=m;g=n}else{i=n;break}}return i|0}}while(0);g=c[a+16>>2]|0;if((g|0)==600){i=b;return i|0}f=a+12|0;e=a+7|0;a=b;n=b+1|0;while(1){m=n-1|0;a:do{if(m>>>0<b>>>0){o=(c[f>>2]|0)+(m<<4)|0}else{p=+(n|0);if((n|0)==0){q=g}else{h[k>>3]=p;q=g+(((((c[k+4>>2]|0)+(c[k>>2]|0)|0)>>>0)%(((1<<(d[e]|0))-1|1)>>>0)|0)<<5)|0}while(1){if((c[q+24>>2]|0)==3){if(+h[q+16>>3]==p){break}}j=c[q+28>>2]|0;if((j|0)==0){o=328;break a}else{q=j}}o=q|0}}while(0);if((c[o+8>>2]|0)==0){break}m=n<<1;if(m>>>0>2147483645>>>0){r=1;s=18;break}else{a=n;n=m}}if((s|0)==18){while(1){s=0;o=r-1|0;b:do{if(o>>>0<b>>>0){t=(c[f>>2]|0)+(o<<4)|0}else{p=+(r|0);if((r|0)==0){u=g}else{h[k>>3]=p;u=g+(((((c[k+4>>2]|0)+(c[k>>2]|0)|0)>>>0)%(((1<<(d[e]|0))-1|1)>>>0)|0)<<5)|0}while(1){if((c[u+24>>2]|0)==3){if(+h[u+16>>3]==p){break}}q=c[u+28>>2]|0;if((q|0)==0){t=328;break b}else{u=q}}t=u|0}}while(0);if((c[t+8>>2]|0)==0){i=o;break}else{r=r+1|0;s=18}}return i|0}if((n-a|0)>>>0>1>>>0){v=n;w=a}else{i=a;return i|0}while(1){a=(v+w|0)>>>1;n=a-1|0;c:do{if(n>>>0<b>>>0){x=(c[f>>2]|0)+(n<<4)|0}else{p=+(a|0);if((a|0)==0){y=g}else{h[k>>3]=p;y=g+(((((c[k+4>>2]|0)+(c[k>>2]|0)|0)>>>0)%(((1<<(d[e]|0))-1|1)>>>0)|0)<<5)|0}while(1){if((c[y+24>>2]|0)==3){if(+h[y+16>>3]==p){break}}s=c[y+28>>2]|0;if((s|0)==0){x=328;break c}else{y=s}}x=y|0}}while(0);n=(c[x+8>>2]|0)==0;o=n?a:v;s=n?w:a;if((o-s|0)>>>0>1>>>0){v=o;w=s}else{i=s;break}}return i|0}function Fe(b){b=b|0;var d=0,e=0,f=0,g=0;d=b+16|0;e=0;do{f=c[216+(e<<2)>>2]|0;g=se(b,f,qf(f|0)|0)|0;c[(c[d>>2]|0)+188+(e<<2)>>2]=g;g=(c[(c[d>>2]|0)+188+(e<<2)>>2]|0)+5|0;a[g]=a[g]|32;e=e+1|0;}while((e|0)<17);return}function Ge(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0;g=ye(b,f)|0;if((c[g+8>>2]|0)!=0){h=g;return h|0}g=b+6|0;a[g]=d[g]|0|1<<e;h=0;return h|0}function He(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=c[b+8>>2]|0;if((e|0)==5){f=c[(c[b>>2]|0)+8>>2]|0}else if((e|0)==7){f=c[(c[b>>2]|0)+8>>2]|0}else{f=c[(c[a+16>>2]|0)+152+(e<<2)>>2]|0}if((f|0)==0){g=328;return g|0}g=ye(f,c[(c[a+16>>2]|0)+188+(d<<2)>>2]|0)|0;return g|0}function Ie(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;g=i;i=i+64|0;h=g|0;j=g+16|0;k=g+32|0;l=a[f]|0;if((l<<24>>24|0)==64|(l<<24>>24|0)==61){m=f+1|0;c[k+12>>2]=m;n=m}else if((l<<24>>24|0)==27){c[k+12>>2]=2768;n=2768}else{c[k+12>>2]=f;n=f}f=k|0;c[f>>2]=b;c[k+4>>2]=d;c[k+8>>2]=e;e=j|0;c[h>>2]=1635077147;a[h+4|0]=81;a[h+5|0]=0;a[h+6|0]=1;a[h+7|0]=4;a[h+8|0]=4;l=h+10|0;a[h+9|0]=4;a[l]=8;a[h+11|0]=0;if((We(d,e,12)|0)==0){o=0;p=k+28|0}else{Vd(b,704,(q=i,i=i+16|0,c[q>>2]=n,c[q+8>>2]=1048,q)|0)|0;i=q;Oc(c[f>>2]|0,3);n=k+28|0;o=(c[n>>2]|0)+12|0;p=n}c[p>>2]=o;o=j+6|0;c[k+16>>2]=(a[o]|0)!=1;a[o]=1;o=a[j+10|0]|0;a[l]=o;c[k+20>>2]=o<<24>>24;o=j+11|0;j=(a[o]|0)>0;c[k+24>>2]=j&1;if(j){a[o]=0}if((of(h|0,e,12)|0)==0){r=12;s=0;t=12;u=0;c[p>>2]=0;v=se(b,2128,2)|0;w=Je(k,v)|0;i=g;return w|0}Vd(c[f>>2]|0,704,(q=i,i=i+16|0,c[q>>2]=c[k+12>>2],c[q+8>>2]=3280,q)|0)|0;i=q;Oc(c[f>>2]|0,3);r=12;s=0;t=12;u=0;c[p>>2]=0;v=se(b,2128,2)|0;w=Je(k,v)|0;i=g;return w|0}function Je(d,e){d=d|0;e=e|0;var f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0;f=i;i=i+184|0;g=f|0;j=f+8|0;k=f+16|0;l=f+24|0;m=f+32|0;n=f+40|0;o=f+48|0;p=f+56|0;q=f+64|0;r=f+72|0;s=f+80|0;t=f+88|0;u=f+96|0;v=f+104|0;w=f+112|0;x=f+120|0;y=f+128|0;z=f+136|0;A=f+144|0;B=f+152|0;C=f+160|0;D=f+168|0;E=f+176|0;F=d|0;G=c[F>>2]|0;H=G+52|0;I=(b[H>>1]|0)+1&65535;b[H>>1]=I;if((I&65535)>>>0>200>>>0){Vd(G,704,(J=i,i=i+16|0,c[J>>2]=c[d+12>>2],c[J+8>>2]=1792,J)|0)|0;i=J;Oc(c[F>>2]|0,3);K=c[F>>2]|0}else{K=G}G=hd(K)|0;K=d+4|0;I=c[K>>2]|0;jb[c[I+12>>2]&3](0,c[I+16>>2]|0,0)|0;I=c[(c[F>>2]|0)+8>>2]|0;c[I>>2]=G;c[I+8>>2]=9;I=c[F>>2]|0;H=c[I+8>>2]|0;if(((c[I+28>>2]|0)-H|0)<17){Sc(I,1);L=c[F>>2]|0;M=L;N=c[L+8>>2]|0}else{M=I;N=H}c[M+8>>2]=N+16;N=Ke(d)|0;M=G+32|0;c[M>>2]=(N|0)==0?e:N;N=E;if((We(c[K>>2]|0,N,4)|0)!=0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[d+12>>2],c[J+8>>2]=1048,J)|0)|0;i=J;Oc(c[F>>2]|0,3)}e=d+28|0;c[e>>2]=(c[e>>2]|0)+4;H=d+16|0;if((c[H>>2]|0)!=0){I=a[N]|0;L=N+3|0;a[N]=a[L]|0;a[L]=I;I=N+1|0;L=a[I]|0;O=N+2|0;a[I]=a[O]|0;a[O]=L}L=c[E>>2]|0;if((L|0)<0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[d+12>>2],c[J+8>>2]=816,J)|0)|0;i=J;Oc(c[F>>2]|0,3);P=c[E>>2]|0}else{P=L}c[G+60>>2]=P;P=D;if((We(c[K>>2]|0,P,4)|0)!=0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[d+12>>2],c[J+8>>2]=1048,J)|0)|0;i=J;Oc(c[F>>2]|0,3)}c[e>>2]=(c[e>>2]|0)+4;if((c[H>>2]|0)!=0){L=a[P]|0;E=P+3|0;a[P]=a[E]|0;a[E]=L;L=P+1|0;E=a[L]|0;O=P+2|0;a[L]=a[O]|0;a[O]=E}E=c[D>>2]|0;if((E|0)<0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[d+12>>2],c[J+8>>2]=816,J)|0)|0;i=J;Oc(c[F>>2]|0,3);Q=c[D>>2]|0}else{Q=E}c[G+64>>2]=Q;if((We(c[K>>2]|0,C,1)|0)!=0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[d+12>>2],c[J+8>>2]=1048,J)|0)|0;i=J;Oc(c[F>>2]|0,3)}c[e>>2]=(c[e>>2]|0)+1;a[G+72|0]=a[C]|0;if((We(c[K>>2]|0,B,1)|0)!=0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[d+12>>2],c[J+8>>2]=1048,J)|0)|0;i=J;Oc(c[F>>2]|0,3)}c[e>>2]=(c[e>>2]|0)+1;a[G+73|0]=a[B]|0;if((We(c[K>>2]|0,A,1)|0)!=0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[d+12>>2],c[J+8>>2]=1048,J)|0)|0;i=J;Oc(c[F>>2]|0,3)}c[e>>2]=(c[e>>2]|0)+1;a[G+74|0]=a[A]|0;if((We(c[K>>2]|0,z,1)|0)!=0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[d+12>>2],c[J+8>>2]=1048,J)|0)|0;i=J;Oc(c[F>>2]|0,3)}c[e>>2]=(c[e>>2]|0)+1;a[G+75|0]=a[z]|0;z=y;if((We(c[K>>2]|0,z,4)|0)!=0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[d+12>>2],c[J+8>>2]=1048,J)|0)|0;i=J;Oc(c[F>>2]|0,3)}A=(c[e>>2]|0)+4|0;c[e>>2]=A;if((c[H>>2]|0)!=0){B=a[z]|0;C=z+3|0;a[z]=a[C]|0;a[C]=B;B=z+1|0;C=a[B]|0;Q=z+2|0;a[B]=a[Q]|0;a[Q]=C}C=c[y>>2]|0;if((C|0)<0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[d+12>>2],c[J+8>>2]=816,J)|0)|0;i=J;Oc(c[F>>2]|0,3);R=c[y>>2]|0;S=c[e>>2]|0}else{R=C;S=A}if((S&3|0)!=0){S=d+12|0;do{if((We(c[K>>2]|0,x,1)|0)!=0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[S>>2],c[J+8>>2]=1048,J)|0)|0;i=J;Oc(c[F>>2]|0,3)}A=(c[e>>2]|0)+1|0;c[e>>2]=A;}while((A&3|0)!=0)}S=c[K>>2]|0;do{if((jb[c[S+12>>2]&3](0,c[S+16>>2]|0,0)|0)==0){x=c[F>>2]|0;if((R+1|0)>>>0<1073741824>>>0){A=R<<2;T=Nd(x,0,0,A)|0;U=A}else{T=Od(x)|0;U=R<<2}c[G+12>>2]=T;if((We(c[K>>2]|0,T,U)|0)!=0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[d+12>>2],c[J+8>>2]=1048,J)|0)|0;i=J;Oc(c[F>>2]|0,3)}c[e>>2]=(c[e>>2]|0)+U;if((c[H>>2]|0)==0|(T|0)==0|(R|0)==0){break}else{V=R;W=T}while(1){x=V-1|0;A=a[W]|0;C=W+3|0;a[W]=a[C]|0;a[C]=A;A=W+1|0;C=a[A]|0;y=W+2|0;a[A]=a[y]|0;a[y]=C;if((x|0)==0){break}else{V=x;W=W+4|0}}}else{x=c[K>>2]|0;C=jb[c[x+12>>2]&3](0,c[x+16>>2]|0,0)|0;c[G+12>>2]=C+(c[(c[K>>2]|0)+4>>2]|0);C=R<<2;if((We(c[K>>2]|0,0,C)|0)!=0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[d+12>>2],c[J+8>>2]=1048,J)|0)|0;i=J;Oc(c[F>>2]|0,3)}c[e>>2]=(c[e>>2]|0)+C}}while(0);c[G+44>>2]=R;R=q;if((We(c[K>>2]|0,R,4)|0)!=0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[d+12>>2],c[J+8>>2]=1048,J)|0)|0;i=J;Oc(c[F>>2]|0,3)}c[e>>2]=(c[e>>2]|0)+4;if((c[H>>2]|0)!=0){W=a[R]|0;V=R+3|0;a[R]=a[V]|0;a[V]=W;W=R+1|0;V=a[W]|0;T=R+2|0;a[W]=a[T]|0;a[T]=V}V=c[q>>2]|0;if((V|0)<0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[d+12>>2],c[J+8>>2]=816,J)|0)|0;i=J;Oc(c[F>>2]|0,3);X=c[q>>2]|0}else{X=V}V=c[F>>2]|0;if((X+1|0)>>>0<268435456>>>0){Y=Nd(V,0,0,X<<4)|0}else{Y=Od(V)|0}V=Y;Y=G+8|0;c[Y>>2]=V;c[G+40>>2]=X;q=(X|0)>0;a:do{if(q){T=0;do{c[V+(T<<4)+8>>2]=0;T=T+1|0;}while((T|0)<(X|0));if(!q){break}T=d+12|0;W=j;R=l;U=m;S=n;C=d+24|0;x=W+7|0;y=W+1|0;A=W+6|0;Q=W+2|0;B=W+5|0;z=W+3|0;E=W+4|0;D=d+20|0;O=R+1|0;L=U+3|0;P=U+1|0;I=U+2|0;N=S+7|0;Z=S+1|0;_=S+6|0;$=S+2|0;aa=S+5|0;ba=S+3|0;ca=S+4|0;da=0;ea=V;while(1){fa=ea+(da<<4)|0;if((We(c[K>>2]|0,p,1)|0)!=0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[T>>2],c[J+8>>2]=1048,J)|0)|0;i=J;Oc(c[F>>2]|0,3)}c[e>>2]=(c[e>>2]|0)+1;ga=a[p]|0;if((ga|0)==0){c[ea+(da<<4)+8>>2]=0}else if((ga|0)==1){if((We(c[K>>2]|0,o,1)|0)!=0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[T>>2],c[J+8>>2]=1048,J)|0)|0;i=J;Oc(c[F>>2]|0,3)}c[e>>2]=(c[e>>2]|0)+1;c[fa>>2]=(a[o]|0)!=0;c[ea+(da<<4)+8>>2]=1}else if((ga|0)==3){do{if((c[C>>2]|0)==0){if((We(c[K>>2]|0,W,8)|0)!=0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[T>>2],c[J+8>>2]=1048,J)|0)|0;i=J;Oc(c[F>>2]|0,3)}c[e>>2]=(c[e>>2]|0)+8;if((c[H>>2]|0)==0){break}ha=a[W]|0;a[W]=a[x]|0;a[x]=ha;ha=a[y]|0;a[y]=a[A]|0;a[A]=ha;ha=a[Q]|0;a[Q]=a[B]|0;a[B]=ha;ha=a[z]|0;a[z]=a[E]|0;a[E]=ha}else{ha=c[D>>2]|0;if((ha|0)==1){if((We(c[K>>2]|0,k,1)|0)!=0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[T>>2],c[J+8>>2]=1048,J)|0)|0;i=J;Oc(c[F>>2]|0,3)}c[e>>2]=(c[e>>2]|0)+1;h[j>>3]=+(a[k]|0);break}else if((ha|0)==2){if((We(c[K>>2]|0,R,2)|0)!=0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[T>>2],c[J+8>>2]=1048,J)|0)|0;i=J;Oc(c[F>>2]|0,3)}c[e>>2]=(c[e>>2]|0)+2;if((c[H>>2]|0)!=0){ia=a[R]|0;a[R]=a[O]|0;a[O]=ia}h[j>>3]=+(b[l>>1]|0);break}else if((ha|0)==4){if((We(c[K>>2]|0,U,4)|0)!=0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[T>>2],c[J+8>>2]=1048,J)|0)|0;i=J;Oc(c[F>>2]|0,3)}c[e>>2]=(c[e>>2]|0)+4;if((c[H>>2]|0)!=0){ia=a[U]|0;a[U]=a[L]|0;a[L]=ia;ia=a[P]|0;a[P]=a[I]|0;a[I]=ia}h[j>>3]=+(c[m>>2]|0);break}else if((ha|0)==8){if((We(c[K>>2]|0,S,8)|0)!=0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[T>>2],c[J+8>>2]=1048,J)|0)|0;i=J;Oc(c[F>>2]|0,3)}c[e>>2]=(c[e>>2]|0)+8;if((c[H>>2]|0)!=0){ha=a[S]|0;a[S]=a[N]|0;a[N]=ha;ha=a[Z]|0;a[Z]=a[_]|0;a[_]=ha;ha=a[$]|0;a[$]=a[aa]|0;a[aa]=ha;ha=a[ba]|0;a[ba]=a[ca]|0;a[ca]=ha}h[j>>3]=+((c[n>>2]|0)>>>0)+ +(c[n+4>>2]|0)*4294967296.0;break}else{break}}}while(0);h[fa>>3]=+h[j>>3];c[ea+(da<<4)+8>>2]=3}else if((ga|0)==4){c[fa>>2]=Ke(d)|0;c[ea+(da<<4)+8>>2]=4}else{Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[T>>2],c[J+8>>2]=944,J)|0)|0;i=J;Oc(c[F>>2]|0,3)}ha=da+1|0;if((ha|0)>=(X|0)){break a}da=ha;ea=c[Y>>2]|0}}}while(0);Y=g;if((We(c[K>>2]|0,Y,4)|0)!=0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[d+12>>2],c[J+8>>2]=1048,J)|0)|0;i=J;Oc(c[F>>2]|0,3)}c[e>>2]=(c[e>>2]|0)+4;if((c[H>>2]|0)!=0){X=a[Y]|0;j=Y+3|0;a[Y]=a[j]|0;a[j]=X;X=Y+1|0;j=a[X]|0;n=Y+2|0;a[X]=a[n]|0;a[n]=j}j=c[g>>2]|0;if((j|0)<0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[d+12>>2],c[J+8>>2]=816,J)|0)|0;i=J;Oc(c[F>>2]|0,3);ja=c[g>>2]|0}else{ja=j}j=c[F>>2]|0;if((ja+1|0)>>>0<1073741824>>>0){ka=Nd(j,0,0,ja<<2)|0}else{ka=Od(j)|0}j=ka;ka=G+16|0;c[ka>>2]=j;c[G+52>>2]=ja;g=(ja|0)>0;do{if(g){n=0;X=j;while(1){c[X+(n<<2)>>2]=0;Y=n+1|0;if((Y|0)>=(ja|0)){break}n=Y;X=c[ka>>2]|0}if(g){la=0}else{break}do{X=Je(d,c[M>>2]|0)|0;c[(c[ka>>2]|0)+(la<<2)>>2]=X;la=la+1|0;}while((la|0)<(ja|0))}}while(0);ja=w;if((We(c[K>>2]|0,ja,4)|0)!=0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[d+12>>2],c[J+8>>2]=1048,J)|0)|0;i=J;Oc(c[F>>2]|0,3)}la=(c[e>>2]|0)+4|0;c[e>>2]=la;if((c[H>>2]|0)!=0){ka=a[ja]|0;M=ja+3|0;a[ja]=a[M]|0;a[M]=ka;ka=ja+1|0;M=a[ka]|0;g=ja+2|0;a[ka]=a[g]|0;a[g]=M}M=c[w>>2]|0;if((M|0)<0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[d+12>>2],c[J+8>>2]=816,J)|0)|0;i=J;Oc(c[F>>2]|0,3);ma=c[w>>2]|0;na=c[e>>2]|0}else{ma=M;na=la}if((na&3|0)!=0){na=d+12|0;do{if((We(c[K>>2]|0,v,1)|0)!=0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[na>>2],c[J+8>>2]=1048,J)|0)|0;i=J;Oc(c[F>>2]|0,3)}la=(c[e>>2]|0)+1|0;c[e>>2]=la;}while((la&3|0)!=0)}na=c[K>>2]|0;do{if((jb[c[na+12>>2]&3](0,c[na+16>>2]|0,0)|0)==0){v=c[F>>2]|0;if((ma+1|0)>>>0<1073741824>>>0){la=ma<<2;oa=Nd(v,0,0,la)|0;pa=la}else{oa=Od(v)|0;pa=ma<<2}c[G+20>>2]=oa;if((We(c[K>>2]|0,oa,pa)|0)!=0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[d+12>>2],c[J+8>>2]=1048,J)|0)|0;i=J;Oc(c[F>>2]|0,3)}c[e>>2]=(c[e>>2]|0)+pa;if((c[H>>2]|0)==0|(oa|0)==0|(ma|0)==0){break}else{qa=ma;ra=oa}while(1){v=qa-1|0;la=a[ra]|0;M=ra+3|0;a[ra]=a[M]|0;a[M]=la;la=ra+1|0;M=a[la]|0;w=ra+2|0;a[la]=a[w]|0;a[w]=M;if((v|0)==0){break}else{qa=v;ra=ra+4|0}}}else{v=c[K>>2]|0;M=jb[c[v+12>>2]&3](0,c[v+16>>2]|0,0)|0;c[G+20>>2]=M+(c[(c[K>>2]|0)+4>>2]|0);M=ma<<2;if((We(c[K>>2]|0,0,M)|0)!=0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[d+12>>2],c[J+8>>2]=1048,J)|0)|0;i=J;Oc(c[F>>2]|0,3)}c[e>>2]=(c[e>>2]|0)+M}}while(0);c[G+48>>2]=ma;ma=u;if((We(c[K>>2]|0,ma,4)|0)!=0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[d+12>>2],c[J+8>>2]=1048,J)|0)|0;i=J;Oc(c[F>>2]|0,3)}c[e>>2]=(c[e>>2]|0)+4;if((c[H>>2]|0)!=0){ra=a[ma]|0;qa=ma+3|0;a[ma]=a[qa]|0;a[qa]=ra;ra=ma+1|0;qa=a[ra]|0;oa=ma+2|0;a[ra]=a[oa]|0;a[oa]=qa}qa=c[u>>2]|0;if((qa|0)<0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[d+12>>2],c[J+8>>2]=816,J)|0)|0;i=J;Oc(c[F>>2]|0,3);sa=c[u>>2]|0}else{sa=qa}qa=c[F>>2]|0;if((sa+1|0)>>>0<357913942>>>0){ta=Nd(qa,0,0,sa*12|0)|0}else{ta=Od(qa)|0}qa=G+24|0;c[qa>>2]=ta;c[G+56>>2]=sa;if((sa|0)>0){c[ta>>2]=0;if((sa|0)>1){ta=1;do{c[(c[qa>>2]|0)+(ta*12|0)>>2]=0;ta=ta+1|0;}while((ta|0)<(sa|0))}ta=t;u=d+12|0;oa=s;ra=oa+3|0;ma=oa+1|0;pa=oa+2|0;na=ta+3|0;M=ta+1|0;v=ta+2|0;w=0;do{la=Ke(d)|0;c[(c[qa>>2]|0)+(w*12|0)>>2]=la;if((We(c[K>>2]|0,ta,4)|0)!=0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[u>>2],c[J+8>>2]=1048,J)|0)|0;i=J;Oc(c[F>>2]|0,3)}c[e>>2]=(c[e>>2]|0)+4;if((c[H>>2]|0)!=0){la=a[ta]|0;a[ta]=a[na]|0;a[na]=la;la=a[M]|0;a[M]=a[v]|0;a[v]=la}la=c[t>>2]|0;if((la|0)<0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[u>>2],c[J+8>>2]=816,J)|0)|0;i=J;Oc(c[F>>2]|0,3);ua=c[t>>2]|0}else{ua=la}c[(c[qa>>2]|0)+(w*12|0)+4>>2]=ua;if((We(c[K>>2]|0,oa,4)|0)!=0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[u>>2],c[J+8>>2]=1048,J)|0)|0;i=J;Oc(c[F>>2]|0,3)}c[e>>2]=(c[e>>2]|0)+4;if((c[H>>2]|0)!=0){la=a[oa]|0;a[oa]=a[ra]|0;a[ra]=la;la=a[ma]|0;a[ma]=a[pa]|0;a[pa]=la}la=c[s>>2]|0;if((la|0)<0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[u>>2],c[J+8>>2]=816,J)|0)|0;i=J;Oc(c[F>>2]|0,3);va=c[s>>2]|0}else{va=la}c[(c[qa>>2]|0)+(w*12|0)+8>>2]=va;w=w+1|0;}while((w|0)<(sa|0))}sa=r;if((We(c[K>>2]|0,sa,4)|0)!=0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[d+12>>2],c[J+8>>2]=1048,J)|0)|0;i=J;Oc(c[F>>2]|0,3)}c[e>>2]=(c[e>>2]|0)+4;if((c[H>>2]|0)!=0){H=a[sa]|0;e=sa+3|0;a[sa]=a[e]|0;a[e]=H;H=sa+1|0;e=a[H]|0;K=sa+2|0;a[H]=a[K]|0;a[K]=e}e=c[r>>2]|0;if((e|0)<0){Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[d+12>>2],c[J+8>>2]=816,J)|0)|0;i=J;Oc(c[F>>2]|0,3);wa=c[r>>2]|0}else{wa=e}e=c[F>>2]|0;if((wa+1|0)>>>0<1073741824>>>0){xa=Nd(e,0,0,wa<<2)|0}else{xa=Od(e)|0}e=xa;xa=G+28|0;c[xa>>2]=e;c[G+36>>2]=wa;if((wa|0)>0){c[e>>2]=0;if((wa|0)>1){e=1;while(1){c[(c[xa>>2]|0)+(e<<2)>>2]=0;r=e+1|0;if((r|0)<(wa|0)){e=r}else{ya=0;break}}}else{ya=0}do{e=Ke(d)|0;c[(c[xa>>2]|0)+(ya<<2)>>2]=e;ya=ya+1|0;}while((ya|0)<(wa|0))}if((Fc(G)|0)!=0){za=c[F>>2]|0;Aa=za+8|0;Ba=c[Aa>>2]|0;Ca=Ba-16|0;c[Aa>>2]=Ca;Da=c[F>>2]|0;Ea=Da+52|0;Fa=b[Ea>>1]|0;Ga=Fa-1&65535;b[Ea>>1]=Ga;i=f;return G|0}Vd(c[F>>2]|0,704,(J=i,i=i+16|0,c[J>>2]=c[d+12>>2],c[J+8>>2]=1392,J)|0)|0;i=J;Oc(c[F>>2]|0,3);za=c[F>>2]|0;Aa=za+8|0;Ba=c[Aa>>2]|0;Ca=Ba-16|0;c[Aa>>2]=Ca;Da=c[F>>2]|0;Ea=Da+52|0;Fa=b[Ea>>1]|0;Ga=Fa-1&65535;b[Ea>>1]=Ga;i=f;return G|0}function Ke(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;d=i;i=i+8|0;e=d|0;f=e;g=b+4|0;if((We(c[g>>2]|0,f,4)|0)!=0){h=b|0;Vd(c[h>>2]|0,704,(j=i,i=i+16|0,c[j>>2]=c[b+12>>2],c[j+8>>2]=1048,j)|0)|0;i=j;Oc(c[h>>2]|0,3)}h=b+28|0;c[h>>2]=(c[h>>2]|0)+4;if((c[b+16>>2]|0)!=0){k=a[f]|0;l=f+3|0;a[f]=a[l]|0;a[l]=k;k=f+1|0;l=a[k]|0;m=f+2|0;a[k]=a[m]|0;a[m]=l}if((c[e>>2]|0)==0){n=0;i=d;return n|0}l=c[g>>2]|0;if((jb[c[l+12>>2]&3](0,c[l+16>>2]|0,0)|0)==0){l=b|0;m=Xe(c[l>>2]|0,c[b+8>>2]|0,c[e>>2]|0)|0;k=c[e>>2]|0;if((We(c[g>>2]|0,m,k)|0)!=0){Vd(c[l>>2]|0,704,(j=i,i=i+16|0,c[j>>2]=c[b+12>>2],c[j+8>>2]=1048,j)|0)|0;i=j;Oc(c[l>>2]|0,3)}c[h>>2]=(c[h>>2]|0)+k;n=se(c[l>>2]|0,m,(c[e>>2]|0)-1|0)|0;i=d;return n|0}else{m=c[g>>2]|0;l=jb[c[m+12>>2]&3](0,c[m+16>>2]|0,0)|0;m=c[g>>2]|0;g=l+(c[m+4>>2]|0)|0;l=c[e>>2]|0;k=b|0;if((We(m,0,l)|0)!=0){Vd(c[k>>2]|0,704,(j=i,i=i+16|0,c[j>>2]=c[b+12>>2],c[j+8>>2]=1048,j)|0)|0;i=j;Oc(c[k>>2]|0,3)}c[h>>2]=(c[h>>2]|0)+l;n=se(c[k>>2]|0,g,(c[e>>2]|0)-1|0)|0;i=d;return n|0}return 0}function Le(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,j=0,k=0,l=0;d=i;i=i+8|0;e=d|0;f=a+8|0;g=c[f>>2]|0;do{if((g|0)==4){if((Td((c[a>>2]|0)+16|0,e)|0)==0){j=c[f>>2]|0;k=5;break}else{h[b>>3]=+h[e>>3];c[b+8>>2]=3;l=b;break}}else if((g|0)==3){l=a}else{j=g;k=5}}while(0);do{if((k|0)==5){if((j|0)==1){h[b>>3]=+(c[a>>2]|0);c[b+8>>2]=3;l=b;break}else if((j|0)==5){h[b>>3]=+Ca(3384);c[b+8>>2]=3;l=b;break}else{l=0;break}}}while(0);i=d;return l|0}function Me(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,j=0;d=i;i=i+32|0;e=b+8|0;if((c[e>>2]|0)!=3){f=0;i=d;return f|0}g=d|0;Ha(g|0,2760,(j=i,i=i+8|0,h[j>>3]=+h[b>>3],j)|0)|0;i=j;c[b>>2]=se(a,g,qf(g|0)|0)|0;c[e>>2]=4;f=1;i=d;return f|0}function Ne(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;g=i;h=b+16|0;j=0;k=d;l=c[d+8>>2]|0;a:while(1){m=k+8|0;do{if((l|0)==5){d=c[k>>2]|0;n=ze(d,e)|0;o=n+8|0;if((c[o>>2]|0)!=0){p=8;break a}q=c[d+8>>2]|0;d=q;if((q|0)==0){p=8;break a}if(!((a[d+6|0]&1)==0)){p=8;break a}q=Ge(d,0,c[(c[h>>2]|0)+188>>2]|0)|0;if((q|0)==0){p=8;break a}else{r=q}}else{q=He(b,k,0)|0;if((c[q+8>>2]|0)!=0){r=q;break}Hc(b,k,2096);r=q}}while(0);s=r+8|0;q=c[s>>2]|0;d=j+1|0;if((q|0)==6){p=12;break}if((d|0)<100){j=d;k=r;l=q}else{p=15;break}}if((p|0)==8){l=n;n=f;j=c[l+4>>2]|0;c[n>>2]=c[l>>2];c[n+4>>2]=j;c[f+8>>2]=c[o>>2];i=g;return}else if((p|0)==12){o=b+32|0;j=f-(c[o>>2]|0)|0;f=b+8|0;n=c[f>>2]|0;l=r;r=n;h=c[l+4>>2]|0;c[r>>2]=c[l>>2];c[r+4>>2]=h;c[n+8>>2]=c[s>>2];s=c[f>>2]|0;n=k;k=s+16|0;h=c[n+4>>2]|0;c[k>>2]=c[n>>2];c[k+4>>2]=h;c[s+24>>2]=c[m>>2];m=c[f>>2]|0;s=e;h=m+32|0;k=c[s+4>>2]|0;c[h>>2]=c[s>>2];c[h+4>>2]=k;c[m+40>>2]=c[e+8>>2];e=c[f>>2]|0;if(((c[b+28>>2]|0)-e|0)<49){Sc(b,3);t=c[f>>2]|0}else{t=e}c[f>>2]=t+48;Wc(b,t,1);t=c[o>>2]|0;o=c[f>>2]|0;e=o-16|0;c[f>>2]=e;f=e;e=t+j|0;m=c[f+4>>2]|0;c[e>>2]=c[f>>2];c[e+4>>2]=m;c[t+(j+8)>>2]=c[o-16+8>>2];i=g;return}else if((p|0)==15){Jc(b,1736,(b=i,i=i+1|0,i=i+7&-8,c[b>>2]=0,b)|0);i=b;i=g;return}}function Oe(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;g=i;i=i+16|0;h=g|0;j=b+16|0;k=h;l=h+8|0;m=0;n=d;o=c[d+8>>2]|0;a:while(1){p=n+8|0;do{if((o|0)==5){q=c[n>>2]|0;r=q;s=Ae(b,r,e)|0;t=s+8|0;if((c[t>>2]|0)!=0){u=7;break a}d=c[q+8>>2]|0;v=d;if((d|0)==0){u=7;break a}if(!((a[v+6|0]&2)==0)){u=7;break a}d=Ge(v,1,c[(c[j>>2]|0)+192>>2]|0)|0;if((d|0)==0){u=7;break a}else{w=d}}else{d=He(b,n,1)|0;if((c[d+8>>2]|0)!=0){w=d;break}Hc(b,n,2096);w=d}}while(0);x=w+8|0;if((c[x>>2]|0)==6){u=14;break}d=w;v=c[d+4>>2]|0;c[k>>2]=c[d>>2];c[k+4>>2]=v;v=c[x>>2]|0;c[l>>2]=v;d=m+1|0;if((d|0)<100){m=d;n=h;o=v}else{u=18;break}}if((u|0)==7){o=f;h=s;s=c[o+4>>2]|0;c[h>>2]=c[o>>2];c[h+4>>2]=s;s=f+8|0;c[t>>2]=c[s>>2];a[q+6|0]=0;if((c[s>>2]|0)<=3){i=g;return}if((a[(c[f>>2]|0)+5|0]&3)==0){i=g;return}if((a[q+5|0]&4)==0){i=g;return}ud(b,r);i=g;return}else if((u|0)==14){r=b+8|0;q=c[r>>2]|0;s=w;w=q;t=c[s+4>>2]|0;c[w>>2]=c[s>>2];c[w+4>>2]=t;c[q+8>>2]=c[x>>2];x=c[r>>2]|0;q=n;n=x+16|0;t=c[q+4>>2]|0;c[n>>2]=c[q>>2];c[n+4>>2]=t;c[x+24>>2]=c[p>>2];p=c[r>>2]|0;x=e;t=p+32|0;n=c[x+4>>2]|0;c[t>>2]=c[x>>2];c[t+4>>2]=n;c[p+40>>2]=c[e+8>>2];e=c[r>>2]|0;p=f;n=e+48|0;t=c[p+4>>2]|0;c[n>>2]=c[p>>2];c[n+4>>2]=t;c[e+56>>2]=c[f+8>>2];f=c[r>>2]|0;if(((c[b+28>>2]|0)-f|0)<65){Sc(b,4);y=c[r>>2]|0}else{y=f}c[r>>2]=y+64;Wc(b,y,0);i=g;return}else if((u|0)==18){Jc(b,1368,(b=i,i=i+1|0,i=i+7&-8,c[b>>2]=0,b)|0);i=b;i=g;return}}function Pe(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;e=b+8|0;f=c[e>>2]|0;g=d+8|0;do{if((f|0)==(c[g>>2]|0)){if((f|0)==3){i=+h[b>>3]<+h[d>>3]|0;return i|0}else if((f|0)!=4){break}j=c[b>>2]|0;k=c[d>>2]|0;l=j+16|0;m=k+16|0;n=_e(l,m)|0;a:do{if((n|0)==0){o=l;p=c[j+12>>2]|0;q=m;r=c[k+12>>2]|0;while(1){s=qf(o|0)|0;t=(s|0)==(p|0);if((s|0)==(r|0)){break}if(t){u=-1;break a}v=s+1|0;s=o+v|0;w=q+v|0;x=_e(s,w)|0;if((x|0)==0){o=s;p=p-v|0;q=w;r=r-v|0}else{u=x;break a}}u=t&1^1}else{u=n}}while(0);i=u>>>31;return i|0}}while(0);u=He(a,b,13)|0;t=u+8|0;if((c[t>>2]|0)==0){i=Mc(a,b,d)|0;return i|0}He(a,d,13)|0;f=a+8|0;n=c[f>>2]|0;k=a+32|0;m=n-(c[k>>2]|0)|0;j=u;u=n;l=c[j+4>>2]|0;c[u>>2]=c[j>>2];c[u+4>>2]=l;c[n+8>>2]=c[t>>2];t=c[f>>2]|0;n=b;b=t+16|0;l=c[n+4>>2]|0;c[b>>2]=c[n>>2];c[b+4>>2]=l;c[t+24>>2]=c[e>>2];e=c[f>>2]|0;t=d;d=e+32|0;l=c[t+4>>2]|0;c[d>>2]=c[t>>2];c[d+4>>2]=l;c[e+40>>2]=c[g>>2];g=c[f>>2]|0;if(((c[a+28>>2]|0)-g|0)<49){Sc(a,3);y=c[f>>2]|0}else{y=g}c[f>>2]=y+48;Wc(a,y,1);y=c[k>>2]|0;k=c[f>>2]|0;a=k-16|0;c[f>>2]=a;g=a;a=y+m|0;e=c[g+4>>2]|0;c[a>>2]=c[g>>2];c[a+4>>2]=e;c[y+(m+8)>>2]=c[k-16+8>>2];k=c[f>>2]|0;f=c[k+8>>2]|0;do{if((f|0)==0){i=0;return i|0}else if((f|0)==1){if((c[k>>2]|0)==0){i=0}else{break}return i|0}else if((f|0)==3){if(+h[k>>3]==0.0){i=0}else{break}return i|0}else{if((f|0)!=4){i=1;return i|0}i=(c[(c[k>>2]|0)+12>>2]|0)!=0|0;return i|0}}while(0);i=1;return i|0}function Qe(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;f=d+8|0;a:do{switch(c[f>>2]|0){case 0:{g=1;return g|0};case 3:{g=+h[d>>3]==+h[e>>3]|0;return g|0};case 1:{g=(c[d>>2]|0)==(c[e>>2]|0)|0;return g|0};case 2:{g=(c[d>>2]|0)==(c[e>>2]|0)|0;return g|0};case 7:{i=c[d>>2]|0;j=c[e>>2]|0;if((i|0)==(j|0)){g=1;return g|0}k=c[i+8>>2]|0;i=k;l=c[j+8>>2]|0;j=l;if((k|0)==0){g=0;return g|0}if(!((a[i+6|0]&16)==0)){g=0;return g|0}m=b+16|0;n=Ge(i,4,c[(c[m>>2]|0)+204>>2]|0)|0;if((n|0)==0){g=0;return g|0}if((k|0)==(l|0)){o=n;break a}if((l|0)==0){g=0;return g|0}if(!((a[j+6|0]&16)==0)){g=0;return g|0}l=Ge(j,4,c[(c[m>>2]|0)+204>>2]|0)|0;if((l|0)==0){g=0;return g|0}else{m=(Sd(n,l)|0)==0;p=m?0:n;q=24;break a}break};case 5:{n=c[d>>2]|0;m=c[e>>2]|0;if((n|0)==(m|0)){g=1;return g|0}l=c[n+8>>2]|0;n=l;j=c[m+8>>2]|0;m=j;if((l|0)==0){g=0;return g|0}if(!((a[n+6|0]&16)==0)){g=0;return g|0}k=b+16|0;i=Ge(n,4,c[(c[k>>2]|0)+204>>2]|0)|0;if((i|0)==0){g=0;return g|0}if((l|0)==(j|0)){o=i;break a}if((j|0)==0){g=0;return g|0}if(!((a[m+6|0]&16)==0)){g=0;return g|0}j=Ge(m,4,c[(c[k>>2]|0)+204>>2]|0)|0;if((j|0)==0){g=0;return g|0}else{k=(Sd(i,j)|0)==0;p=k?0:i;q=24;break a}break};default:{g=(c[d>>2]|0)==(c[e>>2]|0)|0;return g|0}}}while(0);do{if((q|0)==24){if((p|0)==0){g=0}else{o=p;break}return g|0}}while(0);p=b+8|0;q=c[p>>2]|0;i=b+32|0;k=q-(c[i>>2]|0)|0;j=o;m=q;l=c[j+4>>2]|0;c[m>>2]=c[j>>2];c[m+4>>2]=l;c[q+8>>2]=c[o+8>>2];o=c[p>>2]|0;q=d;d=o+16|0;l=c[q+4>>2]|0;c[d>>2]=c[q>>2];c[d+4>>2]=l;c[o+24>>2]=c[f>>2];f=c[p>>2]|0;o=e;l=f+32|0;d=c[o+4>>2]|0;c[l>>2]=c[o>>2];c[l+4>>2]=d;c[f+40>>2]=c[e+8>>2];e=c[p>>2]|0;if(((c[b+28>>2]|0)-e|0)<49){Sc(b,3);r=c[p>>2]|0}else{r=e}c[p>>2]=r+48;Wc(b,r,1);r=c[i>>2]|0;i=c[p>>2]|0;b=i-16|0;c[p>>2]=b;e=b;b=r+k|0;f=c[e+4>>2]|0;c[b>>2]=c[e>>2];c[b+4>>2]=f;c[r+(k+8)>>2]=c[i-16+8>>2];i=c[p>>2]|0;p=c[i+8>>2]|0;do{if((p|0)==0){g=0;return g|0}else if((p|0)==1){if((c[i>>2]|0)==0){g=0}else{break}return g|0}else if((p|0)==3){if(+h[i>>3]==0.0){g=0}else{break}return g|0}else{if((p|0)!=4){g=1;return g|0}g=(c[(c[i>>2]|0)+12>>2]|0)!=0|0;return g|0}}while(0);g=1;return g|0}function Re(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;e=i;i=i+32|0;f=a+12|0;g=e|0;j=a+16|0;k=a+32|0;l=a+8|0;m=a+28|0;n=b;b=d;while(1){d=c[f>>2]|0;o=b+1|0;p=b-1|0;q=d+(p<<4)|0;r=d+(p<<4)+8|0;p=d+(b<<4)|0;do{if(((c[r>>2]|0)-3|0)>>>0<2>>>0){s=d+(b<<4)+8|0;t=c[s>>2]|0;if((t|0)==4){u=p}else{if((t|0)!=3){v=7;break}Ha(g|0,2760,(w=i,i=i+8|0,h[w>>3]=+h[p>>3],w)|0)|0;i=w;t=p;c[t>>2]=se(a,g,qf(g|0)|0)|0;c[s>>2]=4;u=t}t=c[(c[u>>2]|0)+12>>2]|0;if((t|0)==0){s=c[r>>2]|0;if((s|0)==4){x=2;break}if((s|0)!=3){x=2;break}Ha(g|0,2760,(w=i,i=i+8|0,h[w>>3]=+h[q>>3],w)|0)|0;i=w;c[q>>2]=se(a,g,qf(g|0)|0)|0;c[r>>2]=4;x=2;break}a:do{if((n|0)>1){s=t;y=1;while(1){z=o-y-1|0;A=d+(z<<4)|0;B=d+(z<<4)+8|0;z=c[B>>2]|0;if((z|0)==4){C=A}else{if((z|0)!=3){D=s;E=y;break a}Ha(g|0,2760,(w=i,i=i+8|0,h[w>>3]=+h[A>>3],w)|0)|0;i=w;z=A;c[z>>2]=se(a,g,qf(g|0)|0)|0;c[B>>2]=4;C=z}z=c[(c[C>>2]|0)+12>>2]|0;if(!(z>>>0<(-3-s|0)>>>0)){Jc(a,1240,(w=i,i=i+1|0,i=i+7&-8,c[w>>2]=0,w)|0);i=w}B=z+s|0;z=y+1|0;if((z|0)<(n|0)){s=B;y=z}else{D=B;E=z;break}}}else{D=t;E=1}}while(0);t=Xe(a,(c[j>>2]|0)+52|0,D)|0;if((E|0)>0){y=0;s=E;while(1){z=c[d+(o-s<<4)>>2]|0;B=c[z+12>>2]|0;rf(t+y|0,z+16|0,B)|0;z=B+y|0;B=s-1|0;if((B|0)>0){y=z;s=B}else{F=z;break}}}else{F=0}s=o-E|0;c[d+(s<<4)>>2]=se(a,t,F)|0;c[d+(s<<4)+8>>2]=4;x=E}else{v=7}}while(0);b:do{if((v|0)==7){v=0;o=He(a,q,15)|0;do{if((c[o+8>>2]|0)==0){s=He(a,p,15)|0;if((c[s+8>>2]|0)!=0){G=s;break}Kc(a,q,p);x=2;break b}else{G=o}}while(0);o=q-(c[k>>2]|0)|0;t=c[l>>2]|0;s=G;y=t;z=c[s+4>>2]|0;c[y>>2]=c[s>>2];c[y+4>>2]=z;c[t+8>>2]=c[G+8>>2];t=c[l>>2]|0;z=q;y=t+16|0;s=c[z+4>>2]|0;c[y>>2]=c[z>>2];c[y+4>>2]=s;c[t+24>>2]=c[r>>2];t=c[l>>2]|0;s=p;y=t+32|0;z=c[s+4>>2]|0;c[y>>2]=c[s>>2];c[y+4>>2]=z;c[t+40>>2]=c[d+(b<<4)+8>>2];t=c[l>>2]|0;if(((c[m>>2]|0)-t|0)<49){Sc(a,3);H=c[l>>2]|0}else{H=t}c[l>>2]=H+48;Wc(a,H,1);t=c[k>>2]|0;z=c[l>>2]|0;y=z-16|0;c[l>>2]=y;s=y;y=t+o|0;B=c[s+4>>2]|0;c[y>>2]=c[s>>2];c[y+4>>2]=B;c[t+(o+8)>>2]=c[z-16+8>>2];x=2}}while(0);d=x-1|0;p=n-d|0;if((p|0)<=1){break}n=p;b=b-d|0}i=e;return}function Se(b,e){b=b|0;e=e|0;var f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,P=0,Q=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0.0,Ja=0,Ka=0,La=0,Ma=0,Na=0,Oa=0,Pa=0,Qa=0.0,Ra=0,Sa=0,Ta=0,Ua=0,Va=0,Wa=0,Xa=0,Ya=0.0,Za=0,_a=0,$a=0,ab=0,bb=0,cb=0,db=0,eb=0.0,fb=0,gb=0,hb=0,ib=0,jb=0.0,kb=0.0,lb=0,mb=0,nb=0,ob=0.0,pb=0,qb=0,rb=0,sb=0,tb=0,ub=0,vb=0,wb=0.0,xb=0,yb=0,zb=0,Ab=0,Bb=0,Cb=0,Eb=0,Fb=0,Gb=0,Ib=0,Jb=0,Kb=0,Lb=0,Mb=0,Nb=0,Ob=0,Pb=0,Qb=0,Sb=0,Tb=0,Ub=0,Vb=0,Wb=0,Xb=0,Yb=0,Zb=0,_b=0,$b=0,ac=0,bc=0,cc=0,dc=0,ec=0,fc=0,gc=0,hc=0,ic=0,jc=0.0,kc=0,lc=0,mc=0,nc=0,oc=0,pc=0,qc=0,rc=0,sc=0,tc=0,uc=0,vc=0,wc=0,xc=0;f=i;i=i+168|0;g=f|0;j=f+8|0;k=f+16|0;l=f+24|0;m=f+40|0;n=f+56|0;o=f+72|0;p=f+88|0;q=f+104|0;r=f+120|0;s=f+136|0;t=f+152|0;u=b+24|0;v=b+20|0;w=b+12|0;x=b+56|0;y=s;z=s+8|0;A=t;B=t+8|0;C=b+16|0;D=b+8|0;E=b+32|0;F=b+28|0;G=r|0;H=r+8|0;I=q|0;J=q+8|0;K=p|0;L=p+8|0;M=o|0;N=o+8|0;P=n|0;Q=n+8|0;S=m|0;T=m+8|0;U=l|0;V=l+8|0;W=c[84]|0;X=b+64|0;Y=b+6|0;Z=b+60|0;_=b+104|0;$=e;a:while(1){e=c[v>>2]|0;b:while(1){aa=c[c[e+4>>2]>>2]|0;ba=aa+16|0;ca=c[(c[ba>>2]|0)+8>>2]|0;da=aa+20|0;ea=aa+12|0;aa=c[w>>2]|0;fa=c[u>>2]|0;c:while(1){ga=fa+4|0;ha=c[fa>>2]|0;ia=a[x]|0;do{if((ia&12)==0){ja=aa}else{ka=(c[X>>2]|0)-1|0;c[X>>2]=ka;la=(ka|0)==0;if(!la){if((ia&4)==0){ja=aa;break}}ka=c[u>>2]|0;c[u>>2]=ga;ma=ia&255;if(!((ma&8|0)==0|la^1)){c[X>>2]=c[Z>>2];Tc(b,3,-1)}do{if((ma&4|0)!=0){la=c[(c[c[(c[v>>2]|0)+4>>2]>>2]|0)+16>>2]|0;na=c[la+12>>2]|0;oa=(ga-na>>2)-1|0;pa=c[la+20>>2]|0;la=(pa|0)==0;if(la){qa=0}else{qa=c[pa+(oa<<2)>>2]|0}if((oa|0)!=0&ka>>>0<ga>>>0){if(la){ra=0}else{ra=c[pa+((ka-na>>2)-1<<2)>>2]|0}if((qa|0)==(ra|0)){break}}Tc(b,2,qa)}}while(0);if((a[Y]|0)==1){sa=18;break a}ja=c[w>>2]|0}}while(0);ta=ha>>>6&255;ua=ja+(ta<<4)|0;switch(ha&63|0){case 20:{ia=ha>>>23;ka=ja+(ia<<4)|0;ma=ja+(ia<<4)+8|0;ia=c[ma>>2]|0;if((ia|0)==4){h[ua>>3]=+((c[(c[ka>>2]|0)+12>>2]|0)>>>0>>>0);c[ja+(ta<<4)+8>>2]=3;aa=ja;fa=ga;continue c}else if((ia|0)==5){h[ua>>3]=+(Ee(c[ka>>2]|0)|0);c[ja+(ta<<4)+8>>2]=3;aa=ja;fa=ga;continue c}else{c[u>>2]=ga;ia=He(b,ka,12)|0;do{if((c[ia+8>>2]|0)==0){na=He(b,328,12)|0;if((c[na+8>>2]|0)!=0){va=na;sa=284;break}Hc(b,ka,1032)}else{va=ia;sa=284}}while(0);if((sa|0)==284){sa=0;ia=ua-(c[E>>2]|0)|0;na=c[D>>2]|0;pa=va;la=na;oa=c[pa+4>>2]|0;c[la>>2]=c[pa>>2];c[la+4>>2]=oa;c[na+8>>2]=c[va+8>>2];na=c[D>>2]|0;oa=ka;la=na+16|0;pa=c[oa+4>>2]|0;c[la>>2]=c[oa>>2];c[la+4>>2]=pa;c[na+24>>2]=c[ma>>2];na=c[D>>2]|0;pa=na+32|0;la=328;oa=c[la+4>>2]|0;c[pa>>2]=c[la>>2];c[pa+4>>2]=oa;c[na+40>>2]=W;na=c[D>>2]|0;if(((c[F>>2]|0)-na|0)<49){Sc(b,3);wa=c[D>>2]|0}else{wa=na}c[D>>2]=wa+48;Wc(b,wa,1);na=c[E>>2]|0;oa=c[D>>2]|0;pa=oa-16|0;c[D>>2]=pa;la=pa;pa=na+ia|0;xa=c[la+4>>2]|0;c[pa>>2]=c[la>>2];c[pa+4>>2]=xa;c[na+(ia+8)>>2]=c[oa-16+8>>2]}aa=c[w>>2]|0;fa=ga;continue c}break};case 0:{oa=ha>>>23;ia=ja+(oa<<4)|0;na=ua;xa=c[ia+4>>2]|0;c[na>>2]=c[ia>>2];c[na+4>>2]=xa;c[ja+(ta<<4)+8>>2]=c[ja+(oa<<4)+8>>2];aa=ja;fa=ga;continue c;break};case 1:{oa=ha>>>14;xa=ca+(oa<<4)|0;na=ua;ia=c[xa+4>>2]|0;c[na>>2]=c[xa>>2];c[na+4>>2]=ia;c[ja+(ta<<4)+8>>2]=c[ca+(oa<<4)+8>>2];aa=ja;fa=ga;continue c;break};case 2:{c[ua>>2]=ha>>>23;c[ja+(ta<<4)+8>>2]=1;aa=ja;fa=(ha&8372224|0)==0?ga:fa+8|0;continue c;break};case 3:{oa=ja+(ha>>>23<<4)|0;while(1){ia=oa-16|0;c[oa+8>>2]=0;if(ia>>>0<ua>>>0){aa=ja;fa=ga;continue c}else{oa=ia}}break};case 4:{oa=c[(c[da+(ha>>>23<<2)>>2]|0)+8>>2]|0;ma=oa;ka=ua;ia=c[ma+4>>2]|0;c[ka>>2]=c[ma>>2];c[ka+4>>2]=ia;c[ja+(ta<<4)+8>>2]=c[oa+8>>2];aa=ja;fa=ga;continue c;break};case 5:{c[y>>2]=c[ea>>2];c[z>>2]=5;c[u>>2]=ga;Ne(b,s,ca+(ha>>>14<<4)|0,ua);aa=c[w>>2]|0;fa=ga;continue c;break};case 6:{c[u>>2]=ga;oa=ha>>>14;if((oa&256|0)==0){ya=ja+((oa&511)<<4)|0}else{ya=ca+((oa&255)<<4)|0}Ne(b,ja+(ha>>>23<<4)|0,ya,ua);aa=c[w>>2]|0;fa=ga;continue c;break};case 7:{c[A>>2]=c[ea>>2];c[B>>2]=5;c[u>>2]=ga;Oe(b,t,ca+(ha>>>14<<4)|0,ua);aa=c[w>>2]|0;fa=ga;continue c;break};case 8:{oa=c[da+(ha>>>23<<2)>>2]|0;ia=c[oa+8>>2]|0;ka=ua;ma=ia;na=c[ka+4>>2]|0;c[ma>>2]=c[ka>>2];c[ma+4>>2]=na;na=ja+(ta<<4)+8|0;c[ia+8>>2]=c[na>>2];if((c[na>>2]|0)<=3){aa=ja;fa=ga;continue c}na=c[ua>>2]|0;if((a[na+5|0]&3)==0){aa=ja;fa=ga;continue c}if((a[oa+5|0]&4)==0){aa=ja;fa=ga;continue c}sd(b,oa,na);aa=ja;fa=ga;continue c;break};case 9:{c[u>>2]=ga;na=ha>>>23;if((na&256|0)==0){za=ja+(na<<4)|0}else{za=ca+((na&255)<<4)|0}na=ha>>>14;if((na&256|0)==0){Aa=ja+((na&511)<<4)|0}else{Aa=ca+((na&255)<<4)|0}Oe(b,ua,za,Aa);aa=c[w>>2]|0;fa=ga;continue c;break};case 10:{na=Qd(ha>>>23)|0;c[ua>>2]=ve(b,na,Qd(ha>>>14&511)|0)|0;c[ja+(ta<<4)+8>>2]=5;c[u>>2]=ga;na=c[C>>2]|0;if(!((c[na+68>>2]|0)>>>0<(c[na+64>>2]|0)>>>0)){pd(b)}aa=c[w>>2]|0;fa=ga;continue c;break};case 11:{na=ha>>>23;oa=ja+(na<<4)|0;ia=ta+1|0;ma=oa;ka=ja+(ia<<4)|0;xa=c[ma+4>>2]|0;c[ka>>2]=c[ma>>2];c[ka+4>>2]=xa;c[ja+(ia<<4)+8>>2]=c[ja+(na<<4)+8>>2];c[u>>2]=ga;na=ha>>>14;if((na&256|0)==0){Ba=ja+((na&511)<<4)|0}else{Ba=ca+((na&255)<<4)|0}Ne(b,oa,Ba,ua);aa=c[w>>2]|0;fa=ga;continue c;break};case 12:{oa=ha>>>23;if((oa&256|0)==0){Da=ja+(oa<<4)|0}else{Da=ca+((oa&255)<<4)|0}oa=ha>>>14;if((oa&256|0)==0){Ea=ja+((oa&511)<<4)|0}else{Ea=ca+((oa&255)<<4)|0}oa=Da+8|0;na=c[oa>>2]|0;do{if((na|0)==3){if((c[Ea+8>>2]|0)==3){h[ua>>3]=+h[Da>>3]+ +h[Ea>>3];c[ja+(ta<<4)+8>>2]=3;aa=ja;fa=ga;continue c}else{c[u>>2]=ga;Fa=Da;break}}else{c[u>>2]=ga;if((na|0)!=5){Fa=Da;break}Db(b,Da);if((Rb(b,-1,3264)|0)==0){Fa=Da;break}ia=c[D>>2]|0;Hb(b,-1);Fa=(c[ia-16+8>>2]|0)==5?Da:ia-16|0}}while(0);na=c[Fa+8>>2]|0;if((na|0)==1){h[G>>3]=+(c[Fa>>2]|0);c[H>>2]=3;Ga=r;sa=68}else if((na|0)==5){h[G>>3]=+Ca(3384);c[H>>2]=3;Ga=r;sa=68}else if((na|0)==3){if((Fa|0)==0){sa=77}else{Ga=Fa;sa=68}}else{sa=77}do{if((sa|0)==68){sa=0;do{if((c[Ea+8>>2]|0)==5){Db(b,Ea);if((Rb(b,-1,3264)|0)==0){Ha=Ea;break}na=c[D>>2]|0;Hb(b,-1);Ha=(c[na-16+8>>2]|0)==5?Ea:na-16|0}else{Ha=Ea}}while(0);na=c[Ha+8>>2]|0;if((na|0)==1){Ia=+(c[Ha>>2]|0)}else if((na|0)==5){Ia=+Ca(3384)}else if((na|0)==3){if((Ha|0)==0){sa=77;break}Ia=+h[Ha>>3]}else{sa=77;break}h[ua>>3]=+h[Ga>>3]+Ia;c[ja+(ta<<4)+8>>2]=3}}while(0);d:do{if((sa|0)==77){sa=0;na=He(b,Da,5)|0;do{if((c[na+8>>2]|0)==0){ia=He(b,Ea,5)|0;if((c[ia+8>>2]|0)!=0){Ja=ia;break}Lc(b,Da,Ea);break d}else{Ja=na}}while(0);na=ua-(c[E>>2]|0)|0;ia=c[D>>2]|0;xa=Ja;ka=ia;ma=c[xa+4>>2]|0;c[ka>>2]=c[xa>>2];c[ka+4>>2]=ma;c[ia+8>>2]=c[Ja+8>>2];ia=c[D>>2]|0;ma=Da;ka=ia+16|0;xa=c[ma+4>>2]|0;c[ka>>2]=c[ma>>2];c[ka+4>>2]=xa;c[ia+24>>2]=c[oa>>2];ia=c[D>>2]|0;xa=Ea;ka=ia+32|0;ma=c[xa+4>>2]|0;c[ka>>2]=c[xa>>2];c[ka+4>>2]=ma;c[ia+40>>2]=c[Ea+8>>2];ia=c[D>>2]|0;if(((c[F>>2]|0)-ia|0)<49){Sc(b,3);Ka=c[D>>2]|0}else{Ka=ia}c[D>>2]=Ka+48;Wc(b,Ka,1);ia=c[E>>2]|0;ma=c[D>>2]|0;ka=ma-16|0;c[D>>2]=ka;xa=ka;ka=ia+na|0;pa=c[xa+4>>2]|0;c[ka>>2]=c[xa>>2];c[ka+4>>2]=pa;c[ia+(na+8)>>2]=c[ma-16+8>>2]}}while(0);aa=c[w>>2]|0;fa=ga;continue c;break};case 13:{oa=ha>>>23;if((oa&256|0)==0){La=ja+(oa<<4)|0}else{La=ca+((oa&255)<<4)|0}oa=ha>>>14;if((oa&256|0)==0){Ma=ja+((oa&511)<<4)|0}else{Ma=ca+((oa&255)<<4)|0}oa=La+8|0;ma=c[oa>>2]|0;do{if((ma|0)==3){if((c[Ma+8>>2]|0)==3){h[ua>>3]=+h[La>>3]- +h[Ma>>3];c[ja+(ta<<4)+8>>2]=3;aa=ja;fa=ga;continue c}else{c[u>>2]=ga;Na=La;break}}else{c[u>>2]=ga;if((ma|0)!=5){Na=La;break}Db(b,La);if((Rb(b,-1,3264)|0)==0){Na=La;break}na=c[D>>2]|0;Hb(b,-1);Na=(c[na-16+8>>2]|0)==5?La:na-16|0}}while(0);ma=c[Na+8>>2]|0;if((ma|0)==1){h[I>>3]=+(c[Na>>2]|0);c[J>>2]=3;Oa=q;sa=101}else if((ma|0)==5){h[I>>3]=+Ca(3384);c[J>>2]=3;Oa=q;sa=101}else if((ma|0)==3){if((Na|0)==0){sa=110}else{Oa=Na;sa=101}}else{sa=110}do{if((sa|0)==101){sa=0;do{if((c[Ma+8>>2]|0)==5){Db(b,Ma);if((Rb(b,-1,3264)|0)==0){Pa=Ma;break}ma=c[D>>2]|0;Hb(b,-1);Pa=(c[ma-16+8>>2]|0)==5?Ma:ma-16|0}else{Pa=Ma}}while(0);ma=c[Pa+8>>2]|0;if((ma|0)==1){Qa=+(c[Pa>>2]|0)}else if((ma|0)==5){Qa=+Ca(3384)}else if((ma|0)==3){if((Pa|0)==0){sa=110;break}Qa=+h[Pa>>3]}else{sa=110;break}h[ua>>3]=+h[Oa>>3]-Qa;c[ja+(ta<<4)+8>>2]=3}}while(0);e:do{if((sa|0)==110){sa=0;ma=He(b,La,6)|0;do{if((c[ma+8>>2]|0)==0){na=He(b,Ma,6)|0;if((c[na+8>>2]|0)!=0){Ra=na;break}Lc(b,La,Ma);break e}else{Ra=ma}}while(0);ma=ua-(c[E>>2]|0)|0;na=c[D>>2]|0;ia=Ra;pa=na;ka=c[ia+4>>2]|0;c[pa>>2]=c[ia>>2];c[pa+4>>2]=ka;c[na+8>>2]=c[Ra+8>>2];na=c[D>>2]|0;ka=La;pa=na+16|0;ia=c[ka+4>>2]|0;c[pa>>2]=c[ka>>2];c[pa+4>>2]=ia;c[na+24>>2]=c[oa>>2];na=c[D>>2]|0;ia=Ma;pa=na+32|0;ka=c[ia+4>>2]|0;c[pa>>2]=c[ia>>2];c[pa+4>>2]=ka;c[na+40>>2]=c[Ma+8>>2];na=c[D>>2]|0;if(((c[F>>2]|0)-na|0)<49){Sc(b,3);Sa=c[D>>2]|0}else{Sa=na}c[D>>2]=Sa+48;Wc(b,Sa,1);na=c[E>>2]|0;ka=c[D>>2]|0;pa=ka-16|0;c[D>>2]=pa;ia=pa;pa=na+ma|0;xa=c[ia+4>>2]|0;c[pa>>2]=c[ia>>2];c[pa+4>>2]=xa;c[na+(ma+8)>>2]=c[ka-16+8>>2]}}while(0);aa=c[w>>2]|0;fa=ga;continue c;break};case 14:{oa=ha>>>23;if((oa&256|0)==0){Ta=ja+(oa<<4)|0}else{Ta=ca+((oa&255)<<4)|0}oa=ha>>>14;if((oa&256|0)==0){Ua=ja+((oa&511)<<4)|0}else{Ua=ca+((oa&255)<<4)|0}oa=Ta+8|0;ka=c[oa>>2]|0;do{if((ka|0)==3){if((c[Ua+8>>2]|0)==3){h[ua>>3]=+h[Ta>>3]*+h[Ua>>3];c[ja+(ta<<4)+8>>2]=3;aa=ja;fa=ga;continue c}else{c[u>>2]=ga;Va=Ta;break}}else{c[u>>2]=ga;if((ka|0)!=5){Va=Ta;break}Db(b,Ta);if((Rb(b,-1,3264)|0)==0){Va=Ta;break}ma=c[D>>2]|0;Hb(b,-1);Va=(c[ma-16+8>>2]|0)==5?Ta:ma-16|0}}while(0);ka=c[Va+8>>2]|0;if((ka|0)==1){h[K>>3]=+(c[Va>>2]|0);c[L>>2]=3;Wa=p;sa=134}else if((ka|0)==5){h[K>>3]=+Ca(3384);c[L>>2]=3;Wa=p;sa=134}else if((ka|0)==3){if((Va|0)==0){sa=143}else{Wa=Va;sa=134}}else{sa=143}do{if((sa|0)==134){sa=0;do{if((c[Ua+8>>2]|0)==5){Db(b,Ua);if((Rb(b,-1,3264)|0)==0){Xa=Ua;break}ka=c[D>>2]|0;Hb(b,-1);Xa=(c[ka-16+8>>2]|0)==5?Ua:ka-16|0}else{Xa=Ua}}while(0);ka=c[Xa+8>>2]|0;if((ka|0)==1){Ya=+(c[Xa>>2]|0)}else if((ka|0)==5){Ya=+Ca(3384)}else if((ka|0)==3){if((Xa|0)==0){sa=143;break}Ya=+h[Xa>>3]}else{sa=143;break}h[ua>>3]=+h[Wa>>3]*Ya;c[ja+(ta<<4)+8>>2]=3}}while(0);f:do{if((sa|0)==143){sa=0;ka=He(b,Ta,7)|0;do{if((c[ka+8>>2]|0)==0){ma=He(b,Ua,7)|0;if((c[ma+8>>2]|0)!=0){Za=ma;break}Lc(b,Ta,Ua);break f}else{Za=ka}}while(0);ka=ua-(c[E>>2]|0)|0;ma=c[D>>2]|0;na=Za;xa=ma;pa=c[na+4>>2]|0;c[xa>>2]=c[na>>2];c[xa+4>>2]=pa;c[ma+8>>2]=c[Za+8>>2];ma=c[D>>2]|0;pa=Ta;xa=ma+16|0;na=c[pa+4>>2]|0;c[xa>>2]=c[pa>>2];c[xa+4>>2]=na;c[ma+24>>2]=c[oa>>2];ma=c[D>>2]|0;na=Ua;xa=ma+32|0;pa=c[na+4>>2]|0;c[xa>>2]=c[na>>2];c[xa+4>>2]=pa;c[ma+40>>2]=c[Ua+8>>2];ma=c[D>>2]|0;if(((c[F>>2]|0)-ma|0)<49){Sc(b,3);_a=c[D>>2]|0}else{_a=ma}c[D>>2]=_a+48;Wc(b,_a,1);ma=c[E>>2]|0;pa=c[D>>2]|0;xa=pa-16|0;c[D>>2]=xa;na=xa;xa=ma+ka|0;ia=c[na+4>>2]|0;c[xa>>2]=c[na>>2];c[xa+4>>2]=ia;c[ma+(ka+8)>>2]=c[pa-16+8>>2]}}while(0);aa=c[w>>2]|0;fa=ga;continue c;break};case 15:{oa=ha>>>23;if((oa&256|0)==0){$a=ja+(oa<<4)|0}else{$a=ca+((oa&255)<<4)|0}oa=ha>>>14;if((oa&256|0)==0){ab=ja+((oa&511)<<4)|0}else{ab=ca+((oa&255)<<4)|0}oa=$a+8|0;pa=c[oa>>2]|0;do{if((pa|0)==3){if((c[ab+8>>2]|0)==3){h[ua>>3]=+h[$a>>3]/+h[ab>>3];c[ja+(ta<<4)+8>>2]=3;aa=ja;fa=ga;continue c}else{c[u>>2]=ga;bb=$a;break}}else{c[u>>2]=ga;if((pa|0)!=5){bb=$a;break}Db(b,$a);if((Rb(b,-1,3264)|0)==0){bb=$a;break}ka=c[D>>2]|0;Hb(b,-1);bb=(c[ka-16+8>>2]|0)==5?$a:ka-16|0}}while(0);pa=c[bb+8>>2]|0;if((pa|0)==1){h[M>>3]=+(c[bb>>2]|0);c[N>>2]=3;cb=o;sa=167}else if((pa|0)==5){h[M>>3]=+Ca(3384);c[N>>2]=3;cb=o;sa=167}else if((pa|0)==3){if((bb|0)==0){sa=176}else{cb=bb;sa=167}}else{sa=176}do{if((sa|0)==167){sa=0;do{if((c[ab+8>>2]|0)==5){Db(b,ab);if((Rb(b,-1,3264)|0)==0){db=ab;break}pa=c[D>>2]|0;Hb(b,-1);db=(c[pa-16+8>>2]|0)==5?ab:pa-16|0}else{db=ab}}while(0);pa=c[db+8>>2]|0;if((pa|0)==1){eb=+(c[db>>2]|0)}else if((pa|0)==5){eb=+Ca(3384)}else if((pa|0)==3){if((db|0)==0){sa=176;break}eb=+h[db>>3]}else{sa=176;break}h[ua>>3]=+h[cb>>3]/eb;c[ja+(ta<<4)+8>>2]=3}}while(0);g:do{if((sa|0)==176){sa=0;pa=He(b,$a,8)|0;do{if((c[pa+8>>2]|0)==0){ka=He(b,ab,8)|0;if((c[ka+8>>2]|0)!=0){fb=ka;break}Lc(b,$a,ab);break g}else{fb=pa}}while(0);pa=ua-(c[E>>2]|0)|0;ka=c[D>>2]|0;ma=fb;ia=ka;xa=c[ma+4>>2]|0;c[ia>>2]=c[ma>>2];c[ia+4>>2]=xa;c[ka+8>>2]=c[fb+8>>2];ka=c[D>>2]|0;xa=$a;ia=ka+16|0;ma=c[xa+4>>2]|0;c[ia>>2]=c[xa>>2];c[ia+4>>2]=ma;c[ka+24>>2]=c[oa>>2];ka=c[D>>2]|0;ma=ab;ia=ka+32|0;xa=c[ma+4>>2]|0;c[ia>>2]=c[ma>>2];c[ia+4>>2]=xa;c[ka+40>>2]=c[ab+8>>2];ka=c[D>>2]|0;if(((c[F>>2]|0)-ka|0)<49){Sc(b,3);gb=c[D>>2]|0}else{gb=ka}c[D>>2]=gb+48;Wc(b,gb,1);ka=c[E>>2]|0;xa=c[D>>2]|0;ia=xa-16|0;c[D>>2]=ia;ma=ia;ia=ka+pa|0;na=c[ma+4>>2]|0;c[ia>>2]=c[ma>>2];c[ia+4>>2]=na;c[ka+(pa+8)>>2]=c[xa-16+8>>2]}}while(0);aa=c[w>>2]|0;fa=ga;continue c;break};case 16:{oa=ha>>>23;if((oa&256|0)==0){hb=ja+(oa<<4)|0}else{hb=ca+((oa&255)<<4)|0}oa=ha>>>14;if((oa&256|0)==0){ib=ja+((oa&511)<<4)|0}else{ib=ca+((oa&255)<<4)|0}oa=hb+8|0;xa=c[oa>>2]|0;do{if((xa|0)==3){if((c[ib+8>>2]|0)==3){jb=+h[hb>>3];kb=+h[ib>>3];h[ua>>3]=jb-kb*+O(jb/kb);c[ja+(ta<<4)+8>>2]=3;aa=ja;fa=ga;continue c}else{c[u>>2]=ga;lb=hb;break}}else{c[u>>2]=ga;if((xa|0)!=5){lb=hb;break}Db(b,hb);if((Rb(b,-1,3264)|0)==0){lb=hb;break}pa=c[D>>2]|0;Hb(b,-1);lb=(c[pa-16+8>>2]|0)==5?hb:pa-16|0}}while(0);xa=c[lb+8>>2]|0;if((xa|0)==1){h[P>>3]=+(c[lb>>2]|0);c[Q>>2]=3;mb=n;sa=200}else if((xa|0)==5){h[P>>3]=+Ca(3384);c[Q>>2]=3;mb=n;sa=200}else if((xa|0)==3){if((lb|0)==0){sa=209}else{mb=lb;sa=200}}else{sa=209}do{if((sa|0)==200){sa=0;do{if((c[ib+8>>2]|0)==5){Db(b,ib);if((Rb(b,-1,3264)|0)==0){nb=ib;break}xa=c[D>>2]|0;Hb(b,-1);nb=(c[xa-16+8>>2]|0)==5?ib:xa-16|0}else{nb=ib}}while(0);xa=c[nb+8>>2]|0;if((xa|0)==1){ob=+(c[nb>>2]|0)}else if((xa|0)==5){ob=+Ca(3384)}else if((xa|0)==3){if((nb|0)==0){sa=209;break}ob=+h[nb>>3]}else{sa=209;break}kb=+h[mb>>3];h[ua>>3]=kb-ob*+O(kb/ob);c[ja+(ta<<4)+8>>2]=3}}while(0);h:do{if((sa|0)==209){sa=0;xa=He(b,hb,9)|0;do{if((c[xa+8>>2]|0)==0){pa=He(b,ib,9)|0;if((c[pa+8>>2]|0)!=0){pb=pa;break}Lc(b,hb,ib);break h}else{pb=xa}}while(0);xa=ua-(c[E>>2]|0)|0;pa=c[D>>2]|0;ka=pb;na=pa;ia=c[ka+4>>2]|0;c[na>>2]=c[ka>>2];c[na+4>>2]=ia;c[pa+8>>2]=c[pb+8>>2];pa=c[D>>2]|0;ia=hb;na=pa+16|0;ka=c[ia+4>>2]|0;c[na>>2]=c[ia>>2];c[na+4>>2]=ka;c[pa+24>>2]=c[oa>>2];pa=c[D>>2]|0;ka=ib;na=pa+32|0;ia=c[ka+4>>2]|0;c[na>>2]=c[ka>>2];c[na+4>>2]=ia;c[pa+40>>2]=c[ib+8>>2];pa=c[D>>2]|0;if(((c[F>>2]|0)-pa|0)<49){Sc(b,3);qb=c[D>>2]|0}else{qb=pa}c[D>>2]=qb+48;Wc(b,qb,1);pa=c[E>>2]|0;ia=c[D>>2]|0;na=ia-16|0;c[D>>2]=na;ka=na;na=pa+xa|0;ma=c[ka+4>>2]|0;c[na>>2]=c[ka>>2];c[na+4>>2]=ma;c[pa+(xa+8)>>2]=c[ia-16+8>>2]}}while(0);aa=c[w>>2]|0;fa=ga;continue c;break};case 17:{oa=ha>>>23;if((oa&256|0)==0){rb=ja+(oa<<4)|0}else{rb=ca+((oa&255)<<4)|0}oa=ha>>>14;if((oa&256|0)==0){sb=ja+((oa&511)<<4)|0}else{sb=ca+((oa&255)<<4)|0}oa=rb+8|0;ia=c[oa>>2]|0;do{if((ia|0)==3){if((c[sb+8>>2]|0)==3){h[ua>>3]=+R(+(+h[rb>>3]),+(+h[sb>>3]));c[ja+(ta<<4)+8>>2]=3;aa=ja;fa=ga;continue c}else{c[u>>2]=ga;tb=rb;break}}else{c[u>>2]=ga;if((ia|0)!=5){tb=rb;break}Db(b,rb);if((Rb(b,-1,3264)|0)==0){tb=rb;break}xa=c[D>>2]|0;Hb(b,-1);tb=(c[xa-16+8>>2]|0)==5?rb:xa-16|0}}while(0);ia=c[tb+8>>2]|0;if((ia|0)==1){h[S>>3]=+(c[tb>>2]|0);c[T>>2]=3;ub=m;sa=233}else if((ia|0)==5){h[S>>3]=+Ca(3384);c[T>>2]=3;ub=m;sa=233}else if((ia|0)==3){if((tb|0)==0){sa=242}else{ub=tb;sa=233}}else{sa=242}do{if((sa|0)==233){sa=0;do{if((c[sb+8>>2]|0)==5){Db(b,sb);if((Rb(b,-1,3264)|0)==0){vb=sb;break}ia=c[D>>2]|0;Hb(b,-1);vb=(c[ia-16+8>>2]|0)==5?sb:ia-16|0}else{vb=sb}}while(0);ia=c[vb+8>>2]|0;if((ia|0)==1){wb=+(c[vb>>2]|0)}else if((ia|0)==5){wb=+Ca(3384)}else if((ia|0)==3){if((vb|0)==0){sa=242;break}wb=+h[vb>>3]}else{sa=242;break}h[ua>>3]=+R(+(+h[ub>>3]),+wb);c[ja+(ta<<4)+8>>2]=3}}while(0);i:do{if((sa|0)==242){sa=0;ia=He(b,rb,10)|0;do{if((c[ia+8>>2]|0)==0){xa=He(b,sb,10)|0;if((c[xa+8>>2]|0)!=0){xb=xa;break}Lc(b,rb,sb);break i}else{xb=ia}}while(0);ia=ua-(c[E>>2]|0)|0;xa=c[D>>2]|0;pa=xb;ma=xa;na=c[pa+4>>2]|0;c[ma>>2]=c[pa>>2];c[ma+4>>2]=na;c[xa+8>>2]=c[xb+8>>2];xa=c[D>>2]|0;na=rb;ma=xa+16|0;pa=c[na+4>>2]|0;c[ma>>2]=c[na>>2];c[ma+4>>2]=pa;c[xa+24>>2]=c[oa>>2];xa=c[D>>2]|0;pa=sb;ma=xa+32|0;na=c[pa+4>>2]|0;c[ma>>2]=c[pa>>2];c[ma+4>>2]=na;c[xa+40>>2]=c[sb+8>>2];xa=c[D>>2]|0;if(((c[F>>2]|0)-xa|0)<49){Sc(b,3);yb=c[D>>2]|0}else{yb=xa}c[D>>2]=yb+48;Wc(b,yb,1);xa=c[E>>2]|0;na=c[D>>2]|0;ma=na-16|0;c[D>>2]=ma;pa=ma;ma=xa+ia|0;ka=c[pa+4>>2]|0;c[ma>>2]=c[pa>>2];c[ma+4>>2]=ka;c[xa+(ia+8)>>2]=c[na-16+8>>2]}}while(0);aa=c[w>>2]|0;fa=ga;continue c;break};case 18:{oa=ha>>>23;na=ja+(oa<<4)|0;ia=ja+(oa<<4)+8|0;oa=c[ia>>2]|0;if((oa|0)==3){h[ua>>3]=-0.0- +h[na>>3];c[ja+(ta<<4)+8>>2]=3;aa=ja;fa=ga;continue c}c[u>>2]=ga;do{if((oa|0)==5){Db(b,na);if((Rb(b,-1,3264)|0)==0){zb=na;break}xa=c[D>>2]|0;Hb(b,-1);zb=(c[xa-16+8>>2]|0)==5?na:xa-16|0}else{zb=na}}while(0);oa=c[zb+8>>2]|0;if((oa|0)==1){h[U>>3]=+(c[zb>>2]|0);c[V>>2]=3;Ab=l;sa=258}else if((oa|0)==5){h[U>>3]=+Ca(3384);c[V>>2]=3;Ab=l;sa=258}else if((oa|0)==3){if((zb|0)==0){sa=265}else{Ab=zb;sa=258}}else{sa=265}do{if((sa|0)==258){sa=0;do{if((c[ia>>2]|0)==5){Db(b,na);if((Rb(b,-1,3264)|0)==0){Bb=na;break}oa=c[D>>2]|0;Hb(b,-1);Bb=(c[oa-16+8>>2]|0)==5?na:oa-16|0}else{Bb=na}}while(0);oa=c[Bb+8>>2]|0;if((oa|0)==5){+Ca(3384)}else if((oa|0)==3){if((Bb|0)==0){sa=265;break}}else if((oa|0)!=1){sa=265;break}h[ua>>3]=-0.0- +h[Ab>>3];c[ja+(ta<<4)+8>>2]=3}}while(0);j:do{if((sa|0)==265){sa=0;oa=He(b,na,11)|0;do{if((c[oa+8>>2]|0)==0){xa=He(b,na,11)|0;if((c[xa+8>>2]|0)!=0){Cb=xa;break}Lc(b,na,na);break j}else{Cb=oa}}while(0);oa=ua-(c[E>>2]|0)|0;xa=c[D>>2]|0;ka=Cb;ma=xa;pa=c[ka+4>>2]|0;c[ma>>2]=c[ka>>2];c[ma+4>>2]=pa;c[xa+8>>2]=c[Cb+8>>2];xa=c[D>>2]|0;pa=na;ma=xa+16|0;ka=c[pa+4>>2]|0;c[ma>>2]=c[pa>>2];c[ma+4>>2]=ka;c[xa+24>>2]=c[ia>>2];xa=c[D>>2]|0;ka=xa+32|0;ma=c[pa+4>>2]|0;c[ka>>2]=c[pa>>2];c[ka+4>>2]=ma;c[xa+40>>2]=c[ia>>2];xa=c[D>>2]|0;if(((c[F>>2]|0)-xa|0)<49){Sc(b,3);Eb=c[D>>2]|0}else{Eb=xa}c[D>>2]=Eb+48;Wc(b,Eb,1);xa=c[E>>2]|0;ma=c[D>>2]|0;ka=ma-16|0;c[D>>2]=ka;pa=ka;ka=xa+oa|0;la=c[pa+4>>2]|0;c[ka>>2]=c[pa>>2];c[ka+4>>2]=la;c[xa+(oa+8)>>2]=c[ma-16+8>>2]}}while(0);aa=c[w>>2]|0;fa=ga;continue c;break};case 19:{ia=ha>>>23;na=ja+(ia<<4)|0;ma=c[ja+(ia<<4)+8>>2]|0;do{if((ma|0)==0){Fb=1}else if((ma|0)==1){if((c[na>>2]|0)==0){Fb=1}else{sa=275}}else if((ma|0)==3){if(+h[na>>3]==0.0){Fb=1}else{sa=275}}else{if((ma|0)!=4){Fb=0;break}Fb=(c[(c[na>>2]|0)+12>>2]|0)==0|0}}while(0);if((sa|0)==275){sa=0;Fb=0}c[ua>>2]=Fb;c[ja+(ta<<4)+8>>2]=1;aa=ja;fa=ga;continue c;break};case 21:{na=ha>>>23;ma=ha>>>14&511;c[u>>2]=ga;Re(b,1-na+ma|0,ma);ma=c[C>>2]|0;if(!((c[ma+68>>2]|0)>>>0<(c[ma+64>>2]|0)>>>0)){pd(b)}ma=c[w>>2]|0;ia=ma+(na<<4)|0;oa=ma+(ta<<4)|0;xa=c[ia+4>>2]|0;c[oa>>2]=c[ia>>2];c[oa+4>>2]=xa;c[ma+(ta<<4)+8>>2]=c[ma+(na<<4)+8>>2];aa=ma;fa=ga;continue c;break};case 22:{aa=ja;fa=fa+((ha>>>14)-131070<<2)|0;continue c;break};case 23:{ma=ha>>>23;if((ma&256|0)==0){Gb=ja+(ma<<4)|0}else{Gb=ca+((ma&255)<<4)|0}ma=ha>>>14;if((ma&256|0)==0){Ib=ja+((ma&511)<<4)|0}else{Ib=ca+((ma&255)<<4)|0}c[u>>2]=ga;if((c[Gb+8>>2]|0)==(c[Ib+8>>2]|0)){Jb=(Qe(b,Gb,Ib)|0)!=0|0}else{Jb=0}if((Jb|0)==(ta|0)){Kb=fa+(((c[ga>>2]|0)>>>14)-131070<<2)|0}else{Kb=ga}aa=c[w>>2]|0;fa=Kb+4|0;continue c;break};case 24:{c[u>>2]=ga;ma=ha>>>23;if((ma&256|0)==0){Lb=ja+(ma<<4)|0}else{Lb=ca+((ma&255)<<4)|0}ma=ha>>>14;if((ma&256|0)==0){Mb=ja+((ma&511)<<4)|0}else{Mb=ca+((ma&255)<<4)|0}if((Pe(b,Lb,Mb)|0)==(ta|0)){Nb=fa+(((c[ga>>2]|0)>>>14)-131070<<2)|0}else{Nb=ga}aa=c[w>>2]|0;fa=Nb+4|0;continue c;break};case 25:{c[u>>2]=ga;ma=ha>>>23;if((ma&256|0)==0){Ob=ja+(ma<<4)|0}else{Ob=ca+((ma&255)<<4)|0}ma=ha>>>14;if((ma&256|0)==0){Pb=ja+((ma&511)<<4)|0}else{Pb=ca+((ma&255)<<4)|0}ma=Ob+8|0;na=c[ma>>2]|0;xa=Pb+8|0;do{if((na|0)==(c[xa>>2]|0)){if((na|0)==3){Qb=+h[Ob>>3]<=+h[Pb>>3]|0;break}else if((na|0)!=4){sa=329;break}oa=c[Ob>>2]|0;ia=c[Pb>>2]|0;la=oa+16|0;ka=ia+16|0;pa=_e(la,ka)|0;k:do{if((pa|0)==0){Sb=la;Tb=c[oa+12>>2]|0;Ub=ka;Vb=c[ia+12>>2]|0;while(1){Wb=qf(Sb|0)|0;Xb=(Wb|0)==(Tb|0);if((Wb|0)==(Vb|0)){break}if(Xb){Yb=-1;break k}Zb=Wb+1|0;Wb=Sb+Zb|0;_b=Ub+Zb|0;$b=_e(Wb,_b)|0;if(($b|0)==0){Sb=Wb;Tb=Tb-Zb|0;Ub=_b;Vb=Vb-Zb|0}else{Yb=$b;break k}}Yb=Xb&1^1}else{Yb=pa}}while(0);Qb=(Yb|0)<1|0}else{sa=329}}while(0);do{if((sa|0)==329){sa=0;na=He(b,Ob,14)|0;pa=na+8|0;if((c[pa>>2]|0)!=0){He(b,Pb,14)|0;ia=c[D>>2]|0;ka=ia-(c[E>>2]|0)|0;oa=na;na=ia;la=c[oa+4>>2]|0;c[na>>2]=c[oa>>2];c[na+4>>2]=la;c[ia+8>>2]=c[pa>>2];pa=c[D>>2]|0;ia=Ob;la=pa+16|0;na=c[ia+4>>2]|0;c[la>>2]=c[ia>>2];c[la+4>>2]=na;c[pa+24>>2]=c[ma>>2];pa=c[D>>2]|0;na=Pb;la=pa+32|0;ia=c[na+4>>2]|0;c[la>>2]=c[na>>2];c[la+4>>2]=ia;c[pa+40>>2]=c[xa>>2];pa=c[D>>2]|0;if(((c[F>>2]|0)-pa|0)<49){Sc(b,3);ac=c[D>>2]|0}else{ac=pa}c[D>>2]=ac+48;Wc(b,ac,1);pa=c[E>>2]|0;ia=c[D>>2]|0;la=ia-16|0;c[D>>2]=la;na=la;la=pa+ka|0;oa=c[na+4>>2]|0;c[la>>2]=c[na>>2];c[la+4>>2]=oa;c[pa+(ka+8)>>2]=c[ia-16+8>>2];ia=c[D>>2]|0;ka=c[ia+8>>2]|0;if((ka|0)==1){if((c[ia>>2]|0)==0){Qb=0;break}}else if((ka|0)==3){if(+h[ia>>3]==0.0){Qb=0;break}}else if((ka|0)==0){Qb=0;break}else{if((ka|0)!=4){Qb=1;break}Qb=(c[(c[ia>>2]|0)+12>>2]|0)!=0|0;break}Qb=1;break}ia=He(b,Pb,13)|0;ka=ia+8|0;if((c[ka>>2]|0)==0){Qb=Mc(b,Ob,Pb)|0;break}He(b,Ob,13)|0;pa=c[D>>2]|0;oa=pa-(c[E>>2]|0)|0;la=ia;ia=pa;na=c[la+4>>2]|0;c[ia>>2]=c[la>>2];c[ia+4>>2]=na;c[pa+8>>2]=c[ka>>2];ka=c[D>>2]|0;pa=Pb;na=ka+16|0;ia=c[pa+4>>2]|0;c[na>>2]=c[pa>>2];c[na+4>>2]=ia;c[ka+24>>2]=c[xa>>2];ka=c[D>>2]|0;ia=Ob;na=ka+32|0;pa=c[ia+4>>2]|0;c[na>>2]=c[ia>>2];c[na+4>>2]=pa;c[ka+40>>2]=c[ma>>2];ka=c[D>>2]|0;if(((c[F>>2]|0)-ka|0)<49){Sc(b,3);bc=c[D>>2]|0}else{bc=ka}c[D>>2]=bc+48;Wc(b,bc,1);ka=c[E>>2]|0;pa=c[D>>2]|0;na=pa-16|0;c[D>>2]=na;ia=na;na=ka+oa|0;la=c[ia+4>>2]|0;c[na>>2]=c[ia>>2];c[na+4>>2]=la;c[ka+(oa+8)>>2]=c[pa-16+8>>2];pa=c[D>>2]|0;oa=c[pa+8>>2]|0;if((oa|0)==1){if((c[pa>>2]|0)==0){Qb=1;break}}else if((oa|0)==3){if(+h[pa>>3]==0.0){Qb=1;break}}else if((oa|0)==0){Qb=1;break}else{if((oa|0)!=4){Qb=0;break}Qb=(c[(c[pa>>2]|0)+12>>2]|0)==0|0;break}Qb=0}}while(0);if((Qb|0)==(ta|0)){cc=fa+(((c[ga>>2]|0)>>>14)-131070<<2)|0}else{cc=ga}aa=c[w>>2]|0;fa=cc+4|0;continue c;break};case 26:{ma=c[ja+(ta<<4)+8>>2]|0;do{if((ma|0)==1){if((c[ua>>2]|0)==0){dc=1}else{sa=354}}else if((ma|0)==3){if(+h[ua>>3]==0.0){dc=1}else{sa=354}}else if((ma|0)==0){dc=1}else{if((ma|0)!=4){dc=0;break}dc=(c[(c[ua>>2]|0)+12>>2]|0)==0|0}}while(0);if((sa|0)==354){sa=0;dc=0}if((dc|0)==(ha>>>14&511|0)){ec=ga}else{ec=fa+(((c[ga>>2]|0)>>>14)-131070<<2)|0}aa=ja;fa=ec+4|0;continue c;break};case 27:{ma=ha>>>23;xa=ja+(ma<<4)|0;pa=c[ja+(ma<<4)+8>>2]|0;do{if((pa|0)==1){if((c[xa>>2]|0)==0){fc=1;gc=1}else{hc=1;sa=363}}else if((pa|0)==3){if(+h[xa>>3]==0.0){fc=1;gc=3}else{hc=3;sa=363}}else if((pa|0)==0){fc=1;gc=0}else{if((pa|0)!=4){fc=0;gc=pa;break}fc=(c[(c[xa>>2]|0)+12>>2]|0)==0|0;gc=4}}while(0);if((sa|0)==363){sa=0;fc=0;gc=hc}if((fc|0)==(ha>>>14&511|0)){ic=ga}else{pa=xa;ma=ua;oa=c[pa+4>>2]|0;c[ma>>2]=c[pa>>2];c[ma+4>>2]=oa;c[ja+(ta<<4)+8>>2]=gc;ic=fa+(((c[ga>>2]|0)>>>14)-131070<<2)|0}aa=ja;fa=ic+4|0;continue c;break};case 28:{oa=ha>>>23;ma=ha>>>14&511;if((oa|0)!=0){c[D>>2]=ja+(ta+oa<<4)}c[u>>2]=ga;oa=Uc(b,ua,ma-1|0)|0;if((oa|0)==0){sa=372;break b}else if((oa|0)!=1){sa=463;break a}if((ma|0)!=0){c[D>>2]=c[(c[v>>2]|0)+8>>2]}aa=c[w>>2]|0;fa=ga;continue c;break};case 29:{ma=ha>>>23;if((ma|0)!=0){c[D>>2]=ja+(ta+ma<<4)}c[u>>2]=ga;ma=Uc(b,ua,-1)|0;if((ma|0)==0){break c}else if((ma|0)!=1){sa=463;break a}aa=c[w>>2]|0;fa=ga;continue c;break};case 30:{break b;break};case 31:{kb=+h[ja+(ta+2<<4)>>3];ma=ua|0;jb=kb+ +h[ma>>3];jc=+h[ja+(ta+1<<4)>>3];if(kb>0.0){if(jb>jc){aa=ja;fa=ga;continue c}}else{if(jc>jb){aa=ja;fa=ga;continue c}}h[ma>>3]=jb;c[ja+(ta<<4)+8>>2]=3;ma=ta+3|0;h[ja+(ma<<4)>>3]=jb;c[ja+(ma<<4)+8>>2]=3;aa=ja;fa=fa+((ha>>>14)-131070<<2)|0;continue c;break};case 32:{ma=ta+1|0;oa=ja+(ma<<4)|0;pa=ta+2|0;ka=ja+(pa<<4)|0;c[u>>2]=ga;la=ja+(ta<<4)+8|0;na=c[la>>2]|0;l:do{if((na|0)==3){sa=406}else{do{if((na|0)==4){if((Td((c[ua>>2]|0)+16|0,k)|0)==0){kc=c[la>>2]|0;sa=401;break}else{h[ua>>3]=+h[k>>3];sa=404;break}}else{kc=na;sa=401}}while(0);do{if((sa|0)==401){sa=0;if((kc|0)==1){h[ua>>3]=+(c[ua>>2]|0);sa=404;break}else if((kc|0)==5){h[ua>>3]=+Ca(3384);c[la>>2]=3;sa=406;break l}else{break}}}while(0);if((sa|0)==404){sa=0;c[la>>2]=3;if((ua|0)!=0){sa=406;break}}Jc(b,904,(lc=i,i=i+1|0,i=i+7&-8,c[lc>>2]=0,lc)|0);i=lc}}while(0);m:do{if((sa|0)==406){sa=0;na=ja+(ma<<4)+8|0;xa=c[na>>2]|0;n:do{if((xa|0)!=3){do{if((xa|0)==4){if((Td((c[oa>>2]|0)+16|0,j)|0)==0){mc=c[na>>2]|0;break}else{h[oa>>3]=+h[j>>3];c[na>>2]=3;break n}}else{mc=xa}}while(0);if((mc|0)==1){h[oa>>3]=+(c[oa>>2]|0);c[na>>2]=3;break}else if((mc|0)==5){h[oa>>3]=+Ca(3384);c[na>>2]=3;break}else{Jc(b,784,(lc=i,i=i+1|0,i=i+7&-8,c[lc>>2]=0,lc)|0);i=lc;break m}}}while(0);na=ja+(pa<<4)+8|0;xa=c[na>>2]|0;if((xa|0)==3){break}do{if((xa|0)==4){if((Td((c[ka>>2]|0)+16|0,g)|0)==0){nc=c[na>>2]|0;break}else{h[ka>>3]=+h[g>>3];c[na>>2]=3;break m}}else{nc=xa}}while(0);if((nc|0)==1){h[ka>>3]=+(c[ka>>2]|0);c[na>>2]=3;break}else if((nc|0)==5){h[ka>>3]=+Ca(3384);c[na>>2]=3;break}else{sa=423;break a}}}while(0);pa=ua|0;h[pa>>3]=+h[pa>>3]- +h[ka>>3];c[la>>2]=3;aa=ja;fa=fa+((ha>>>14)-131070<<2)|0;continue c;break};case 33:{pa=ta+3|0;oa=ja+(pa<<4)|0;ma=ta+2|0;xa=ta+5|0;ia=ja+(ma<<4)|0;Vb=ja+(xa<<4)|0;Ub=c[ia+4>>2]|0;c[Vb>>2]=c[ia>>2];c[Vb+4>>2]=Ub;c[ja+(xa<<4)+8>>2]=c[ja+(ma<<4)+8>>2];xa=ta+1|0;Ub=ta+4|0;Vb=ja+(xa<<4)|0;ia=ja+(Ub<<4)|0;Tb=c[Vb+4>>2]|0;c[ia>>2]=c[Vb>>2];c[ia+4>>2]=Tb;c[ja+(Ub<<4)+8>>2]=c[ja+(xa<<4)+8>>2];xa=ua;Ub=oa;Tb=c[xa+4>>2]|0;c[Ub>>2]=c[xa>>2];c[Ub+4>>2]=Tb;c[ja+(pa<<4)+8>>2]=c[ja+(ta<<4)+8>>2];c[D>>2]=ja+(ta+6<<4);c[u>>2]=ga;Wc(b,oa,ha>>>14&511);oa=c[w>>2]|0;c[D>>2]=c[(c[v>>2]|0)+8>>2];Tb=c[oa+(pa<<4)+8>>2]|0;if((Tb|0)==0){oc=ga}else{Ub=oa+(pa<<4)|0;pa=oa+(ma<<4)|0;xa=c[Ub+4>>2]|0;c[pa>>2]=c[Ub>>2];c[pa+4>>2]=xa;c[oa+(ma<<4)+8>>2]=Tb;oc=fa+(((c[ga>>2]|0)>>>14)-131070<<2)|0}aa=oa;fa=oc+4|0;continue c;break};case 34:{oa=ha>>>23;Tb=ha>>>14&511;if((oa|0)==0){ma=((c[D>>2]|0)-ua>>4)-1|0;c[D>>2]=c[(c[v>>2]|0)+8>>2];pc=ma}else{pc=oa}if((Tb|0)==0){qc=fa+8|0;rc=c[ga>>2]|0}else{qc=ga;rc=Tb}if((c[ja+(ta<<4)+8>>2]|0)!=5){aa=ja;fa=qc;continue c}Tb=c[ua>>2]|0;oa=Tb;ma=pc-50+(rc*50|0)|0;if((ma|0)>(c[Tb+28>>2]|0)){te(b,oa,ma)}if((pc|0)<=0){aa=ja;fa=qc;continue c}xa=Tb+5|0;Tb=ma;ma=pc;while(1){pa=ma+ta|0;Ub=ja+(pa<<4)|0;ia=Tb-1|0;Vb=Ce(b,oa,Tb)|0;Sb=Ub;$b=Vb;Zb=c[Sb+4>>2]|0;c[$b>>2]=c[Sb>>2];c[$b+4>>2]=Zb;Zb=ja+(pa<<4)+8|0;c[Vb+8>>2]=c[Zb>>2];do{if((c[Zb>>2]|0)>3){if((a[(c[Ub>>2]|0)+5|0]&3)==0){break}if((a[xa]&4)==0){break}ud(b,oa)}}while(0);Ub=ma-1|0;if((Ub|0)>0){Tb=ia;ma=Ub}else{aa=ja;fa=qc;continue c}}break};case 35:{gd(b,ua);aa=ja;fa=ga;continue c;break};case 36:{ma=c[(c[(c[ba>>2]|0)+16>>2]|0)+(ha>>>14<<2)>>2]|0;Tb=a[ma+72|0]|0;oa=Tb&255;xa=cd(b,oa,c[ea>>2]|0)|0;la=xa;c[xa+16>>2]=ma;if(Tb<<24>>24==0){sc=ga}else{ma=(Tb&255)>>>0>1>>>0;Tb=0;ka=ga;while(1){Ub=c[ka>>2]|0;Zb=Ub>>>23;if((Ub&63|0)==4){c[la+20+(Tb<<2)>>2]=c[da+(Zb<<2)>>2]}else{c[la+20+(Tb<<2)>>2]=ed(b,ja+(Zb<<4)|0)|0}Zb=Tb+1|0;if((Zb|0)<(oa|0)){Tb=Zb;ka=ka+4|0}else{break}}sc=fa+((ma?oa+1|0:2)<<2)|0}c[ua>>2]=xa;c[ja+(ta<<4)+8>>2]=6;c[u>>2]=sc;ka=c[C>>2]|0;if(!((c[ka+68>>2]|0)>>>0<(c[ka+64>>2]|0)>>>0)){pd(b)}aa=c[w>>2]|0;fa=sc;continue c;break};case 37:{ka=ha>>>23;Tb=ka-1|0;la=c[v>>2]|0;Zb=la|0;Ub=((c[Zb>>2]|0)-(c[la+4>>2]|0)>>4)-(d[(c[ba>>2]|0)+73|0]|0)|0;la=Ub-1|0;if((ka|0)==0){c[u>>2]=ga;if(((c[F>>2]|0)-(c[D>>2]|0)|0)<=(la<<4|0)){Sc(b,la)}ka=c[w>>2]|0;c[D>>2]=ka+(la+ta<<4);tc=ka;uc=ka+(ta<<4)|0;vc=la}else{tc=ja;uc=ua;vc=Tb}if((vc|0)<=0){aa=tc;fa=ga;continue c}Tb=1-Ub|0;Ub=0;while(1){if((Ub|0)<(la|0)){ka=c[Zb>>2]|0;na=Ub+Tb|0;Vb=ka+(na<<4)|0;pa=uc+(Ub<<4)|0;$b=c[Vb+4>>2]|0;c[pa>>2]=c[Vb>>2];c[pa+4>>2]=$b;c[uc+(Ub<<4)+8>>2]=c[ka+(na<<4)+8>>2]}else{c[uc+(Ub<<4)+8>>2]=0}na=Ub+1|0;if((na|0)<(vc|0)){Ub=na}else{aa=tc;fa=ga;continue c}}break};default:{aa=ja;fa=ga;continue c}}}aa=c[v>>2]|0;ba=aa-24+4|0;da=c[ba>>2]|0;ea=c[aa+4>>2]|0;ca=aa-24|0;if((c[_>>2]|0)==0){wc=da}else{gd(b,c[ca>>2]|0);wc=c[ba>>2]|0}ba=wc+((c[aa>>2]|0)-ea>>4<<4)|0;c[ca>>2]=ba;c[w>>2]=ba;if(ea>>>0<(c[D>>2]|0)>>>0){ba=0;ca=ea;Ub=da;while(1){Tb=ca;Zb=Ub;la=c[Tb+4>>2]|0;c[Zb>>2]=c[Tb>>2];c[Zb+4>>2]=la;c[da+(ba<<4)+8>>2]=c[ea+(ba<<4)+8>>2];la=ba+1|0;Zb=ea+(la<<4)|0;Tb=da+(la<<4)|0;if(Zb>>>0<(c[D>>2]|0)>>>0){ba=la;ca=Zb;Ub=Tb}else{xc=Tb;break}}}else{xc=da}c[D>>2]=xc;c[aa-24+8>>2]=xc;c[aa-24+12>>2]=c[u>>2];Ub=aa-24+20|0;c[Ub>>2]=(c[Ub>>2]|0)+1;Ub=(c[v>>2]|0)-24|0;c[v>>2]=Ub;e=Ub}if((sa|0)==372){sa=0;$=$+1|0;continue}e=ha>>>23;if((e|0)!=0){c[D>>2]=ja+(e-1+ta<<4)}if((c[_>>2]|0)!=0){gd(b,ja)}c[u>>2]=ga;e=Vc(b,ua)|0;Ub=$-1|0;if((Ub|0)==0){sa=463;break}if((e|0)==0){$=Ub;continue}c[D>>2]=c[(c[v>>2]|0)+8>>2];$=Ub}if((sa|0)==18){c[u>>2]=fa;i=f;return}else if((sa|0)==423){Jc(b,672,(lc=i,i=i+1|0,i=i+7&-8,c[lc>>2]=0,lc)|0);i=lc}else if((sa|0)==463){i=f;return}}function Te(a){a=a|0;var b=0,e=0,f=0,g=0,h=0;b=i;i=i+8|0;e=b|0;f=jb[c[a+12>>2]&3](c[a+20>>2]|0,c[a+16>>2]|0,e)|0;if((f|0)==0){g=-1;i=b;return g|0}h=c[e>>2]|0;if((h|0)==0){g=-1;i=b;return g|0}c[a>>2]=h-1;c[a+8>>2]=f+1;g=d[f]|0;i=b;return g|0}function Ue(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,j=0,k=0;b=i;i=i+8|0;e=b|0;f=a|0;do{if((c[f>>2]|0)==0){g=jb[c[a+12>>2]&3](c[a+20>>2]|0,c[a+16>>2]|0,e)|0;if((g|0)==0){h=-1;i=b;return h|0}j=c[e>>2]|0;if((j|0)==0){h=-1;i=b;return h|0}else{c[f>>2]=j;c[a+8>>2]=g;k=g;break}}else{k=c[a+8>>2]|0}}while(0);h=d[k]|0;i=b;return h|0}function Ve(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;c[b+20>>2]=a;c[b+12>>2]=d;c[b+16>>2]=e;c[b+4>>2]=0;c[b>>2]=0;c[b+8>>2]=0;return}function We(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;e=i;i=i+8|0;f=e|0;if((d|0)==0){g=0;i=e;return g|0}h=a|0;j=a+20|0;k=a+12|0;l=a+16|0;m=a+8|0;n=a+4|0;a=b;b=d;d=c[h>>2]|0;while(1){if((d|0)==0){o=jb[c[k>>2]&3](c[j>>2]|0,c[l>>2]|0,f)|0;if((o|0)==0){g=b;p=12;break}q=c[f>>2]|0;if((q|0)==0){g=b;p=12;break}c[h>>2]=q;c[m>>2]=o;r=q}else{r=d}q=b>>>0>r>>>0?r:b;if((a|0)==0){s=0;t=r}else{rf(a|0,c[m>>2]|0,q)|0;s=1;t=c[h>>2]|0}o=t-q|0;c[h>>2]=o;c[n>>2]=(c[n>>2]|0)+q;c[m>>2]=(c[m>>2]|0)+q;if(s){u=a+q|0}else{u=a}if((b|0)==(q|0)){g=0;p=12;break}else{a=u;b=b-q|0;d=o}}if((p|0)==12){i=e;return g|0}return 0}function Xe(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;e=b+8|0;f=c[e>>2]|0;if(!(f>>>0<d>>>0)){g=c[b>>2]|0;return g|0}h=d>>>0<32>>>0?32:d;if((h+1|0)>>>0<4294967294>>>0){d=b|0;i=Nd(a,c[d>>2]|0,f,h)|0;j=d}else{i=Od(a)|0;j=b|0}c[j>>2]=i;c[e>>2]=h;g=i;return g|0}function Ye(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0;b=i;i=i+1040|0;d=b|0;e=Vb()|0;Sb(e,d);Gb(e,0);Tb(e,a,qf(a|0)|0,c)|0;c=Qb(e,4,d)|0;Ua(10)|0;i=b;return c|0}function Ze(a,b,c,e){a=a|0;b=b|0;c=c|0;e=e|0;var f=0;e=i;if((c|0)==0){i=e;return 0}else{f=0}do{Qa(2680,d[b+f|0]|0|0)|0;f=f+1|0;}while(f>>>0<c>>>0);i=e;return 0}function _e(a,b){a=a|0;b=b|0;return pf(a,b)|0}function $e(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0;do{if(a>>>0<245>>>0){if(a>>>0<11>>>0){b=16}else{b=a+11&-8}d=b>>>3;e=c[852]|0;f=e>>>(d>>>0);if((f&3|0)!=0){g=(f&1^1)+d|0;h=g<<1;i=3448+(h<<2)|0;j=3448+(h+2<<2)|0;h=c[j>>2]|0;k=h+8|0;l=c[k>>2]|0;do{if((i|0)==(l|0)){c[852]=e&~(1<<g)}else{if(l>>>0<(c[856]|0)>>>0){qa();return 0}m=l+12|0;if((c[m>>2]|0)==(h|0)){c[m>>2]=i;c[j>>2]=l;break}else{qa();return 0}}}while(0);l=g<<3;c[h+4>>2]=l|3;j=h+(l|4)|0;c[j>>2]=c[j>>2]|1;n=k;return n|0}if(!(b>>>0>(c[854]|0)>>>0)){o=b;break}if((f|0)!=0){j=2<<d;l=f<<d&(j|-j);j=(l&-l)-1|0;l=j>>>12&16;i=j>>>(l>>>0);j=i>>>5&8;m=i>>>(j>>>0);i=m>>>2&4;p=m>>>(i>>>0);m=p>>>1&2;q=p>>>(m>>>0);p=q>>>1&1;r=(j|l|i|m|p)+(q>>>(p>>>0))|0;p=r<<1;q=3448+(p<<2)|0;m=3448+(p+2<<2)|0;p=c[m>>2]|0;i=p+8|0;l=c[i>>2]|0;do{if((q|0)==(l|0)){c[852]=e&~(1<<r)}else{if(l>>>0<(c[856]|0)>>>0){qa();return 0}j=l+12|0;if((c[j>>2]|0)==(p|0)){c[j>>2]=q;c[m>>2]=l;break}else{qa();return 0}}}while(0);l=r<<3;m=l-b|0;c[p+4>>2]=b|3;q=p;e=q+b|0;c[q+(b|4)>>2]=m|1;c[q+l>>2]=m;l=c[854]|0;if((l|0)!=0){q=c[857]|0;d=l>>>3;l=d<<1;f=3448+(l<<2)|0;k=c[852]|0;h=1<<d;do{if((k&h|0)==0){c[852]=k|h;s=f;t=3448+(l+2<<2)|0}else{d=3448+(l+2<<2)|0;g=c[d>>2]|0;if(!(g>>>0<(c[856]|0)>>>0)){s=g;t=d;break}qa();return 0}}while(0);c[t>>2]=q;c[s+12>>2]=q;c[q+8>>2]=s;c[q+12>>2]=f}c[854]=m;c[857]=e;n=i;return n|0}l=c[853]|0;if((l|0)==0){o=b;break}h=(l&-l)-1|0;l=h>>>12&16;k=h>>>(l>>>0);h=k>>>5&8;p=k>>>(h>>>0);k=p>>>2&4;r=p>>>(k>>>0);p=r>>>1&2;d=r>>>(p>>>0);r=d>>>1&1;g=c[3712+((h|l|k|p|r)+(d>>>(r>>>0))<<2)>>2]|0;r=g;d=g;p=(c[g+4>>2]&-8)-b|0;while(1){g=c[r+16>>2]|0;if((g|0)==0){k=c[r+20>>2]|0;if((k|0)==0){break}else{u=k}}else{u=g}g=(c[u+4>>2]&-8)-b|0;k=g>>>0<p>>>0;r=u;d=k?u:d;p=k?g:p}r=d;i=c[856]|0;if(r>>>0<i>>>0){qa();return 0}e=r+b|0;m=e;if(!(r>>>0<e>>>0)){qa();return 0}e=c[d+24>>2]|0;f=c[d+12>>2]|0;do{if((f|0)==(d|0)){q=d+20|0;g=c[q>>2]|0;if((g|0)==0){k=d+16|0;l=c[k>>2]|0;if((l|0)==0){v=0;break}else{w=l;x=k}}else{w=g;x=q}while(1){q=w+20|0;g=c[q>>2]|0;if((g|0)!=0){w=g;x=q;continue}q=w+16|0;g=c[q>>2]|0;if((g|0)==0){break}else{w=g;x=q}}if(x>>>0<i>>>0){qa();return 0}else{c[x>>2]=0;v=w;break}}else{q=c[d+8>>2]|0;if(q>>>0<i>>>0){qa();return 0}g=q+12|0;if((c[g>>2]|0)!=(d|0)){qa();return 0}k=f+8|0;if((c[k>>2]|0)==(d|0)){c[g>>2]=f;c[k>>2]=q;v=f;break}else{qa();return 0}}}while(0);a:do{if((e|0)!=0){f=c[d+28>>2]|0;i=3712+(f<<2)|0;do{if((d|0)==(c[i>>2]|0)){c[i>>2]=v;if((v|0)!=0){break}c[853]=c[853]&~(1<<f);break a}else{if(e>>>0<(c[856]|0)>>>0){qa();return 0}q=e+16|0;if((c[q>>2]|0)==(d|0)){c[q>>2]=v}else{c[e+20>>2]=v}if((v|0)==0){break a}}}while(0);if(v>>>0<(c[856]|0)>>>0){qa();return 0}c[v+24>>2]=e;f=c[d+16>>2]|0;do{if((f|0)!=0){if(f>>>0<(c[856]|0)>>>0){qa();return 0}else{c[v+16>>2]=f;c[f+24>>2]=v;break}}}while(0);f=c[d+20>>2]|0;if((f|0)==0){break}if(f>>>0<(c[856]|0)>>>0){qa();return 0}else{c[v+20>>2]=f;c[f+24>>2]=v;break}}}while(0);if(p>>>0<16>>>0){e=p+b|0;c[d+4>>2]=e|3;f=r+(e+4)|0;c[f>>2]=c[f>>2]|1}else{c[d+4>>2]=b|3;c[r+(b|4)>>2]=p|1;c[r+(p+b)>>2]=p;f=c[854]|0;if((f|0)!=0){e=c[857]|0;i=f>>>3;f=i<<1;q=3448+(f<<2)|0;k=c[852]|0;g=1<<i;do{if((k&g|0)==0){c[852]=k|g;y=q;z=3448+(f+2<<2)|0}else{i=3448+(f+2<<2)|0;l=c[i>>2]|0;if(!(l>>>0<(c[856]|0)>>>0)){y=l;z=i;break}qa();return 0}}while(0);c[z>>2]=e;c[y+12>>2]=e;c[e+8>>2]=y;c[e+12>>2]=q}c[854]=p;c[857]=m}n=d+8|0;return n|0}else{if(a>>>0>4294967231>>>0){o=-1;break}f=a+11|0;g=f&-8;k=c[853]|0;if((k|0)==0){o=g;break}r=-g|0;i=f>>>8;do{if((i|0)==0){A=0}else{if(g>>>0>16777215>>>0){A=31;break}f=(i+1048320|0)>>>16&8;l=i<<f;h=(l+520192|0)>>>16&4;j=l<<h;l=(j+245760|0)>>>16&2;B=14-(h|f|l)+(j<<l>>>15)|0;A=g>>>((B+7|0)>>>0)&1|B<<1}}while(0);i=c[3712+(A<<2)>>2]|0;b:do{if((i|0)==0){C=0;D=r;E=0}else{if((A|0)==31){F=0}else{F=25-(A>>>1)|0}d=0;m=r;p=i;q=g<<F;e=0;while(1){B=c[p+4>>2]&-8;l=B-g|0;if(l>>>0<m>>>0){if((B|0)==(g|0)){C=p;D=l;E=p;break b}else{G=p;H=l}}else{G=d;H=m}l=c[p+20>>2]|0;B=c[p+16+(q>>>31<<2)>>2]|0;j=(l|0)==0|(l|0)==(B|0)?e:l;if((B|0)==0){C=G;D=H;E=j;break}else{d=G;m=H;p=B;q=q<<1;e=j}}}}while(0);if((E|0)==0&(C|0)==0){i=2<<A;r=k&(i|-i);if((r|0)==0){o=g;break}i=(r&-r)-1|0;r=i>>>12&16;e=i>>>(r>>>0);i=e>>>5&8;q=e>>>(i>>>0);e=q>>>2&4;p=q>>>(e>>>0);q=p>>>1&2;m=p>>>(q>>>0);p=m>>>1&1;I=c[3712+((i|r|e|q|p)+(m>>>(p>>>0))<<2)>>2]|0}else{I=E}if((I|0)==0){J=D;K=C}else{p=I;m=D;q=C;while(1){e=(c[p+4>>2]&-8)-g|0;r=e>>>0<m>>>0;i=r?e:m;e=r?p:q;r=c[p+16>>2]|0;if((r|0)!=0){p=r;m=i;q=e;continue}r=c[p+20>>2]|0;if((r|0)==0){J=i;K=e;break}else{p=r;m=i;q=e}}}if((K|0)==0){o=g;break}if(!(J>>>0<((c[854]|0)-g|0)>>>0)){o=g;break}q=K;m=c[856]|0;if(q>>>0<m>>>0){qa();return 0}p=q+g|0;k=p;if(!(q>>>0<p>>>0)){qa();return 0}e=c[K+24>>2]|0;i=c[K+12>>2]|0;do{if((i|0)==(K|0)){r=K+20|0;d=c[r>>2]|0;if((d|0)==0){j=K+16|0;B=c[j>>2]|0;if((B|0)==0){L=0;break}else{M=B;N=j}}else{M=d;N=r}while(1){r=M+20|0;d=c[r>>2]|0;if((d|0)!=0){M=d;N=r;continue}r=M+16|0;d=c[r>>2]|0;if((d|0)==0){break}else{M=d;N=r}}if(N>>>0<m>>>0){qa();return 0}else{c[N>>2]=0;L=M;break}}else{r=c[K+8>>2]|0;if(r>>>0<m>>>0){qa();return 0}d=r+12|0;if((c[d>>2]|0)!=(K|0)){qa();return 0}j=i+8|0;if((c[j>>2]|0)==(K|0)){c[d>>2]=i;c[j>>2]=r;L=i;break}else{qa();return 0}}}while(0);c:do{if((e|0)!=0){i=c[K+28>>2]|0;m=3712+(i<<2)|0;do{if((K|0)==(c[m>>2]|0)){c[m>>2]=L;if((L|0)!=0){break}c[853]=c[853]&~(1<<i);break c}else{if(e>>>0<(c[856]|0)>>>0){qa();return 0}r=e+16|0;if((c[r>>2]|0)==(K|0)){c[r>>2]=L}else{c[e+20>>2]=L}if((L|0)==0){break c}}}while(0);if(L>>>0<(c[856]|0)>>>0){qa();return 0}c[L+24>>2]=e;i=c[K+16>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[856]|0)>>>0){qa();return 0}else{c[L+16>>2]=i;c[i+24>>2]=L;break}}}while(0);i=c[K+20>>2]|0;if((i|0)==0){break}if(i>>>0<(c[856]|0)>>>0){qa();return 0}else{c[L+20>>2]=i;c[i+24>>2]=L;break}}}while(0);d:do{if(J>>>0<16>>>0){e=J+g|0;c[K+4>>2]=e|3;i=q+(e+4)|0;c[i>>2]=c[i>>2]|1}else{c[K+4>>2]=g|3;c[q+(g|4)>>2]=J|1;c[q+(J+g)>>2]=J;i=J>>>3;if(J>>>0<256>>>0){e=i<<1;m=3448+(e<<2)|0;r=c[852]|0;j=1<<i;do{if((r&j|0)==0){c[852]=r|j;O=m;P=3448+(e+2<<2)|0}else{i=3448+(e+2<<2)|0;d=c[i>>2]|0;if(!(d>>>0<(c[856]|0)>>>0)){O=d;P=i;break}qa();return 0}}while(0);c[P>>2]=k;c[O+12>>2]=k;c[q+(g+8)>>2]=O;c[q+(g+12)>>2]=m;break}e=p;j=J>>>8;do{if((j|0)==0){Q=0}else{if(J>>>0>16777215>>>0){Q=31;break}r=(j+1048320|0)>>>16&8;i=j<<r;d=(i+520192|0)>>>16&4;B=i<<d;i=(B+245760|0)>>>16&2;l=14-(d|r|i)+(B<<i>>>15)|0;Q=J>>>((l+7|0)>>>0)&1|l<<1}}while(0);j=3712+(Q<<2)|0;c[q+(g+28)>>2]=Q;c[q+(g+20)>>2]=0;c[q+(g+16)>>2]=0;m=c[853]|0;l=1<<Q;if((m&l|0)==0){c[853]=m|l;c[j>>2]=e;c[q+(g+24)>>2]=j;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}l=c[j>>2]|0;if((Q|0)==31){R=0}else{R=25-(Q>>>1)|0}e:do{if((c[l+4>>2]&-8|0)==(J|0)){S=l}else{j=l;m=J<<R;while(1){T=j+16+(m>>>31<<2)|0;i=c[T>>2]|0;if((i|0)==0){break}if((c[i+4>>2]&-8|0)==(J|0)){S=i;break e}else{j=i;m=m<<1}}if(T>>>0<(c[856]|0)>>>0){qa();return 0}else{c[T>>2]=e;c[q+(g+24)>>2]=j;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break d}}}while(0);l=S+8|0;m=c[l>>2]|0;i=c[856]|0;if(S>>>0<i>>>0){qa();return 0}if(m>>>0<i>>>0){qa();return 0}else{c[m+12>>2]=e;c[l>>2]=e;c[q+(g+8)>>2]=m;c[q+(g+12)>>2]=S;c[q+(g+24)>>2]=0;break}}}while(0);n=K+8|0;return n|0}}while(0);K=c[854]|0;if(!(o>>>0>K>>>0)){S=K-o|0;T=c[857]|0;if(S>>>0>15>>>0){J=T;c[857]=J+o;c[854]=S;c[J+(o+4)>>2]=S|1;c[J+K>>2]=S;c[T+4>>2]=o|3}else{c[854]=0;c[857]=0;c[T+4>>2]=K|3;S=T+(K+4)|0;c[S>>2]=c[S>>2]|1}n=T+8|0;return n|0}T=c[855]|0;if(o>>>0<T>>>0){S=T-o|0;c[855]=S;T=c[858]|0;K=T;c[858]=K+o;c[K+(o+4)>>2]=S|1;c[T+4>>2]=o|3;n=T+8|0;return n|0}do{if((c[840]|0)==0){T=xa(30)|0;if((T-1&T|0)==0){c[842]=T;c[841]=T;c[843]=-1;c[844]=-1;c[845]=0;c[963]=0;c[840]=(bb(0)|0)&-16^1431655768;break}else{qa();return 0}}}while(0);T=o+48|0;S=c[842]|0;K=o+47|0;J=S+K|0;R=-S|0;S=J&R;if(!(S>>>0>o>>>0)){n=0;return n|0}Q=c[962]|0;do{if((Q|0)!=0){O=c[960]|0;P=O+S|0;if(P>>>0<=O>>>0|P>>>0>Q>>>0){n=0}else{break}return n|0}}while(0);f:do{if((c[963]&4|0)==0){Q=c[858]|0;g:do{if((Q|0)==0){U=182}else{P=Q;O=3856;while(1){V=O|0;L=c[V>>2]|0;if(!(L>>>0>P>>>0)){W=O+4|0;if((L+(c[W>>2]|0)|0)>>>0>P>>>0){break}}L=c[O+8>>2]|0;if((L|0)==0){U=182;break g}else{O=L}}if((O|0)==0){U=182;break}P=J-(c[855]|0)&R;if(!(P>>>0<2147483647>>>0)){X=0;break}e=Wa(P|0)|0;L=(e|0)==((c[V>>2]|0)+(c[W>>2]|0)|0);Y=L?e:-1;Z=L?P:0;_=e;$=P;U=191}}while(0);do{if((U|0)==182){Q=Wa(0)|0;if((Q|0)==-1){X=0;break}P=Q;e=c[841]|0;L=e-1|0;if((L&P|0)==0){aa=S}else{aa=S-P+(L+P&-e)|0}e=c[960]|0;P=e+aa|0;if(!(aa>>>0>o>>>0&aa>>>0<2147483647>>>0)){X=0;break}L=c[962]|0;if((L|0)!=0){if(P>>>0<=e>>>0|P>>>0>L>>>0){X=0;break}}L=Wa(aa|0)|0;P=(L|0)==(Q|0);Y=P?Q:-1;Z=P?aa:0;_=L;$=aa;U=191}}while(0);h:do{if((U|0)==191){L=-$|0;if(!((Y|0)==-1)){ba=Z;ca=Y;U=202;break f}do{if((_|0)!=-1&$>>>0<2147483647>>>0&$>>>0<T>>>0){P=c[842]|0;Q=K-$+P&-P;if(!(Q>>>0<2147483647>>>0)){da=$;break}if((Wa(Q|0)|0)==-1){Wa(L|0)|0;X=Z;break h}else{da=Q+$|0;break}}else{da=$}}while(0);if((_|0)==-1){X=Z}else{ba=da;ca=_;U=202;break f}}}while(0);c[963]=c[963]|4;ea=X;U=199}else{ea=0;U=199}}while(0);do{if((U|0)==199){if(!(S>>>0<2147483647>>>0)){break}X=Wa(S|0)|0;_=Wa(0)|0;if(!((_|0)!=-1&(X|0)!=-1&X>>>0<_>>>0)){break}da=_-X|0;_=da>>>0>(o+40|0)>>>0;if(_){ba=_?da:ea;ca=X;U=202}}}while(0);do{if((U|0)==202){ea=(c[960]|0)+ba|0;c[960]=ea;if(ea>>>0>(c[961]|0)>>>0){c[961]=ea}ea=c[858]|0;i:do{if((ea|0)==0){S=c[856]|0;if((S|0)==0|ca>>>0<S>>>0){c[856]=ca}c[964]=ca;c[965]=ba;c[967]=0;c[861]=c[840];c[860]=-1;S=0;do{X=S<<1;da=3448+(X<<2)|0;c[3448+(X+3<<2)>>2]=da;c[3448+(X+2<<2)>>2]=da;S=S+1|0;}while(S>>>0<32>>>0);S=ca+8|0;if((S&7|0)==0){fa=0}else{fa=-S&7}S=ba-40-fa|0;c[858]=ca+fa;c[855]=S;c[ca+(fa+4)>>2]=S|1;c[ca+(ba-36)>>2]=40;c[859]=c[844]}else{S=3856;while(1){ga=c[S>>2]|0;ha=S+4|0;ia=c[ha>>2]|0;if((ca|0)==(ga+ia|0)){U=214;break}da=c[S+8>>2]|0;if((da|0)==0){break}else{S=da}}do{if((U|0)==214){if((c[S+12>>2]&8|0)!=0){break}da=ea;if(!(da>>>0>=ga>>>0&da>>>0<ca>>>0)){break}c[ha>>2]=ia+ba;X=(c[855]|0)+ba|0;_=ea+8|0;if((_&7|0)==0){ja=0}else{ja=-_&7}_=X-ja|0;c[858]=da+ja;c[855]=_;c[da+(ja+4)>>2]=_|1;c[da+(X+4)>>2]=40;c[859]=c[844];break i}}while(0);if(ca>>>0<(c[856]|0)>>>0){c[856]=ca}S=ca+ba|0;X=3856;while(1){ka=X|0;if((c[ka>>2]|0)==(S|0)){U=224;break}da=c[X+8>>2]|0;if((da|0)==0){break}else{X=da}}do{if((U|0)==224){if((c[X+12>>2]&8|0)!=0){break}c[ka>>2]=ca;S=X+4|0;c[S>>2]=(c[S>>2]|0)+ba;S=ca+8|0;if((S&7|0)==0){la=0}else{la=-S&7}S=ca+(ba+8)|0;if((S&7|0)==0){ma=0}else{ma=-S&7}S=ca+(ma+ba)|0;da=S;_=la+o|0;Z=ca+_|0;$=Z;K=S-(ca+la)-o|0;c[ca+(la+4)>>2]=o|3;j:do{if((da|0)==(c[858]|0)){T=(c[855]|0)+K|0;c[855]=T;c[858]=$;c[ca+(_+4)>>2]=T|1}else{if((da|0)==(c[857]|0)){T=(c[854]|0)+K|0;c[854]=T;c[857]=$;c[ca+(_+4)>>2]=T|1;c[ca+(T+_)>>2]=T;break}T=ba+4|0;Y=c[ca+(T+ma)>>2]|0;if((Y&3|0)==1){aa=Y&-8;W=Y>>>3;k:do{if(Y>>>0<256>>>0){V=c[ca+((ma|8)+ba)>>2]|0;R=c[ca+(ba+12+ma)>>2]|0;J=3448+(W<<1<<2)|0;do{if((V|0)!=(J|0)){if(V>>>0<(c[856]|0)>>>0){qa();return 0}if((c[V+12>>2]|0)==(da|0)){break}qa();return 0}}while(0);if((R|0)==(V|0)){c[852]=c[852]&~(1<<W);break}do{if((R|0)==(J|0)){na=R+8|0}else{if(R>>>0<(c[856]|0)>>>0){qa();return 0}L=R+8|0;if((c[L>>2]|0)==(da|0)){na=L;break}qa();return 0}}while(0);c[V+12>>2]=R;c[na>>2]=V}else{J=S;L=c[ca+((ma|24)+ba)>>2]|0;O=c[ca+(ba+12+ma)>>2]|0;do{if((O|0)==(J|0)){Q=ma|16;P=ca+(T+Q)|0;e=c[P>>2]|0;if((e|0)==0){M=ca+(Q+ba)|0;Q=c[M>>2]|0;if((Q|0)==0){oa=0;break}else{pa=Q;ra=M}}else{pa=e;ra=P}while(1){P=pa+20|0;e=c[P>>2]|0;if((e|0)!=0){pa=e;ra=P;continue}P=pa+16|0;e=c[P>>2]|0;if((e|0)==0){break}else{pa=e;ra=P}}if(ra>>>0<(c[856]|0)>>>0){qa();return 0}else{c[ra>>2]=0;oa=pa;break}}else{P=c[ca+((ma|8)+ba)>>2]|0;if(P>>>0<(c[856]|0)>>>0){qa();return 0}e=P+12|0;if((c[e>>2]|0)!=(J|0)){qa();return 0}M=O+8|0;if((c[M>>2]|0)==(J|0)){c[e>>2]=O;c[M>>2]=P;oa=O;break}else{qa();return 0}}}while(0);if((L|0)==0){break}O=c[ca+(ba+28+ma)>>2]|0;V=3712+(O<<2)|0;do{if((J|0)==(c[V>>2]|0)){c[V>>2]=oa;if((oa|0)!=0){break}c[853]=c[853]&~(1<<O);break k}else{if(L>>>0<(c[856]|0)>>>0){qa();return 0}R=L+16|0;if((c[R>>2]|0)==(J|0)){c[R>>2]=oa}else{c[L+20>>2]=oa}if((oa|0)==0){break k}}}while(0);if(oa>>>0<(c[856]|0)>>>0){qa();return 0}c[oa+24>>2]=L;J=ma|16;O=c[ca+(J+ba)>>2]|0;do{if((O|0)!=0){if(O>>>0<(c[856]|0)>>>0){qa();return 0}else{c[oa+16>>2]=O;c[O+24>>2]=oa;break}}}while(0);O=c[ca+(T+J)>>2]|0;if((O|0)==0){break}if(O>>>0<(c[856]|0)>>>0){qa();return 0}else{c[oa+20>>2]=O;c[O+24>>2]=oa;break}}}while(0);sa=ca+((aa|ma)+ba)|0;ta=aa+K|0}else{sa=da;ta=K}T=sa+4|0;c[T>>2]=c[T>>2]&-2;c[ca+(_+4)>>2]=ta|1;c[ca+(ta+_)>>2]=ta;T=ta>>>3;if(ta>>>0<256>>>0){W=T<<1;Y=3448+(W<<2)|0;O=c[852]|0;L=1<<T;do{if((O&L|0)==0){c[852]=O|L;ua=Y;va=3448+(W+2<<2)|0}else{T=3448+(W+2<<2)|0;V=c[T>>2]|0;if(!(V>>>0<(c[856]|0)>>>0)){ua=V;va=T;break}qa();return 0}}while(0);c[va>>2]=$;c[ua+12>>2]=$;c[ca+(_+8)>>2]=ua;c[ca+(_+12)>>2]=Y;break}W=Z;L=ta>>>8;do{if((L|0)==0){wa=0}else{if(ta>>>0>16777215>>>0){wa=31;break}O=(L+1048320|0)>>>16&8;aa=L<<O;T=(aa+520192|0)>>>16&4;V=aa<<T;aa=(V+245760|0)>>>16&2;R=14-(T|O|aa)+(V<<aa>>>15)|0;wa=ta>>>((R+7|0)>>>0)&1|R<<1}}while(0);L=3712+(wa<<2)|0;c[ca+(_+28)>>2]=wa;c[ca+(_+20)>>2]=0;c[ca+(_+16)>>2]=0;Y=c[853]|0;R=1<<wa;if((Y&R|0)==0){c[853]=Y|R;c[L>>2]=W;c[ca+(_+24)>>2]=L;c[ca+(_+12)>>2]=W;c[ca+(_+8)>>2]=W;break}R=c[L>>2]|0;if((wa|0)==31){ya=0}else{ya=25-(wa>>>1)|0}l:do{if((c[R+4>>2]&-8|0)==(ta|0)){za=R}else{L=R;Y=ta<<ya;while(1){Aa=L+16+(Y>>>31<<2)|0;aa=c[Aa>>2]|0;if((aa|0)==0){break}if((c[aa+4>>2]&-8|0)==(ta|0)){za=aa;break l}else{L=aa;Y=Y<<1}}if(Aa>>>0<(c[856]|0)>>>0){qa();return 0}else{c[Aa>>2]=W;c[ca+(_+24)>>2]=L;c[ca+(_+12)>>2]=W;c[ca+(_+8)>>2]=W;break j}}}while(0);R=za+8|0;Y=c[R>>2]|0;J=c[856]|0;if(za>>>0<J>>>0){qa();return 0}if(Y>>>0<J>>>0){qa();return 0}else{c[Y+12>>2]=W;c[R>>2]=W;c[ca+(_+8)>>2]=Y;c[ca+(_+12)>>2]=za;c[ca+(_+24)>>2]=0;break}}}while(0);n=ca+(la|8)|0;return n|0}}while(0);X=ea;_=3856;while(1){Ba=c[_>>2]|0;if(!(Ba>>>0>X>>>0)){Ca=c[_+4>>2]|0;Da=Ba+Ca|0;if(Da>>>0>X>>>0){break}}_=c[_+8>>2]|0}_=Ba+(Ca-39)|0;if((_&7|0)==0){Ea=0}else{Ea=-_&7}_=Ba+(Ca-47+Ea)|0;Z=_>>>0<(ea+16|0)>>>0?X:_;_=Z+8|0;$=ca+8|0;if(($&7|0)==0){Fa=0}else{Fa=-$&7}$=ba-40-Fa|0;c[858]=ca+Fa;c[855]=$;c[ca+(Fa+4)>>2]=$|1;c[ca+(ba-36)>>2]=40;c[859]=c[844];c[Z+4>>2]=27;c[_>>2]=c[964];c[_+4>>2]=c[965];c[_+8>>2]=c[966];c[_+12>>2]=c[967];c[964]=ca;c[965]=ba;c[967]=0;c[966]=_;_=Z+28|0;c[_>>2]=7;if((Z+32|0)>>>0<Da>>>0){$=_;while(1){_=$+4|0;c[_>>2]=7;if(($+8|0)>>>0<Da>>>0){$=_}else{break}}}if((Z|0)==(X|0)){break}$=Z-ea|0;_=X+($+4)|0;c[_>>2]=c[_>>2]&-2;c[ea+4>>2]=$|1;c[X+$>>2]=$;_=$>>>3;if($>>>0<256>>>0){K=_<<1;da=3448+(K<<2)|0;S=c[852]|0;j=1<<_;do{if((S&j|0)==0){c[852]=S|j;Ga=da;Ha=3448+(K+2<<2)|0}else{_=3448+(K+2<<2)|0;Y=c[_>>2]|0;if(!(Y>>>0<(c[856]|0)>>>0)){Ga=Y;Ha=_;break}qa();return 0}}while(0);c[Ha>>2]=ea;c[Ga+12>>2]=ea;c[ea+8>>2]=Ga;c[ea+12>>2]=da;break}K=ea;j=$>>>8;do{if((j|0)==0){Ia=0}else{if($>>>0>16777215>>>0){Ia=31;break}S=(j+1048320|0)>>>16&8;X=j<<S;Z=(X+520192|0)>>>16&4;_=X<<Z;X=(_+245760|0)>>>16&2;Y=14-(Z|S|X)+(_<<X>>>15)|0;Ia=$>>>((Y+7|0)>>>0)&1|Y<<1}}while(0);j=3712+(Ia<<2)|0;c[ea+28>>2]=Ia;c[ea+20>>2]=0;c[ea+16>>2]=0;da=c[853]|0;Y=1<<Ia;if((da&Y|0)==0){c[853]=da|Y;c[j>>2]=K;c[ea+24>>2]=j;c[ea+12>>2]=ea;c[ea+8>>2]=ea;break}Y=c[j>>2]|0;if((Ia|0)==31){Ja=0}else{Ja=25-(Ia>>>1)|0}m:do{if((c[Y+4>>2]&-8|0)==($|0)){Ka=Y}else{j=Y;da=$<<Ja;while(1){La=j+16+(da>>>31<<2)|0;X=c[La>>2]|0;if((X|0)==0){break}if((c[X+4>>2]&-8|0)==($|0)){Ka=X;break m}else{j=X;da=da<<1}}if(La>>>0<(c[856]|0)>>>0){qa();return 0}else{c[La>>2]=K;c[ea+24>>2]=j;c[ea+12>>2]=ea;c[ea+8>>2]=ea;break i}}}while(0);$=Ka+8|0;Y=c[$>>2]|0;da=c[856]|0;if(Ka>>>0<da>>>0){qa();return 0}if(Y>>>0<da>>>0){qa();return 0}else{c[Y+12>>2]=K;c[$>>2]=K;c[ea+8>>2]=Y;c[ea+12>>2]=Ka;c[ea+24>>2]=0;break}}}while(0);ea=c[855]|0;if(!(ea>>>0>o>>>0)){break}Y=ea-o|0;c[855]=Y;ea=c[858]|0;$=ea;c[858]=$+o;c[$+(o+4)>>2]=Y|1;c[ea+4>>2]=o|3;n=ea+8|0;return n|0}}while(0);c[(Ya()|0)>>2]=12;n=0;return n|0}function af(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;if((a|0)==0){return}b=a-8|0;d=b;e=c[856]|0;if(b>>>0<e>>>0){qa()}f=c[a-4>>2]|0;g=f&3;if((g|0)==1){qa()}h=f&-8;i=a+(h-8)|0;j=i;a:do{if((f&1|0)==0){k=c[b>>2]|0;if((g|0)==0){return}l=-8-k|0;m=a+l|0;n=m;o=k+h|0;if(m>>>0<e>>>0){qa()}if((n|0)==(c[857]|0)){p=a+(h-4)|0;if((c[p>>2]&3|0)!=3){q=n;r=o;break}c[854]=o;c[p>>2]=c[p>>2]&-2;c[a+(l+4)>>2]=o|1;c[i>>2]=o;return}p=k>>>3;if(k>>>0<256>>>0){k=c[a+(l+8)>>2]|0;s=c[a+(l+12)>>2]|0;t=3448+(p<<1<<2)|0;do{if((k|0)!=(t|0)){if(k>>>0<e>>>0){qa()}if((c[k+12>>2]|0)==(n|0)){break}qa()}}while(0);if((s|0)==(k|0)){c[852]=c[852]&~(1<<p);q=n;r=o;break}do{if((s|0)==(t|0)){u=s+8|0}else{if(s>>>0<e>>>0){qa()}v=s+8|0;if((c[v>>2]|0)==(n|0)){u=v;break}qa()}}while(0);c[k+12>>2]=s;c[u>>2]=k;q=n;r=o;break}t=m;p=c[a+(l+24)>>2]|0;v=c[a+(l+12)>>2]|0;do{if((v|0)==(t|0)){w=a+(l+20)|0;x=c[w>>2]|0;if((x|0)==0){y=a+(l+16)|0;z=c[y>>2]|0;if((z|0)==0){A=0;break}else{B=z;C=y}}else{B=x;C=w}while(1){w=B+20|0;x=c[w>>2]|0;if((x|0)!=0){B=x;C=w;continue}w=B+16|0;x=c[w>>2]|0;if((x|0)==0){break}else{B=x;C=w}}if(C>>>0<e>>>0){qa()}else{c[C>>2]=0;A=B;break}}else{w=c[a+(l+8)>>2]|0;if(w>>>0<e>>>0){qa()}x=w+12|0;if((c[x>>2]|0)!=(t|0)){qa()}y=v+8|0;if((c[y>>2]|0)==(t|0)){c[x>>2]=v;c[y>>2]=w;A=v;break}else{qa()}}}while(0);if((p|0)==0){q=n;r=o;break}v=c[a+(l+28)>>2]|0;m=3712+(v<<2)|0;do{if((t|0)==(c[m>>2]|0)){c[m>>2]=A;if((A|0)!=0){break}c[853]=c[853]&~(1<<v);q=n;r=o;break a}else{if(p>>>0<(c[856]|0)>>>0){qa()}k=p+16|0;if((c[k>>2]|0)==(t|0)){c[k>>2]=A}else{c[p+20>>2]=A}if((A|0)==0){q=n;r=o;break a}}}while(0);if(A>>>0<(c[856]|0)>>>0){qa()}c[A+24>>2]=p;t=c[a+(l+16)>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[856]|0)>>>0){qa()}else{c[A+16>>2]=t;c[t+24>>2]=A;break}}}while(0);t=c[a+(l+20)>>2]|0;if((t|0)==0){q=n;r=o;break}if(t>>>0<(c[856]|0)>>>0){qa()}else{c[A+20>>2]=t;c[t+24>>2]=A;q=n;r=o;break}}else{q=d;r=h}}while(0);d=q;if(!(d>>>0<i>>>0)){qa()}A=a+(h-4)|0;e=c[A>>2]|0;if((e&1|0)==0){qa()}do{if((e&2|0)==0){if((j|0)==(c[858]|0)){B=(c[855]|0)+r|0;c[855]=B;c[858]=q;c[q+4>>2]=B|1;if((q|0)!=(c[857]|0)){return}c[857]=0;c[854]=0;return}if((j|0)==(c[857]|0)){B=(c[854]|0)+r|0;c[854]=B;c[857]=q;c[q+4>>2]=B|1;c[d+B>>2]=B;return}B=(e&-8)+r|0;C=e>>>3;b:do{if(e>>>0<256>>>0){u=c[a+h>>2]|0;g=c[a+(h|4)>>2]|0;b=3448+(C<<1<<2)|0;do{if((u|0)!=(b|0)){if(u>>>0<(c[856]|0)>>>0){qa()}if((c[u+12>>2]|0)==(j|0)){break}qa()}}while(0);if((g|0)==(u|0)){c[852]=c[852]&~(1<<C);break}do{if((g|0)==(b|0)){D=g+8|0}else{if(g>>>0<(c[856]|0)>>>0){qa()}f=g+8|0;if((c[f>>2]|0)==(j|0)){D=f;break}qa()}}while(0);c[u+12>>2]=g;c[D>>2]=u}else{b=i;f=c[a+(h+16)>>2]|0;t=c[a+(h|4)>>2]|0;do{if((t|0)==(b|0)){p=a+(h+12)|0;v=c[p>>2]|0;if((v|0)==0){m=a+(h+8)|0;k=c[m>>2]|0;if((k|0)==0){E=0;break}else{F=k;G=m}}else{F=v;G=p}while(1){p=F+20|0;v=c[p>>2]|0;if((v|0)!=0){F=v;G=p;continue}p=F+16|0;v=c[p>>2]|0;if((v|0)==0){break}else{F=v;G=p}}if(G>>>0<(c[856]|0)>>>0){qa()}else{c[G>>2]=0;E=F;break}}else{p=c[a+h>>2]|0;if(p>>>0<(c[856]|0)>>>0){qa()}v=p+12|0;if((c[v>>2]|0)!=(b|0)){qa()}m=t+8|0;if((c[m>>2]|0)==(b|0)){c[v>>2]=t;c[m>>2]=p;E=t;break}else{qa()}}}while(0);if((f|0)==0){break}t=c[a+(h+20)>>2]|0;u=3712+(t<<2)|0;do{if((b|0)==(c[u>>2]|0)){c[u>>2]=E;if((E|0)!=0){break}c[853]=c[853]&~(1<<t);break b}else{if(f>>>0<(c[856]|0)>>>0){qa()}g=f+16|0;if((c[g>>2]|0)==(b|0)){c[g>>2]=E}else{c[f+20>>2]=E}if((E|0)==0){break b}}}while(0);if(E>>>0<(c[856]|0)>>>0){qa()}c[E+24>>2]=f;b=c[a+(h+8)>>2]|0;do{if((b|0)!=0){if(b>>>0<(c[856]|0)>>>0){qa()}else{c[E+16>>2]=b;c[b+24>>2]=E;break}}}while(0);b=c[a+(h+12)>>2]|0;if((b|0)==0){break}if(b>>>0<(c[856]|0)>>>0){qa()}else{c[E+20>>2]=b;c[b+24>>2]=E;break}}}while(0);c[q+4>>2]=B|1;c[d+B>>2]=B;if((q|0)!=(c[857]|0)){H=B;break}c[854]=B;return}else{c[A>>2]=e&-2;c[q+4>>2]=r|1;c[d+r>>2]=r;H=r}}while(0);r=H>>>3;if(H>>>0<256>>>0){d=r<<1;e=3448+(d<<2)|0;A=c[852]|0;E=1<<r;do{if((A&E|0)==0){c[852]=A|E;I=e;J=3448+(d+2<<2)|0}else{r=3448+(d+2<<2)|0;h=c[r>>2]|0;if(!(h>>>0<(c[856]|0)>>>0)){I=h;J=r;break}qa()}}while(0);c[J>>2]=q;c[I+12>>2]=q;c[q+8>>2]=I;c[q+12>>2]=e;return}e=q;I=H>>>8;do{if((I|0)==0){K=0}else{if(H>>>0>16777215>>>0){K=31;break}J=(I+1048320|0)>>>16&8;d=I<<J;E=(d+520192|0)>>>16&4;A=d<<E;d=(A+245760|0)>>>16&2;r=14-(E|J|d)+(A<<d>>>15)|0;K=H>>>((r+7|0)>>>0)&1|r<<1}}while(0);I=3712+(K<<2)|0;c[q+28>>2]=K;c[q+20>>2]=0;c[q+16>>2]=0;r=c[853]|0;d=1<<K;c:do{if((r&d|0)==0){c[853]=r|d;c[I>>2]=e;c[q+24>>2]=I;c[q+12>>2]=q;c[q+8>>2]=q}else{A=c[I>>2]|0;if((K|0)==31){L=0}else{L=25-(K>>>1)|0}d:do{if((c[A+4>>2]&-8|0)==(H|0)){M=A}else{J=A;E=H<<L;while(1){N=J+16+(E>>>31<<2)|0;h=c[N>>2]|0;if((h|0)==0){break}if((c[h+4>>2]&-8|0)==(H|0)){M=h;break d}else{J=h;E=E<<1}}if(N>>>0<(c[856]|0)>>>0){qa()}else{c[N>>2]=e;c[q+24>>2]=J;c[q+12>>2]=q;c[q+8>>2]=q;break c}}}while(0);A=M+8|0;B=c[A>>2]|0;E=c[856]|0;if(M>>>0<E>>>0){qa()}if(B>>>0<E>>>0){qa()}else{c[B+12>>2]=e;c[A>>2]=e;c[q+8>>2]=B;c[q+12>>2]=M;c[q+24>>2]=0;break}}}while(0);q=(c[860]|0)-1|0;c[860]=q;if((q|0)==0){O=3864}else{return}while(1){q=c[O>>2]|0;if((q|0)==0){break}else{O=q+8|0}}c[860]=-1;return}function bf(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;if((a|0)==0){d=$e(b)|0;return d|0}if(b>>>0>4294967231>>>0){c[(Ya()|0)>>2]=12;d=0;return d|0}if(b>>>0<11>>>0){e=16}else{e=b+11&-8}f=cf(a-8|0,e)|0;if((f|0)!=0){d=f+8|0;return d|0}f=$e(b)|0;if((f|0)==0){d=0;return d|0}e=c[a-4>>2]|0;g=(e&-8)-((e&3|0)==0?8:4)|0;rf(f|0,a|0,g>>>0<b>>>0?g:b)|0;af(a);d=f;return d|0}function cf(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=a+4|0;e=c[d>>2]|0;f=e&-8;g=a;h=g+f|0;i=h;j=c[856]|0;if(g>>>0<j>>>0){qa();return 0}k=e&3;if(!((k|0)!=1&g>>>0<h>>>0)){qa();return 0}l=g+(f|4)|0;m=c[l>>2]|0;if((m&1|0)==0){qa();return 0}if((k|0)==0){if(b>>>0<256>>>0){n=0;return n|0}do{if(!(f>>>0<(b+4|0)>>>0)){if((f-b|0)>>>0>c[842]<<1>>>0){break}else{n=a}return n|0}}while(0);n=0;return n|0}if(!(f>>>0<b>>>0)){k=f-b|0;if(!(k>>>0>15>>>0)){n=a;return n|0}c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=k|3;c[l>>2]=c[l>>2]|1;df(g+b|0,k);n=a;return n|0}if((i|0)==(c[858]|0)){k=(c[855]|0)+f|0;if(!(k>>>0>b>>>0)){n=0;return n|0}l=k-b|0;c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=l|1;c[858]=g+b;c[855]=l;n=a;return n|0}if((i|0)==(c[857]|0)){l=(c[854]|0)+f|0;if(l>>>0<b>>>0){n=0;return n|0}k=l-b|0;if(k>>>0>15>>>0){c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=k|1;c[g+l>>2]=k;o=g+(l+4)|0;c[o>>2]=c[o>>2]&-2;p=g+b|0;q=k}else{c[d>>2]=e&1|l|2;e=g+(l+4)|0;c[e>>2]=c[e>>2]|1;p=0;q=0}c[854]=q;c[857]=p;n=a;return n|0}if((m&2|0)!=0){n=0;return n|0}p=(m&-8)+f|0;if(p>>>0<b>>>0){n=0;return n|0}q=p-b|0;e=m>>>3;a:do{if(m>>>0<256>>>0){l=c[g+(f+8)>>2]|0;k=c[g+(f+12)>>2]|0;o=3448+(e<<1<<2)|0;do{if((l|0)!=(o|0)){if(l>>>0<j>>>0){qa();return 0}if((c[l+12>>2]|0)==(i|0)){break}qa();return 0}}while(0);if((k|0)==(l|0)){c[852]=c[852]&~(1<<e);break}do{if((k|0)==(o|0)){r=k+8|0}else{if(k>>>0<j>>>0){qa();return 0}s=k+8|0;if((c[s>>2]|0)==(i|0)){r=s;break}qa();return 0}}while(0);c[l+12>>2]=k;c[r>>2]=l}else{o=h;s=c[g+(f+24)>>2]|0;t=c[g+(f+12)>>2]|0;do{if((t|0)==(o|0)){u=g+(f+20)|0;v=c[u>>2]|0;if((v|0)==0){w=g+(f+16)|0;x=c[w>>2]|0;if((x|0)==0){y=0;break}else{z=x;A=w}}else{z=v;A=u}while(1){u=z+20|0;v=c[u>>2]|0;if((v|0)!=0){z=v;A=u;continue}u=z+16|0;v=c[u>>2]|0;if((v|0)==0){break}else{z=v;A=u}}if(A>>>0<j>>>0){qa();return 0}else{c[A>>2]=0;y=z;break}}else{u=c[g+(f+8)>>2]|0;if(u>>>0<j>>>0){qa();return 0}v=u+12|0;if((c[v>>2]|0)!=(o|0)){qa();return 0}w=t+8|0;if((c[w>>2]|0)==(o|0)){c[v>>2]=t;c[w>>2]=u;y=t;break}else{qa();return 0}}}while(0);if((s|0)==0){break}t=c[g+(f+28)>>2]|0;l=3712+(t<<2)|0;do{if((o|0)==(c[l>>2]|0)){c[l>>2]=y;if((y|0)!=0){break}c[853]=c[853]&~(1<<t);break a}else{if(s>>>0<(c[856]|0)>>>0){qa();return 0}k=s+16|0;if((c[k>>2]|0)==(o|0)){c[k>>2]=y}else{c[s+20>>2]=y}if((y|0)==0){break a}}}while(0);if(y>>>0<(c[856]|0)>>>0){qa();return 0}c[y+24>>2]=s;o=c[g+(f+16)>>2]|0;do{if((o|0)!=0){if(o>>>0<(c[856]|0)>>>0){qa();return 0}else{c[y+16>>2]=o;c[o+24>>2]=y;break}}}while(0);o=c[g+(f+20)>>2]|0;if((o|0)==0){break}if(o>>>0<(c[856]|0)>>>0){qa();return 0}else{c[y+20>>2]=o;c[o+24>>2]=y;break}}}while(0);if(q>>>0<16>>>0){c[d>>2]=p|c[d>>2]&1|2;y=g+(p|4)|0;c[y>>2]=c[y>>2]|1;n=a;return n|0}else{c[d>>2]=c[d>>2]&1|b|2;c[g+(b+4)>>2]=q|3;d=g+(p|4)|0;c[d>>2]=c[d>>2]|1;df(g+b|0,q);n=a;return n|0}return 0}function df(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;d=a;e=d+b|0;f=e;g=c[a+4>>2]|0;a:do{if((g&1|0)==0){h=c[a>>2]|0;if((g&3|0)==0){return}i=d+(-h|0)|0;j=i;k=h+b|0;l=c[856]|0;if(i>>>0<l>>>0){qa()}if((j|0)==(c[857]|0)){m=d+(b+4)|0;if((c[m>>2]&3|0)!=3){n=j;o=k;break}c[854]=k;c[m>>2]=c[m>>2]&-2;c[d+(4-h)>>2]=k|1;c[e>>2]=k;return}m=h>>>3;if(h>>>0<256>>>0){p=c[d+(8-h)>>2]|0;q=c[d+(12-h)>>2]|0;r=3448+(m<<1<<2)|0;do{if((p|0)!=(r|0)){if(p>>>0<l>>>0){qa()}if((c[p+12>>2]|0)==(j|0)){break}qa()}}while(0);if((q|0)==(p|0)){c[852]=c[852]&~(1<<m);n=j;o=k;break}do{if((q|0)==(r|0)){s=q+8|0}else{if(q>>>0<l>>>0){qa()}t=q+8|0;if((c[t>>2]|0)==(j|0)){s=t;break}qa()}}while(0);c[p+12>>2]=q;c[s>>2]=p;n=j;o=k;break}r=i;m=c[d+(24-h)>>2]|0;t=c[d+(12-h)>>2]|0;do{if((t|0)==(r|0)){u=16-h|0;v=d+(u+4)|0;w=c[v>>2]|0;if((w|0)==0){x=d+u|0;u=c[x>>2]|0;if((u|0)==0){y=0;break}else{z=u;A=x}}else{z=w;A=v}while(1){v=z+20|0;w=c[v>>2]|0;if((w|0)!=0){z=w;A=v;continue}v=z+16|0;w=c[v>>2]|0;if((w|0)==0){break}else{z=w;A=v}}if(A>>>0<l>>>0){qa()}else{c[A>>2]=0;y=z;break}}else{v=c[d+(8-h)>>2]|0;if(v>>>0<l>>>0){qa()}w=v+12|0;if((c[w>>2]|0)!=(r|0)){qa()}x=t+8|0;if((c[x>>2]|0)==(r|0)){c[w>>2]=t;c[x>>2]=v;y=t;break}else{qa()}}}while(0);if((m|0)==0){n=j;o=k;break}t=c[d+(28-h)>>2]|0;l=3712+(t<<2)|0;do{if((r|0)==(c[l>>2]|0)){c[l>>2]=y;if((y|0)!=0){break}c[853]=c[853]&~(1<<t);n=j;o=k;break a}else{if(m>>>0<(c[856]|0)>>>0){qa()}i=m+16|0;if((c[i>>2]|0)==(r|0)){c[i>>2]=y}else{c[m+20>>2]=y}if((y|0)==0){n=j;o=k;break a}}}while(0);if(y>>>0<(c[856]|0)>>>0){qa()}c[y+24>>2]=m;r=16-h|0;t=c[d+r>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[856]|0)>>>0){qa()}else{c[y+16>>2]=t;c[t+24>>2]=y;break}}}while(0);t=c[d+(r+4)>>2]|0;if((t|0)==0){n=j;o=k;break}if(t>>>0<(c[856]|0)>>>0){qa()}else{c[y+20>>2]=t;c[t+24>>2]=y;n=j;o=k;break}}else{n=a;o=b}}while(0);a=c[856]|0;if(e>>>0<a>>>0){qa()}y=d+(b+4)|0;z=c[y>>2]|0;do{if((z&2|0)==0){if((f|0)==(c[858]|0)){A=(c[855]|0)+o|0;c[855]=A;c[858]=n;c[n+4>>2]=A|1;if((n|0)!=(c[857]|0)){return}c[857]=0;c[854]=0;return}if((f|0)==(c[857]|0)){A=(c[854]|0)+o|0;c[854]=A;c[857]=n;c[n+4>>2]=A|1;c[n+A>>2]=A;return}A=(z&-8)+o|0;s=z>>>3;b:do{if(z>>>0<256>>>0){g=c[d+(b+8)>>2]|0;t=c[d+(b+12)>>2]|0;h=3448+(s<<1<<2)|0;do{if((g|0)!=(h|0)){if(g>>>0<a>>>0){qa()}if((c[g+12>>2]|0)==(f|0)){break}qa()}}while(0);if((t|0)==(g|0)){c[852]=c[852]&~(1<<s);break}do{if((t|0)==(h|0)){B=t+8|0}else{if(t>>>0<a>>>0){qa()}m=t+8|0;if((c[m>>2]|0)==(f|0)){B=m;break}qa()}}while(0);c[g+12>>2]=t;c[B>>2]=g}else{h=e;m=c[d+(b+24)>>2]|0;l=c[d+(b+12)>>2]|0;do{if((l|0)==(h|0)){i=d+(b+20)|0;p=c[i>>2]|0;if((p|0)==0){q=d+(b+16)|0;v=c[q>>2]|0;if((v|0)==0){C=0;break}else{D=v;E=q}}else{D=p;E=i}while(1){i=D+20|0;p=c[i>>2]|0;if((p|0)!=0){D=p;E=i;continue}i=D+16|0;p=c[i>>2]|0;if((p|0)==0){break}else{D=p;E=i}}if(E>>>0<a>>>0){qa()}else{c[E>>2]=0;C=D;break}}else{i=c[d+(b+8)>>2]|0;if(i>>>0<a>>>0){qa()}p=i+12|0;if((c[p>>2]|0)!=(h|0)){qa()}q=l+8|0;if((c[q>>2]|0)==(h|0)){c[p>>2]=l;c[q>>2]=i;C=l;break}else{qa()}}}while(0);if((m|0)==0){break}l=c[d+(b+28)>>2]|0;g=3712+(l<<2)|0;do{if((h|0)==(c[g>>2]|0)){c[g>>2]=C;if((C|0)!=0){break}c[853]=c[853]&~(1<<l);break b}else{if(m>>>0<(c[856]|0)>>>0){qa()}t=m+16|0;if((c[t>>2]|0)==(h|0)){c[t>>2]=C}else{c[m+20>>2]=C}if((C|0)==0){break b}}}while(0);if(C>>>0<(c[856]|0)>>>0){qa()}c[C+24>>2]=m;h=c[d+(b+16)>>2]|0;do{if((h|0)!=0){if(h>>>0<(c[856]|0)>>>0){qa()}else{c[C+16>>2]=h;c[h+24>>2]=C;break}}}while(0);h=c[d+(b+20)>>2]|0;if((h|0)==0){break}if(h>>>0<(c[856]|0)>>>0){qa()}else{c[C+20>>2]=h;c[h+24>>2]=C;break}}}while(0);c[n+4>>2]=A|1;c[n+A>>2]=A;if((n|0)!=(c[857]|0)){F=A;break}c[854]=A;return}else{c[y>>2]=z&-2;c[n+4>>2]=o|1;c[n+o>>2]=o;F=o}}while(0);o=F>>>3;if(F>>>0<256>>>0){z=o<<1;y=3448+(z<<2)|0;C=c[852]|0;b=1<<o;do{if((C&b|0)==0){c[852]=C|b;G=y;H=3448+(z+2<<2)|0}else{o=3448+(z+2<<2)|0;d=c[o>>2]|0;if(!(d>>>0<(c[856]|0)>>>0)){G=d;H=o;break}qa()}}while(0);c[H>>2]=n;c[G+12>>2]=n;c[n+8>>2]=G;c[n+12>>2]=y;return}y=n;G=F>>>8;do{if((G|0)==0){I=0}else{if(F>>>0>16777215>>>0){I=31;break}H=(G+1048320|0)>>>16&8;z=G<<H;b=(z+520192|0)>>>16&4;C=z<<b;z=(C+245760|0)>>>16&2;o=14-(b|H|z)+(C<<z>>>15)|0;I=F>>>((o+7|0)>>>0)&1|o<<1}}while(0);G=3712+(I<<2)|0;c[n+28>>2]=I;c[n+20>>2]=0;c[n+16>>2]=0;o=c[853]|0;z=1<<I;if((o&z|0)==0){c[853]=o|z;c[G>>2]=y;c[n+24>>2]=G;c[n+12>>2]=n;c[n+8>>2]=n;return}z=c[G>>2]|0;if((I|0)==31){J=0}else{J=25-(I>>>1)|0}c:do{if((c[z+4>>2]&-8|0)==(F|0)){K=z}else{I=z;G=F<<J;while(1){L=I+16+(G>>>31<<2)|0;o=c[L>>2]|0;if((o|0)==0){break}if((c[o+4>>2]&-8|0)==(F|0)){K=o;break c}else{I=o;G=G<<1}}if(L>>>0<(c[856]|0)>>>0){qa()}c[L>>2]=y;c[n+24>>2]=I;c[n+12>>2]=n;c[n+8>>2]=n;return}}while(0);L=K+8|0;F=c[L>>2]|0;J=c[856]|0;if(K>>>0<J>>>0){qa()}if(F>>>0<J>>>0){qa()}c[F+12>>2]=y;c[L>>2]=y;c[n+8>>2]=F;c[n+12>>2]=K;c[n+24>>2]=0;return}function ef(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0.0,m=0,n=0,o=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,Q=0,R=0,S=0,T=0.0,U=0.0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0.0,ja=0.0,ka=0,la=0,ma=0.0,na=0.0,oa=0,pa=0.0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0.0,za=0,Aa=0.0,Ba=0,Ca=0.0,Da=0,Ea=0,Fa=0,Ga=0.0,Ha=0,Ja=0.0,Ka=0.0,Ma=0,Na=0,Pa=0,Qa=0,Ra=0,Sa=0,Ta=0,Ua=0,Va=0,Wa=0,Xa=0,Za=0,_a=0,$a=0,ab=0,bb=0,cb=0,db=0,eb=0,fb=0,gb=0,hb=0,ib=0,jb=0,kb=0,lb=0,mb=0,nb=0,ob=0,pb=0,qb=0,rb=0,sb=0,tb=0,ub=0,vb=0,wb=0,xb=0,yb=0,zb=0,Ab=0,Bb=0,Cb=0,Db=0,Eb=0,Fb=0,Gb=0,Hb=0,Ib=0,Jb=0,Kb=0,Lb=0,Mb=0,Nb=0,Ob=0,Pb=0,Qb=0,Rb=0,Sb=0,Tb=0,Ub=0,Vb=0,Wb=0,Xb=0,Yb=0,Zb=0,_b=0,$b=0,ac=0,bc=0,cc=0,dc=0,ec=0,fc=0,gc=0,hc=0,ic=0,jc=0,kc=0,lc=0,mc=0,nc=0,oc=0,pc=0,qc=0,rc=0,sc=0,tc=0,uc=0,vc=0,wc=0,xc=0,yc=0,zc=0,Ac=0.0,Bc=0,Cc=0,Dc=0.0,Ec=0.0,Fc=0.0,Gc=0.0,Hc=0.0,Ic=0.0,Jc=0.0,Kc=0,Lc=0,Mc=0.0,Nc=0,Oc=0;g=i;i=i+512|0;h=g|0;if((e|0)==2){j=-1074;k=53}else if((e|0)==1){j=-1074;k=53}else if((e|0)==0){j=-149;k=24}else{l=0.0;i=g;return+l}e=b+4|0;m=b+100|0;do{n=c[e>>2]|0;if(n>>>0<(c[m>>2]|0)>>>0){c[e>>2]=n+1;o=d[n]|0}else{o=hf(b)|0}}while((Ia(o|0)|0)!=0);do{if((o|0)==45|(o|0)==43){n=1-(((o|0)==45)<<1)|0;r=c[e>>2]|0;if(r>>>0<(c[m>>2]|0)>>>0){c[e>>2]=r+1;s=d[r]|0;t=n;break}else{s=hf(b)|0;t=n;break}}else{s=o;t=1}}while(0);o=0;n=s;while(1){if((n|32|0)!=(a[1016+o|0]|0)){u=o;v=n;break}do{if(o>>>0<7>>>0){s=c[e>>2]|0;if(s>>>0<(c[m>>2]|0)>>>0){c[e>>2]=s+1;w=d[s]|0;break}else{w=hf(b)|0;break}}else{w=n}}while(0);s=o+1|0;if(s>>>0<8>>>0){o=s;n=w}else{u=s;v=w;break}}do{if((u|0)==3){x=23}else if((u|0)!=8){w=(f|0)==0;if(!(u>>>0<4>>>0|w)){if((u|0)==8){break}else{x=23;break}}a:do{if((u|0)==0){n=0;o=v;while(1){if((o|32|0)!=(a[2672+n|0]|0)){y=o;z=n;break a}do{if(n>>>0<2>>>0){s=c[e>>2]|0;if(s>>>0<(c[m>>2]|0)>>>0){c[e>>2]=s+1;A=d[s]|0;break}else{A=hf(b)|0;break}}else{A=o}}while(0);s=n+1|0;if(s>>>0<3>>>0){n=s;o=A}else{y=A;z=s;break}}}else{y=v;z=u}}while(0);if((z|0)==3){o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;B=d[o]|0}else{B=hf(b)|0}if((B|0)==40){C=1}else{if((c[m>>2]|0)==0){l=+p;i=g;return+l}c[e>>2]=(c[e>>2]|0)-1;l=+p;i=g;return+l}while(1){o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;D=d[o]|0}else{D=hf(b)|0}if(!((D-48|0)>>>0<10>>>0|(D-65|0)>>>0<26>>>0)){if(!((D-97|0)>>>0<26>>>0|(D|0)==95)){break}}C=C+1|0}if((D|0)==41){l=+p;i=g;return+l}o=(c[m>>2]|0)==0;if(!o){c[e>>2]=(c[e>>2]|0)-1}if(w){c[(Ya()|0)>>2]=22;gf(b,0);l=0.0;i=g;return+l}if((C|0)==0|o){l=+p;i=g;return+l}else{F=C}while(1){o=F-1|0;c[e>>2]=(c[e>>2]|0)-1;if((o|0)==0){l=+p;break}else{F=o}}i=g;return+l}else if((z|0)==0){do{if((y|0)==48){o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;G=d[o]|0}else{G=hf(b)|0}if((G|32|0)!=120){if((c[m>>2]|0)==0){H=48;break}c[e>>2]=(c[e>>2]|0)-1;H=48;break}o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;I=d[o]|0;J=0}else{I=hf(b)|0;J=0}while(1){if((I|0)==46){x=70;break}else if((I|0)!=48){K=I;L=0;M=0;N=0;O=0;Q=J;R=0;S=0;T=1.0;U=0.0;V=0;break}o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;I=d[o]|0;J=1;continue}else{I=hf(b)|0;J=1;continue}}b:do{if((x|0)==70){o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;W=d[o]|0}else{W=hf(b)|0}if((W|0)==48){X=-1;Y=-1}else{K=W;L=0;M=0;N=0;O=0;Q=J;R=1;S=0;T=1.0;U=0.0;V=0;break}while(1){o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;Z=d[o]|0}else{Z=hf(b)|0}if((Z|0)!=48){K=Z;L=0;M=0;N=X;O=Y;Q=1;R=1;S=0;T=1.0;U=0.0;V=0;break b}o=xf(Y,X,-1,-1)|0;X=E;Y=o}}}while(0);c:while(1){o=K-48|0;do{if(o>>>0<10>>>0){_=o;x=84}else{n=K|32;s=(K|0)==46;if(!((n-97|0)>>>0<6>>>0|s)){$=K;break c}if(s){if((R|0)==0){ba=L;ca=M;da=L;ea=M;fa=Q;ga=1;ha=S;ia=T;ja=U;ka=V;break}else{$=46;break c}}else{_=(K|0)>57?n-87|0:o;x=84;break}}}while(0);if((x|0)==84){x=0;o=0;do{if((L|0)<(o|0)|(L|0)==(o|0)&M>>>0<8>>>0){la=S;ma=T;na=U;oa=_+(V<<4)|0}else{n=0;if((L|0)<(n|0)|(L|0)==(n|0)&M>>>0<14>>>0){pa=T*.0625;la=S;ma=pa;na=U+pa*+(_|0);oa=V;break}if(!((_|0)!=0&(S|0)==0)){la=S;ma=T;na=U;oa=V;break}la=1;ma=T;na=U+T*.5;oa=V}}while(0);o=xf(M,L,1,0)|0;ba=E;ca=o;da=N;ea=O;fa=1;ga=R;ha=la;ia=ma;ja=na;ka=oa}o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;K=d[o]|0;L=ba;M=ca;N=da;O=ea;Q=fa;R=ga;S=ha;T=ia;U=ja;V=ka;continue}else{K=hf(b)|0;L=ba;M=ca;N=da;O=ea;Q=fa;R=ga;S=ha;T=ia;U=ja;V=ka;continue}}if((Q|0)==0){o=(c[m>>2]|0)==0;if(!o){c[e>>2]=(c[e>>2]|0)-1}do{if(w){gf(b,0)}else{if(o){break}n=c[e>>2]|0;c[e>>2]=n-1;if((R|0)==0){break}c[e>>2]=n-2}}while(0);l=+(t|0)*0.0;i=g;return+l}o=(R|0)==0;n=o?M:O;s=o?L:N;o=0;if((L|0)<(o|0)|(L|0)==(o|0)&M>>>0<8>>>0){o=V;r=L;qa=M;while(1){ra=o<<4;sa=xf(qa,r,1,0)|0;ta=E;ua=0;if((ta|0)<(ua|0)|(ta|0)==(ua|0)&sa>>>0<8>>>0){o=ra;r=ta;qa=sa}else{va=ra;break}}}else{va=V}do{if(($|32|0)==112){qa=ff(b,f)|0;r=E;if(!((qa|0)==0&(r|0)==(-2147483648|0))){wa=r;xa=qa;break}if(w){gf(b,0);l=0.0;i=g;return+l}else{if((c[m>>2]|0)==0){wa=0;xa=0;break}c[e>>2]=(c[e>>2]|0)-1;wa=0;xa=0;break}}else{if((c[m>>2]|0)==0){wa=0;xa=0;break}c[e>>2]=(c[e>>2]|0)-1;wa=0;xa=0}}while(0);qa=xf(n<<2|0>>>30,s<<2|n>>>30,-32,-1)|0;r=xf(qa,E,xa,wa)|0;qa=E;if((va|0)==0){l=+(t|0)*0.0;i=g;return+l}o=0;if((qa|0)>(o|0)|(qa|0)==(o|0)&r>>>0>(-j|0)>>>0){c[(Ya()|0)>>2]=34;l=+(t|0)*1.7976931348623157e+308*1.7976931348623157e+308;i=g;return+l}o=j-106|0;ra=(o|0)<0|0?-1:0;if((qa|0)<(ra|0)|(qa|0)==(ra|0)&r>>>0<o>>>0){c[(Ya()|0)>>2]=34;l=+(t|0)*2.2250738585072014e-308*2.2250738585072014e-308;i=g;return+l}if((va|0)>-1){o=va;pa=U;ra=qa;sa=r;while(1){ta=o<<1;if(pa<.5){ya=pa;za=ta}else{ya=pa+-1.0;za=ta|1}Aa=pa+ya;ta=xf(sa,ra,-1,-1)|0;ua=E;if((za|0)>-1){o=za;pa=Aa;ra=ua;sa=ta}else{Ba=za;Ca=Aa;Da=ua;Ea=ta;break}}}else{Ba=va;Ca=U;Da=qa;Ea=r}sa=0;ra=yf(32,0,j,(j|0)<0|0?-1:0)|0;o=xf(Ea,Da,ra,E)|0;ra=E;if((sa|0)>(ra|0)|(sa|0)==(ra|0)&k>>>0>o>>>0){ra=o;Fa=(ra|0)<0?0:ra}else{Fa=k}do{if((Fa|0)<53){pa=+(t|0);Aa=+Oa(+(+jf(1.0,84-Fa|0)),+pa);if(!((Fa|0)<32&Ca!=0.0)){Ga=Ca;Ha=Ba;Ja=Aa;Ka=pa;break}ra=Ba&1;Ga=(ra|0)==0?0.0:Ca;Ha=(ra^1)+Ba|0;Ja=Aa;Ka=pa}else{Ga=Ca;Ha=Ba;Ja=0.0;Ka=+(t|0)}}while(0);pa=Ka*Ga+(Ja+Ka*+(Ha>>>0>>>0))-Ja;if(!(pa!=0.0)){c[(Ya()|0)>>2]=34}l=+kf(pa,Ea);i=g;return+l}else{H=y}}while(0);r=j+k|0;qa=-r|0;ra=H;o=0;while(1){if((ra|0)==46){x=139;break}else if((ra|0)!=48){Ma=ra;Na=0;Pa=o;Qa=0;Ra=0;break}sa=c[e>>2]|0;if(sa>>>0<(c[m>>2]|0)>>>0){c[e>>2]=sa+1;ra=d[sa]|0;o=1;continue}else{ra=hf(b)|0;o=1;continue}}d:do{if((x|0)==139){ra=c[e>>2]|0;if(ra>>>0<(c[m>>2]|0)>>>0){c[e>>2]=ra+1;Sa=d[ra]|0}else{Sa=hf(b)|0}if((Sa|0)==48){Ta=-1;Ua=-1}else{Ma=Sa;Na=1;Pa=o;Qa=0;Ra=0;break}while(1){ra=c[e>>2]|0;if(ra>>>0<(c[m>>2]|0)>>>0){c[e>>2]=ra+1;Va=d[ra]|0}else{Va=hf(b)|0}if((Va|0)!=48){Ma=Va;Na=1;Pa=1;Qa=Ta;Ra=Ua;break d}ra=xf(Ua,Ta,-1,-1)|0;Ta=E;Ua=ra}}}while(0);o=h|0;c[o>>2]=0;ra=Ma-48|0;sa=(Ma|0)==46;e:do{if(ra>>>0<10>>>0|sa){n=h+496|0;s=Qa;ta=Ra;ua=0;Wa=0;Xa=0;Za=Pa;_a=Na;$a=0;ab=0;bb=Ma;cb=ra;db=sa;while(1){do{if(db){if((_a|0)==0){eb=ab;fb=$a;gb=1;hb=Za;ib=Xa;jb=ua;kb=Wa;lb=ua;mb=Wa}else{nb=s;ob=ta;pb=ua;qb=Wa;rb=Xa;sb=Za;tb=$a;ub=ab;vb=bb;break e}}else{wb=xf(Wa,ua,1,0)|0;xb=E;yb=(bb|0)!=48;if(($a|0)>=125){if(!yb){eb=ab;fb=$a;gb=_a;hb=Za;ib=Xa;jb=xb;kb=wb;lb=s;mb=ta;break}c[n>>2]=c[n>>2]|1;eb=ab;fb=$a;gb=_a;hb=Za;ib=Xa;jb=xb;kb=wb;lb=s;mb=ta;break}zb=h+($a<<2)|0;if((ab|0)==0){Ab=cb}else{Ab=bb-48+((c[zb>>2]|0)*10|0)|0}c[zb>>2]=Ab;zb=ab+1|0;Bb=(zb|0)==9;eb=Bb?0:zb;fb=(Bb&1)+$a|0;gb=_a;hb=1;ib=yb?wb:Xa;jb=xb;kb=wb;lb=s;mb=ta}}while(0);wb=c[e>>2]|0;if(wb>>>0<(c[m>>2]|0)>>>0){c[e>>2]=wb+1;Cb=d[wb]|0}else{Cb=hf(b)|0}wb=Cb-48|0;xb=(Cb|0)==46;if(wb>>>0<10>>>0|xb){s=lb;ta=mb;ua=jb;Wa=kb;Xa=ib;Za=hb;_a=gb;$a=fb;ab=eb;bb=Cb;cb=wb;db=xb}else{Db=lb;Eb=mb;Fb=jb;Gb=kb;Hb=ib;Ib=hb;Jb=gb;Kb=fb;Lb=eb;Mb=Cb;x=162;break}}}else{Db=Qa;Eb=Ra;Fb=0;Gb=0;Hb=0;Ib=Pa;Jb=Na;Kb=0;Lb=0;Mb=Ma;x=162}}while(0);if((x|0)==162){sa=(Jb|0)==0;nb=sa?Fb:Db;ob=sa?Gb:Eb;pb=Fb;qb=Gb;rb=Hb;sb=Ib;tb=Kb;ub=Lb;vb=Mb}sa=(sb|0)!=0;do{if(sa){if((vb|32|0)!=101){x=171;break}ra=ff(b,f)|0;db=E;do{if((ra|0)==0&(db|0)==(-2147483648|0)){if(w){gf(b,0);l=0.0;i=g;return+l}else{if((c[m>>2]|0)==0){Nb=0;Ob=0;break}c[e>>2]=(c[e>>2]|0)-1;Nb=0;Ob=0;break}}else{Nb=db;Ob=ra}}while(0);ra=xf(Ob,Nb,ob,nb)|0;Pb=E;Qb=ra}else{x=171}}while(0);do{if((x|0)==171){if(!((vb|0)>-1)){Pb=nb;Qb=ob;break}if((c[m>>2]|0)==0){Pb=nb;Qb=ob;break}c[e>>2]=(c[e>>2]|0)-1;Pb=nb;Qb=ob}}while(0);if(!sa){c[(Ya()|0)>>2]=22;gf(b,0);l=0.0;i=g;return+l}w=c[o>>2]|0;if((w|0)==0){l=+(t|0)*0.0;i=g;return+l}ra=0;do{if((Qb|0)==(qb|0)&(Pb|0)==(pb|0)&((pb|0)<(ra|0)|(pb|0)==(ra|0)&qb>>>0<10>>>0)){if(!(k>>>0>30>>>0)){if((w>>>(k>>>0)|0)!=0){break}}l=+(t|0)*+(w>>>0>>>0);i=g;return+l}}while(0);w=(j|0)/-2|0;ra=(w|0)<0|0?-1:0;if((Pb|0)>(ra|0)|(Pb|0)==(ra|0)&Qb>>>0>w>>>0){c[(Ya()|0)>>2]=34;l=+(t|0)*1.7976931348623157e+308*1.7976931348623157e+308;i=g;return+l}w=j-106|0;ra=(w|0)<0|0?-1:0;if((Pb|0)<(ra|0)|(Pb|0)==(ra|0)&Qb>>>0<w>>>0){c[(Ya()|0)>>2]=34;l=+(t|0)*2.2250738585072014e-308*2.2250738585072014e-308;i=g;return+l}if((ub|0)==0){Rb=tb}else{if((ub|0)<9){w=h+(tb<<2)|0;ra=ub;sa=c[w>>2]|0;do{sa=sa*10|0;ra=ra+1|0;}while((ra|0)<9);c[w>>2]=sa}Rb=tb+1|0}ra=Qb;do{if((rb|0)<9){if(!((rb|0)<=(ra|0)&(ra|0)<18)){break}if((ra|0)==9){l=+(t|0)*+((c[o>>2]|0)>>>0>>>0);i=g;return+l}if((ra|0)<9){l=+(t|0)*+((c[o>>2]|0)>>>0>>>0)/+(c[640+(8-ra<<2)>>2]|0);i=g;return+l}db=k+27+(ra*-3|0)|0;cb=c[o>>2]|0;if((db|0)<=30){if((cb>>>(db>>>0)|0)!=0){break}}l=+(t|0)*+(cb>>>0>>>0)*+(c[640+(ra-10<<2)>>2]|0);i=g;return+l}}while(0);o=(ra|0)%9|0;if((o|0)==0){Sb=0;Tb=Rb;Ub=0;Vb=ra}else{sa=(ra|0)>-1?o:o+9|0;o=c[640+(8-sa<<2)>>2]|0;do{if((Rb|0)==0){Wb=0;Xb=0;Yb=ra}else{w=1e9/(o|0)|0;cb=ra;db=0;bb=0;ab=0;while(1){$a=h+(bb<<2)|0;_a=c[$a>>2]|0;Za=((_a>>>0)/(o>>>0)|0)+ab|0;c[$a>>2]=Za;Zb=aa((_a>>>0)%(o>>>0)|0,w)|0;_a=bb+1|0;if((bb|0)==(db|0)&(Za|0)==0){_b=_a&127;$b=cb-9|0}else{_b=db;$b=cb}if((_a|0)==(Rb|0)){break}else{cb=$b;db=_b;bb=_a;ab=Zb}}if((Zb|0)==0){Wb=Rb;Xb=_b;Yb=$b;break}c[h+(Rb<<2)>>2]=Zb;Wb=Rb+1|0;Xb=_b;Yb=$b}}while(0);Sb=Xb;Tb=Wb;Ub=0;Vb=9-sa+Yb|0}f:while(1){o=h+(Sb<<2)|0;if((Vb|0)<18){ra=Tb;ab=Ub;while(1){bb=0;db=ra+127|0;cb=ra;while(1){w=db&127;_a=h+(w<<2)|0;Za=c[_a>>2]|0;$a=xf(Za<<29|0>>>3,0<<29|Za>>>3,bb,0)|0;Za=E;Xa=0;if(Za>>>0>Xa>>>0|Za>>>0==Xa>>>0&$a>>>0>1e9>>>0){Xa=If($a,Za,1e9,0)|0;Wa=Jf($a,Za,1e9,0)|0;ac=Xa;bc=Wa}else{ac=0;bc=$a}c[_a>>2]=bc;_a=(w|0)==(Sb|0);if((w|0)!=(cb+127&127|0)|_a){cc=cb}else{cc=(bc|0)==0?w:cb}if(_a){break}else{bb=ac;db=w-1|0;cb=cc}}cb=ab-29|0;if((ac|0)==0){ra=cc;ab=cb}else{dc=cb;ec=cc;fc=ac;break}}}else{if((Vb|0)==18){gc=Tb;hc=Ub}else{ic=Sb;jc=Tb;kc=Ub;lc=Vb;break}while(1){if(!((c[o>>2]|0)>>>0<9007199>>>0)){ic=Sb;jc=gc;kc=hc;lc=18;break f}ab=0;ra=gc+127|0;cb=gc;while(1){db=ra&127;bb=h+(db<<2)|0;w=c[bb>>2]|0;_a=xf(w<<29|0>>>3,0<<29|w>>>3,ab,0)|0;w=E;$a=0;if(w>>>0>$a>>>0|w>>>0==$a>>>0&_a>>>0>1e9>>>0){$a=If(_a,w,1e9,0)|0;Wa=Jf(_a,w,1e9,0)|0;mc=$a;nc=Wa}else{mc=0;nc=_a}c[bb>>2]=nc;bb=(db|0)==(Sb|0);if((db|0)!=(cb+127&127|0)|bb){oc=cb}else{oc=(nc|0)==0?db:cb}if(bb){break}else{ab=mc;ra=db-1|0;cb=oc}}cb=hc-29|0;if((mc|0)==0){gc=oc;hc=cb}else{dc=cb;ec=oc;fc=mc;break}}}o=Sb+127&127;if((o|0)==(ec|0)){cb=ec+127&127;ra=h+((ec+126&127)<<2)|0;c[ra>>2]=c[ra>>2]|c[h+(cb<<2)>>2];pc=cb}else{pc=ec}c[h+(o<<2)>>2]=fc;Sb=o;Tb=pc;Ub=dc;Vb=Vb+9|0}g:while(1){qc=jc+1&127;sa=h+((jc+127&127)<<2)|0;o=ic;cb=kc;ra=lc;while(1){ab=(ra|0)==18;db=(ra|0)>27?9:1;rc=o;sc=cb;while(1){bb=0;while(1){_a=bb+rc&127;if((_a|0)==(jc|0)){tc=2;break}Wa=c[h+(_a<<2)>>2]|0;_a=c[632+(bb<<2)>>2]|0;if(Wa>>>0<_a>>>0){tc=2;break}$a=bb+1|0;if(Wa>>>0>_a>>>0){tc=bb;break}if(($a|0)<2){bb=$a}else{tc=$a;break}}if((tc|0)==2&ab){break g}uc=db+sc|0;if((rc|0)==(jc|0)){rc=jc;sc=uc}else{break}}ab=(1<<db)-1|0;bb=1e9>>>(db>>>0);vc=ra;wc=rc;$a=rc;xc=0;do{_a=h+($a<<2)|0;Wa=c[_a>>2]|0;w=(Wa>>>(db>>>0))+xc|0;c[_a>>2]=w;xc=aa(Wa&ab,bb)|0;Wa=($a|0)==(wc|0)&(w|0)==0;$a=$a+1&127;vc=Wa?vc-9|0:vc;wc=Wa?$a:wc;}while(($a|0)!=(jc|0));if((xc|0)==0){o=wc;cb=uc;ra=vc;continue}if((qc|0)!=(wc|0)){break}c[sa>>2]=c[sa>>2]|1;o=wc;cb=uc;ra=vc}c[h+(jc<<2)>>2]=xc;ic=wc;jc=qc;kc=uc;lc=vc}ra=rc&127;if((ra|0)==(jc|0)){c[h+(qc-1<<2)>>2]=0;yc=qc}else{yc=jc}pa=+((c[h+(ra<<2)>>2]|0)>>>0>>>0);ra=rc+1&127;if((ra|0)==(yc|0)){cb=yc+1&127;c[h+(cb-1<<2)>>2]=0;zc=cb}else{zc=yc}Aa=+(t|0);Ac=Aa*(pa*1.0e9+ +((c[h+(ra<<2)>>2]|0)>>>0>>>0));ra=sc+53|0;cb=ra-j|0;if((cb|0)<(k|0)){Bc=(cb|0)<0?0:cb;Cc=1}else{Bc=k;Cc=0}if((Bc|0)<53){pa=+Oa(+(+jf(1.0,105-Bc|0)),+Ac);Dc=+La(+Ac,+(+jf(1.0,53-Bc|0)));Ec=pa;Fc=Dc;Gc=pa+(Ac-Dc)}else{Ec=0.0;Fc=0.0;Gc=Ac}o=rc+2&127;do{if((o|0)==(zc|0)){Hc=Fc}else{sa=c[h+(o<<2)>>2]|0;do{if(sa>>>0<5e8>>>0){if((sa|0)==0){if((rc+3&127|0)==(zc|0)){Ic=Fc;break}}Ic=Aa*.25+Fc}else{if(sa>>>0>5e8>>>0){Ic=Aa*.75+Fc;break}if((rc+3&127|0)==(zc|0)){Ic=Aa*.5+Fc;break}else{Ic=Aa*.75+Fc;break}}}while(0);if((53-Bc|0)<=1){Hc=Ic;break}if(+La(+Ic,+1.0)!=0.0){Hc=Ic;break}Hc=Ic+1.0}}while(0);Aa=Gc+Hc-Ec;do{if((ra&2147483647|0)>(-2-r|0)){if(+P(+Aa)<9007199254740992.0){Jc=Aa;Kc=Cc;Lc=sc}else{Jc=Aa*.5;Kc=(Cc|0)!=0&(Bc|0)==(cb|0)?0:Cc;Lc=sc+1|0}if((Lc+50|0)<=(qa|0)){if(!((Kc|0)!=0&Hc!=0.0)){Mc=Jc;Nc=Lc;break}}c[(Ya()|0)>>2]=34;Mc=Jc;Nc=Lc}else{Mc=Aa;Nc=sc}}while(0);l=+kf(Mc,Nc);i=g;return+l}else{if((c[m>>2]|0)!=0){c[e>>2]=(c[e>>2]|0)-1}c[(Ya()|0)>>2]=22;gf(b,0);l=0.0;i=g;return+l}}}while(0);do{if((x|0)==23){b=(c[m>>2]|0)==0;if(!b){c[e>>2]=(c[e>>2]|0)-1}if(u>>>0<4>>>0|(f|0)==0|b){break}else{Oc=u}do{c[e>>2]=(c[e>>2]|0)-1;Oc=Oc-1|0;}while(Oc>>>0>3>>>0)}}while(0);l=+(t|0)*q;i=g;return+l}function ff(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;e=a+4|0;f=c[e>>2]|0;g=a+100|0;if(f>>>0<(c[g>>2]|0)>>>0){c[e>>2]=f+1;h=d[f]|0}else{h=hf(a)|0}do{if((h|0)==45|(h|0)==43){f=(h|0)==45|0;i=c[e>>2]|0;if(i>>>0<(c[g>>2]|0)>>>0){c[e>>2]=i+1;j=d[i]|0}else{j=hf(a)|0}if((j-48|0)>>>0<10>>>0|(b|0)==0){k=f;l=j;break}if((c[g>>2]|0)==0){k=f;l=j;break}c[e>>2]=(c[e>>2]|0)-1;k=f;l=j}else{k=0;l=h}}while(0);if((l-48|0)>>>0>9>>>0){if((c[g>>2]|0)==0){m=-2147483648;n=0;return(E=m,n)|0}c[e>>2]=(c[e>>2]|0)-1;m=-2147483648;n=0;return(E=m,n)|0}else{o=l;p=0}while(1){q=o-48+p|0;l=c[e>>2]|0;if(l>>>0<(c[g>>2]|0)>>>0){c[e>>2]=l+1;r=d[l]|0}else{r=hf(a)|0}if(!((r-48|0)>>>0<10>>>0&(q|0)<214748364)){break}o=r;p=q*10|0}p=q;o=(q|0)<0|0?-1:0;if((r-48|0)>>>0<10>>>0){q=r;l=o;h=p;while(1){j=Hf(h,l,10,0)|0;b=E;f=xf(q,(q|0)<0|0?-1:0,-48,-1)|0;i=xf(f,E,j,b)|0;b=E;j=c[e>>2]|0;if(j>>>0<(c[g>>2]|0)>>>0){c[e>>2]=j+1;s=d[j]|0}else{s=hf(a)|0}j=21474836;if((s-48|0)>>>0<10>>>0&((b|0)<(j|0)|(b|0)==(j|0)&i>>>0<2061584302>>>0)){q=s;l=b;h=i}else{t=s;u=b;v=i;break}}}else{t=r;u=o;v=p}if((t-48|0)>>>0<10>>>0){do{t=c[e>>2]|0;if(t>>>0<(c[g>>2]|0)>>>0){c[e>>2]=t+1;w=d[t]|0}else{w=hf(a)|0}}while((w-48|0)>>>0<10>>>0)}if((c[g>>2]|0)!=0){c[e>>2]=(c[e>>2]|0)-1}e=(k|0)!=0;k=yf(0,0,v,u)|0;m=e?E:u;n=e?k:v;return(E=m,n)|0}function gf(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;c[a+104>>2]=b;d=c[a+8>>2]|0;e=c[a+4>>2]|0;f=d-e|0;c[a+108>>2]=f;if((b|0)!=0&(f|0)>(b|0)){c[a+100>>2]=e+b;return}else{c[a+100>>2]=d;return}}function hf(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=b+104|0;f=c[e>>2]|0;if((f|0)==0){g=3}else{if((c[b+108>>2]|0)<(f|0)){g=3}}do{if((g|0)==3){f=mf(b)|0;if((f|0)<0){break}h=c[e>>2]|0;i=c[b+8>>2]|0;do{if((h|0)==0){g=8}else{j=c[b+4>>2]|0;k=h-(c[b+108>>2]|0)-1|0;if((i-j|0)<=(k|0)){g=8;break}c[b+100>>2]=j+k}}while(0);if((g|0)==8){c[b+100>>2]=i}h=c[b+4>>2]|0;if((i|0)!=0){k=b+108|0;c[k>>2]=i+1-h+(c[k>>2]|0)}k=h-1|0;if((d[k]|0|0)==(f|0)){l=f;return l|0}a[k]=f;l=f;return l|0}}while(0);c[b+100>>2]=0;l=-1;return l|0}function jf(a,b){a=+a;b=b|0;var d=0.0,e=0,f=0.0,g=0;do{if((b|0)>1023){d=a*8.98846567431158e+307;e=b-1023|0;if((e|0)<=1023){f=d;g=e;break}e=b-2046|0;f=d*8.98846567431158e+307;g=(e|0)>1023?1023:e}else{if(!((b|0)<-1022)){f=a;g=b;break}d=a*2.2250738585072014e-308;e=b+1022|0;if(!((e|0)<-1022)){f=d;g=e;break}e=b+2044|0;f=d*2.2250738585072014e-308;g=(e|0)<-1022?-1022:e}}while(0);return+(f*(c[k>>2]=0<<20|0>>>12,c[k+4>>2]=g+1023<<20|0>>>12,+h[k>>3]))}function kf(a,b){a=+a;b=b|0;return+(+jf(a,b))}function lf(b){b=b|0;var d=0,e=0,f=0,g=0,h=0;d=b+74|0;e=a[d]|0;a[d]=e-1&255|e;e=b+20|0;d=b+44|0;if((c[e>>2]|0)>>>0>(c[d>>2]|0)>>>0){jb[c[b+36>>2]&3](b,0,0)|0}c[b+16>>2]=0;c[b+28>>2]=0;c[e>>2]=0;e=b|0;f=c[e>>2]|0;if((f&20|0)==0){g=c[d>>2]|0;c[b+8>>2]=g;c[b+4>>2]=g;h=0;return h|0}if((f&4|0)==0){h=-1;return h|0}c[e>>2]=f|32;h=-1;return h|0}function mf(a){a=a|0;var b=0,e=0,f=0,g=0;b=i;i=i+8|0;e=b|0;if((c[a+8>>2]|0)==0){if((lf(a)|0)==0){f=3}else{g=-1}}else{f=3}do{if((f|0)==3){if((jb[c[a+32>>2]&3](a,e,1)|0)!=1){g=-1;break}g=d[e]|0}}while(0);i=b;return g|0}function nf(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0.0,j=0,k=0,l=0,m=0;d=i;i=i+112|0;e=d|0;uf(e|0,0,112)|0;f=e+4|0;c[f>>2]=a;g=e+8|0;c[g>>2]=-1;c[e+44>>2]=a;c[e+76>>2]=-1;gf(e,0);h=+ef(e,1,1);j=(c[f>>2]|0)-(c[g>>2]|0)+(c[e+108>>2]|0)|0;if((b|0)==0){k=112;l=0;i=d;return+h}if((j|0)==0){m=a}else{m=a+j|0}c[b>>2]=m;k=112;l=0;i=d;return+h}function of(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;if((d|0)==0){e=0;return e|0}else{f=d;g=b;h=c}while(1){i=a[g]|0;j=a[h]|0;if(!(i<<24>>24==j<<24>>24)){break}c=f-1|0;if((c|0)==0){e=0;k=5;break}else{f=c;g=g+1|0;h=h+1|0}}if((k|0)==5){return e|0}e=(i&255)-(j&255)|0;return e|0}function pf(b,c){b=b|0;c=c|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;d=a[b]|0;e=a[c]|0;if(d<<24>>24!=e<<24>>24|d<<24>>24==0|e<<24>>24==0){f=d;g=e;h=f&255;i=g&255;j=h-i|0;return j|0}else{k=b;l=c}while(1){c=k+1|0;b=l+1|0;e=a[c]|0;d=a[b]|0;if(e<<24>>24!=d<<24>>24|e<<24>>24==0|d<<24>>24==0){f=e;g=d;break}else{k=c;l=b}}h=f&255;i=g&255;j=h-i|0;return j|0}function qf(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function rf(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((e|0)>=4096)return Ra(b|0,d|0,e|0)|0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}



function sf(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;t=t+1|0;c[a>>2]=t;while((e|0)<40){if((c[d+(e<<2)>>2]|0)==0){c[d+(e<<2)>>2]=t;c[d+((e<<2)+4)>>2]=b;c[d+((e<<2)+8)>>2]=0;return 0}e=e+2|0}Ua(116);Ua(111);Ua(111);Ua(32);Ua(109);Ua(97);Ua(110);Ua(121);Ua(32);Ua(115);Ua(101);Ua(116);Ua(106);Ua(109);Ua(112);Ua(115);Ua(32);Ua(105);Ua(110);Ua(32);Ua(97);Ua(32);Ua(102);Ua(117);Ua(110);Ua(99);Ua(116);Ua(105);Ua(111);Ua(110);Ua(32);Ua(99);Ua(97);Ua(108);Ua(108);Ua(44);Ua(32);Ua(98);Ua(117);Ua(105);Ua(108);Ua(100);Ua(32);Ua(119);Ua(105);Ua(116);Ua(104);Ua(32);Ua(97);Ua(32);Ua(104);Ua(105);Ua(103);Ua(104);Ua(101);Ua(114);Ua(32);Ua(118);Ua(97);Ua(108);Ua(117);Ua(101);Ua(32);Ua(102);Ua(111);Ua(114);Ua(32);Ua(77);Ua(65);Ua(88);Ua(95);Ua(83);Ua(69);Ua(84);Ua(74);Ua(77);Ua(80);Ua(83);Ua(10);ba(0);return 0}function tf(a,b){a=a|0;b=b|0;var d=0,e=0;while((d|0)<20){e=c[b+(d<<2)>>2]|0;if((e|0)==0)break;if((e|0)==(a|0)){return c[b+((d<<2)+4)>>2]|0}d=d+2|0}return 0}function uf(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b+e|0;if((e|0)>=20){d=d&255;g=b&3;h=d|d<<8|d<<16|d<<24;i=f&~3;if(g){g=b+4-g|0;while((b|0)<(g|0)){a[b]=d;b=b+1|0}}while((b|0)<(i|0)){c[b>>2]=h;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}return b-e|0}function vf(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0;while((e|0)<(d|0)){a[b+e|0]=f?0:a[c+e|0]|0;f=f?1:(a[c+e|0]|0)==0;e=e+1|0}return b|0}function wf(b,c){b=b|0;c=c|0;var d=0,e=0;d=b+(qf(b)|0)|0;do{a[d+e|0]=a[c+e|0];e=e+1|0}while(a[c+(e-1)|0]|0);return b|0}function xf(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=a+c>>>0;return(E=b+d+(e>>>0<a>>>0|0)>>>0,e|0)|0}function yf(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=b-d>>>0;e=b-d-(c>>>0>a>>>0|0)>>>0;return(E=e,a-c>>>0|0)|0}function zf(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){E=b<<c|(a&(1<<c)-1<<32-c)>>>32-c;return a<<c}E=a<<c-32;return 0}function Af(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){E=b>>>c;return a>>>c|(b&(1<<c)-1)<<32-c}E=0;return b>>>c-32|0}function Bf(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){E=b>>c;return a>>>c|(b&(1<<c)-1)<<32-c}E=(b|0)<0?-1:0;return b>>c-32|0}function Cf(b){b=b|0;var c=0;c=a[n+(b>>>24)|0]|0;if((c|0)<8)return c|0;c=a[n+(b>>16&255)|0]|0;if((c|0)<8)return c+8|0;c=a[n+(b>>8&255)|0]|0;if((c|0)<8)return c+16|0;return(a[n+(b&255)|0]|0)+24|0}function Df(b){b=b|0;var c=0;c=a[m+(b&255)|0]|0;if((c|0)<8)return c|0;c=a[m+(b>>8&255)|0]|0;if((c|0)<8)return c+8|0;c=a[m+(b>>16&255)|0]|0;if((c|0)<8)return c+16|0;return(a[m+(b>>>24)|0]|0)+24|0}function Ef(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0;c=a&65535;d=b&65535;e=aa(d,c)|0;f=a>>>16;a=(e>>>16)+(aa(d,f)|0)|0;d=b>>>16;b=aa(d,c)|0;return(E=(a>>>16)+(aa(d,f)|0)+(((a&65535)+b|0)>>>16)|0,a+b<<16|e&65535|0)|0}function Ff(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=b>>31|((b|0)<0?-1:0)<<1;f=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;g=d>>31|((d|0)<0?-1:0)<<1;h=((d|0)<0?-1:0)>>31|((d|0)<0?-1:0)<<1;i=yf(e^a,f^b,e,f)|0;b=E;a=g^e;e=h^f;f=yf((Kf(i,b,yf(g^c,h^d,g,h)|0,E,0)|0)^a,E^e,a,e)|0;return(E=E,f)|0}function Gf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;g=f|0;h=b>>31|((b|0)<0?-1:0)<<1;j=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;k=e>>31|((e|0)<0?-1:0)<<1;l=((e|0)<0?-1:0)>>31|((e|0)<0?-1:0)<<1;m=yf(h^a,j^b,h,j)|0;b=E;Kf(m,b,yf(k^d,l^e,k,l)|0,E,g)|0;l=yf(c[g>>2]^h,c[g+4>>2]^j,h,j)|0;j=E;i=f;return(E=j,l)|0}function Hf(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=a;a=c;c=Ef(e,a)|0;f=E;return(E=(aa(b,a)|0)+(aa(d,e)|0)+f|f&0,c|0|0)|0}function If(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=Kf(a,b,c,d,0)|0;return(E=E,e)|0}function Jf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+8|0;g=f|0;Kf(a,b,d,e,g)|0;i=f;return(E=c[g+4>>2]|0,c[g>>2]|0)|0}function Kf(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;g=a;h=b;i=h;j=d;k=e;l=k;if((i|0)==0){m=(f|0)!=0;if((l|0)==0){if(m){c[f>>2]=(g>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(g>>>0)/(j>>>0)>>>0;return(E=n,o)|0}else{if(!m){n=0;o=0;return(E=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=b&0;n=0;o=0;return(E=n,o)|0}}m=(l|0)==0;do{if((j|0)==0){if(m){if((f|0)!=0){c[f>>2]=(i>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(i>>>0)/(j>>>0)>>>0;return(E=n,o)|0}if((g|0)==0){if((f|0)!=0){c[f>>2]=0;c[f+4>>2]=(i>>>0)%(l>>>0)}n=0;o=(i>>>0)/(l>>>0)>>>0;return(E=n,o)|0}p=l-1|0;if((p&l|0)==0){if((f|0)!=0){c[f>>2]=a|0;c[f+4>>2]=p&i|b&0}n=0;o=i>>>((Df(l|0)|0)>>>0);return(E=n,o)|0}p=(Cf(l|0)|0)-(Cf(i|0)|0)|0;if(p>>>0<=30){q=p+1|0;r=31-p|0;s=q;t=i<<r|g>>>(q>>>0);u=i>>>(q>>>0);v=0;w=g<<r;break}if((f|0)==0){n=0;o=0;return(E=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=h|b&0;n=0;o=0;return(E=n,o)|0}else{if(!m){r=(Cf(l|0)|0)-(Cf(i|0)|0)|0;if(r>>>0<=31){q=r+1|0;p=31-r|0;x=r-31>>31;s=q;t=g>>>(q>>>0)&x|i<<p;u=i>>>(q>>>0)&x;v=0;w=g<<p;break}if((f|0)==0){n=0;o=0;return(E=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=h|b&0;n=0;o=0;return(E=n,o)|0}p=j-1|0;if((p&j|0)!=0){x=(Cf(j|0)|0)+33-(Cf(i|0)|0)|0;q=64-x|0;r=32-x|0;y=r>>31;z=x-32|0;A=z>>31;s=x;t=r-1>>31&i>>>(z>>>0)|(i<<r|g>>>(x>>>0))&A;u=A&i>>>(x>>>0);v=g<<q&y;w=(i<<q|g>>>(z>>>0))&y|g<<r&x-33>>31;break}if((f|0)!=0){c[f>>2]=p&g;c[f+4>>2]=0}if((j|0)==1){n=h|b&0;o=a|0|0;return(E=n,o)|0}else{p=Df(j|0)|0;n=i>>>(p>>>0)|0;o=i<<32-p|g>>>(p>>>0)|0;return(E=n,o)|0}}}while(0);if((s|0)==0){B=w;C=v;D=u;F=t;G=0;H=0}else{g=d|0|0;d=k|e&0;e=xf(g,d,-1,-1)|0;k=E;i=w;w=v;v=u;u=t;t=s;s=0;while(1){I=w>>>31|i<<1;J=s|w<<1;j=u<<1|i>>>31|0;a=u>>>31|v<<1|0;yf(e,k,j,a)|0;b=E;h=b>>31|((b|0)<0?-1:0)<<1;K=h&1;L=yf(j,a,h&g,(((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1)&d)|0;M=E;b=t-1|0;if((b|0)==0){break}else{i=I;w=J;v=M;u=L;t=b;s=K}}B=I;C=J;D=M;F=L;G=0;H=K}K=C;C=0;if((f|0)!=0){c[f>>2]=F;c[f+4>>2]=D}n=(K|0)>>>31|(B|C)<<1|(C<<1|K>>>31)&0|G;o=(K<<1|0>>>31)&-2|H;return(E=n,o)|0}function Lf(a,b){a=a|0;b=b|0;return fb[a&3](b|0)|0}function Mf(a,b){a=a|0;b=b|0;gb[a&1](b|0)}function Nf(a,b,c){a=a|0;b=b|0;c=c|0;hb[a&7](b|0,c|0)}function Of(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ib[a&15](b|0,c|0,d|0,e|0)|0}function Pf(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return jb[a&3](b|0,c|0,d|0)|0}function Qf(a){a=a|0;kb[a&1]()}function Rf(a,b,c){a=a|0;b=b|0;c=c|0;return lb[a&1](b|0,c|0)|0}function Sf(a){a=a|0;ba(0);return 0}function Tf(a){a=a|0;ba(1)}function Uf(a,b){a=a|0;b=b|0;ba(2)}function Vf(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ba(3);return 0}function Wf(a,b,c){a=a|0;b=b|0;c=c|0;ba(4);return 0}function Xf(){ba(5)}function Yf(a,b){a=a|0;b=b|0;ba(6);return 0}




// EMSCRIPTEN_END_FUNCS
var fb=[Sf,Sf,Xb,Sf];var gb=[Tf,Tf];var hb=[Uf,Uf,Zc,Uf,qe,Uf,Uf,Uf];var ib=[Vf,Vf,Ie,Vf,Ze,Vf,Xd,Vf,Wb,Vf,Vf,Vf,Vf,Vf,Vf,Vf];var jb=[Wf,Wf,Ub,Wf];var kb=[Xf,Xf];var lb=[Yf,Yf];return{_go_for_it:Ye,_strlen:qf,_strcat:wf,_free:af,_testSetjmp:tf,_strncpy:vf,_realloc:bf,_memset:uf,_malloc:$e,_saveSetjmp:sf,_memcpy:rf,runPostSets:Cb,stackAlloc:mb,stackSave:nb,stackRestore:ob,setThrew:pb,setTempRet0:sb,setTempRet1:tb,setTempRet2:ub,setTempRet3:vb,setTempRet4:wb,setTempRet5:xb,setTempRet6:yb,setTempRet7:zb,setTempRet8:Ab,setTempRet9:Bb,dynCall_ii:Lf,dynCall_vi:Mf,dynCall_vii:Nf,dynCall_iiiii:Of,dynCall_iiii:Pf,dynCall_v:Qf,dynCall_iii:Rf}})


// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_ii": invoke_ii, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_iiiii": invoke_iiiii, "invoke_iiii": invoke_iiii, "invoke_v": invoke_v, "invoke_iii": invoke_iii, "_llvm_va_end": _llvm_va_end, "_llvm_lifetime_end": _llvm_lifetime_end, "_snprintf": _snprintf, "_abort": _abort, "_fprintf": _fprintf, "_strtoul": _strtoul, "_fflush": _fflush, "_fabs": _fabs, "__reallyNegative": __reallyNegative, "_strchr": _strchr, "_sysconf": _sysconf, "_isalnum": _isalnum, "_floor": _floor, "___setErrNo": ___setErrNo, "_fwrite": _fwrite, "_nan": _nan, "_send": _send, "_write": _write, "_isalpha": _isalpha, "_exit": _exit, "_sprintf": _sprintf, "_isspace": _isspace, "_strncat": _strncat, "_longjmp": _longjmp, "_fmod": _fmod, "_strcspn": _strcspn, "_fputc": _fputc, "_copysign": _copysign, "__formatString": __formatString, "_emscripten_asm_const_int": _emscripten_asm_const_int, "_emscripten_memcpy_big": _emscripten_memcpy_big, "_fileno": _fileno, "_pwrite": _pwrite, "_putchar": _putchar, "_llvm_pow_f64": _llvm_pow_f64, "_sbrk": _sbrk, "_localeconv": _localeconv, "___errno_location": ___errno_location, "_iscntrl": _iscntrl, "_llvm_lifetime_start": _llvm_lifetime_start, "_mkport": _mkport, "__parseInt": __parseInt, "_time": _time, "__exit": __exit, "_memchr": _memchr, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "cttz_i8": cttz_i8, "ctlz_i8": ctlz_i8, "NaN": NaN, "Infinity": Infinity, "_stderr": _stderr }, buffer);
var _go_for_it = Module["_go_for_it"] = asm["_go_for_it"];
var _strlen = Module["_strlen"] = asm["_strlen"];
var _strcat = Module["_strcat"] = asm["_strcat"];
var _free = Module["_free"] = asm["_free"];
var _testSetjmp = Module["_testSetjmp"] = asm["_testSetjmp"];
var _strncpy = Module["_strncpy"] = asm["_strncpy"];
var _realloc = Module["_realloc"] = asm["_realloc"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _saveSetjmp = Module["_saveSetjmp"] = asm["_saveSetjmp"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_iiiii = Module["dynCall_iiiii"] = asm["dynCall_iiiii"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];

Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };

// TODO: strip out parts of this we do not need

//======= begin closure i64 code =======

// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Defines a Long class for representing a 64-bit two's-complement
 * integer value, which faithfully simulates the behavior of a Java "long". This
 * implementation is derived from LongLib in GWT.
 *
 */

var i64Math = (function() { // Emscripten wrapper
  var goog = { math: {} };


  /**
   * Constructs a 64-bit two's-complement integer, given its low and high 32-bit
   * values as *signed* integers.  See the from* functions below for more
   * convenient ways of constructing Longs.
   *
   * The internal representation of a long is the two given signed, 32-bit values.
   * We use 32-bit pieces because these are the size of integers on which
   * Javascript performs bit-operations.  For operations like addition and
   * multiplication, we split each number into 16-bit pieces, which can easily be
   * multiplied within Javascript's floating-point representation without overflow
   * or change in sign.
   *
   * In the algorithms below, we frequently reduce the negative case to the
   * positive case by negating the input(s) and then post-processing the result.
   * Note that we must ALWAYS check specially whether those values are MIN_VALUE
   * (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
   * a positive number, it overflows back into a negative).  Not handling this
   * case would often result in infinite recursion.
   *
   * @param {number} low  The low (signed) 32 bits of the long.
   * @param {number} high  The high (signed) 32 bits of the long.
   * @constructor
   */
  goog.math.Long = function(low, high) {
    /**
     * @type {number}
     * @private
     */
    this.low_ = low | 0;  // force into 32 signed bits.

    /**
     * @type {number}
     * @private
     */
    this.high_ = high | 0;  // force into 32 signed bits.
  };


  // NOTE: Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the
  // from* methods on which they depend.


  /**
   * A cache of the Long representations of small integer values.
   * @type {!Object}
   * @private
   */
  goog.math.Long.IntCache_ = {};


  /**
   * Returns a Long representing the given (32-bit) integer value.
   * @param {number} value The 32-bit integer in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromInt = function(value) {
    if (-128 <= value && value < 128) {
      var cachedObj = goog.math.Long.IntCache_[value];
      if (cachedObj) {
        return cachedObj;
      }
    }

    var obj = new goog.math.Long(value | 0, value < 0 ? -1 : 0);
    if (-128 <= value && value < 128) {
      goog.math.Long.IntCache_[value] = obj;
    }
    return obj;
  };


  /**
   * Returns a Long representing the given value, provided that it is a finite
   * number.  Otherwise, zero is returned.
   * @param {number} value The number in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromNumber = function(value) {
    if (isNaN(value) || !isFinite(value)) {
      return goog.math.Long.ZERO;
    } else if (value <= -goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MIN_VALUE;
    } else if (value + 1 >= goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MAX_VALUE;
    } else if (value < 0) {
      return goog.math.Long.fromNumber(-value).negate();
    } else {
      return new goog.math.Long(
          (value % goog.math.Long.TWO_PWR_32_DBL_) | 0,
          (value / goog.math.Long.TWO_PWR_32_DBL_) | 0);
    }
  };


  /**
   * Returns a Long representing the 64-bit integer that comes by concatenating
   * the given high and low bits.  Each is assumed to use 32 bits.
   * @param {number} lowBits The low 32-bits.
   * @param {number} highBits The high 32-bits.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromBits = function(lowBits, highBits) {
    return new goog.math.Long(lowBits, highBits);
  };


  /**
   * Returns a Long representation of the given string, written using the given
   * radix.
   * @param {string} str The textual representation of the Long.
   * @param {number=} opt_radix The radix in which the text is written.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromString = function(str, opt_radix) {
    if (str.length == 0) {
      throw Error('number format error: empty string');
    }

    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }

    if (str.charAt(0) == '-') {
      return goog.math.Long.fromString(str.substring(1), radix).negate();
    } else if (str.indexOf('-') >= 0) {
      throw Error('number format error: interior "-" character: ' + str);
    }

    // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 8));

    var result = goog.math.Long.ZERO;
    for (var i = 0; i < str.length; i += 8) {
      var size = Math.min(8, str.length - i);
      var value = parseInt(str.substring(i, i + size), radix);
      if (size < 8) {
        var power = goog.math.Long.fromNumber(Math.pow(radix, size));
        result = result.multiply(power).add(goog.math.Long.fromNumber(value));
      } else {
        result = result.multiply(radixToPower);
        result = result.add(goog.math.Long.fromNumber(value));
      }
    }
    return result;
  };


  // NOTE: the compiler should inline these constant values below and then remove
  // these variables, so there should be no runtime penalty for these.


  /**
   * Number used repeated below in calculations.  This must appear before the
   * first call to any from* function below.
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_16_DBL_ = 1 << 16;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_24_DBL_ = 1 << 24;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_32_DBL_ =
      goog.math.Long.TWO_PWR_16_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_31_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ / 2;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_48_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_64_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_32_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_63_DBL_ =
      goog.math.Long.TWO_PWR_64_DBL_ / 2;


  /** @type {!goog.math.Long} */
  goog.math.Long.ZERO = goog.math.Long.fromInt(0);


  /** @type {!goog.math.Long} */
  goog.math.Long.ONE = goog.math.Long.fromInt(1);


  /** @type {!goog.math.Long} */
  goog.math.Long.NEG_ONE = goog.math.Long.fromInt(-1);


  /** @type {!goog.math.Long} */
  goog.math.Long.MAX_VALUE =
      goog.math.Long.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0);


  /** @type {!goog.math.Long} */
  goog.math.Long.MIN_VALUE = goog.math.Long.fromBits(0, 0x80000000 | 0);


  /**
   * @type {!goog.math.Long}
   * @private
   */
  goog.math.Long.TWO_PWR_24_ = goog.math.Long.fromInt(1 << 24);


  /** @return {number} The value, assuming it is a 32-bit integer. */
  goog.math.Long.prototype.toInt = function() {
    return this.low_;
  };


  /** @return {number} The closest floating-point representation to this value. */
  goog.math.Long.prototype.toNumber = function() {
    return this.high_ * goog.math.Long.TWO_PWR_32_DBL_ +
           this.getLowBitsUnsigned();
  };


  /**
   * @param {number=} opt_radix The radix in which the text should be written.
   * @return {string} The textual representation of this value.
   */
  goog.math.Long.prototype.toString = function(opt_radix) {
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }

    if (this.isZero()) {
      return '0';
    }

    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        // We need to change the Long value before it can be negated, so we remove
        // the bottom-most digit in this base and then recurse to do the rest.
        var radixLong = goog.math.Long.fromNumber(radix);
        var div = this.div(radixLong);
        var rem = div.multiply(radixLong).subtract(this);
        return div.toString(radix) + rem.toInt().toString(radix);
      } else {
        return '-' + this.negate().toString(radix);
      }
    }

    // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 6));

    var rem = this;
    var result = '';
    while (true) {
      var remDiv = rem.div(radixToPower);
      var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
      var digits = intval.toString(radix);

      rem = remDiv;
      if (rem.isZero()) {
        return digits + result;
      } else {
        while (digits.length < 6) {
          digits = '0' + digits;
        }
        result = '' + digits + result;
      }
    }
  };


  /** @return {number} The high 32-bits as a signed value. */
  goog.math.Long.prototype.getHighBits = function() {
    return this.high_;
  };


  /** @return {number} The low 32-bits as a signed value. */
  goog.math.Long.prototype.getLowBits = function() {
    return this.low_;
  };


  /** @return {number} The low 32-bits as an unsigned value. */
  goog.math.Long.prototype.getLowBitsUnsigned = function() {
    return (this.low_ >= 0) ?
        this.low_ : goog.math.Long.TWO_PWR_32_DBL_ + this.low_;
  };


  /**
   * @return {number} Returns the number of bits needed to represent the absolute
   *     value of this Long.
   */
  goog.math.Long.prototype.getNumBitsAbs = function() {
    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        return 64;
      } else {
        return this.negate().getNumBitsAbs();
      }
    } else {
      var val = this.high_ != 0 ? this.high_ : this.low_;
      for (var bit = 31; bit > 0; bit--) {
        if ((val & (1 << bit)) != 0) {
          break;
        }
      }
      return this.high_ != 0 ? bit + 33 : bit + 1;
    }
  };


  /** @return {boolean} Whether this value is zero. */
  goog.math.Long.prototype.isZero = function() {
    return this.high_ == 0 && this.low_ == 0;
  };


  /** @return {boolean} Whether this value is negative. */
  goog.math.Long.prototype.isNegative = function() {
    return this.high_ < 0;
  };


  /** @return {boolean} Whether this value is odd. */
  goog.math.Long.prototype.isOdd = function() {
    return (this.low_ & 1) == 1;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long equals the other.
   */
  goog.math.Long.prototype.equals = function(other) {
    return (this.high_ == other.high_) && (this.low_ == other.low_);
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long does not equal the other.
   */
  goog.math.Long.prototype.notEquals = function(other) {
    return (this.high_ != other.high_) || (this.low_ != other.low_);
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than the other.
   */
  goog.math.Long.prototype.lessThan = function(other) {
    return this.compare(other) < 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than or equal to the other.
   */
  goog.math.Long.prototype.lessThanOrEqual = function(other) {
    return this.compare(other) <= 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than the other.
   */
  goog.math.Long.prototype.greaterThan = function(other) {
    return this.compare(other) > 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than or equal to the other.
   */
  goog.math.Long.prototype.greaterThanOrEqual = function(other) {
    return this.compare(other) >= 0;
  };


  /**
   * Compares this Long with the given one.
   * @param {goog.math.Long} other Long to compare against.
   * @return {number} 0 if they are the same, 1 if the this is greater, and -1
   *     if the given one is greater.
   */
  goog.math.Long.prototype.compare = function(other) {
    if (this.equals(other)) {
      return 0;
    }

    var thisNeg = this.isNegative();
    var otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) {
      return -1;
    }
    if (!thisNeg && otherNeg) {
      return 1;
    }

    // at this point, the signs are the same, so subtraction will not overflow
    if (this.subtract(other).isNegative()) {
      return -1;
    } else {
      return 1;
    }
  };


  /** @return {!goog.math.Long} The negation of this value. */
  goog.math.Long.prototype.negate = function() {
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.MIN_VALUE;
    } else {
      return this.not().add(goog.math.Long.ONE);
    }
  };


  /**
   * Returns the sum of this and the given Long.
   * @param {goog.math.Long} other Long to add to this one.
   * @return {!goog.math.Long} The sum of this and the given Long.
   */
  goog.math.Long.prototype.add = function(other) {
    // Divide each number into 4 chunks of 16 bits, and then sum the chunks.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };


  /**
   * Returns the difference of this and the given Long.
   * @param {goog.math.Long} other Long to subtract from this.
   * @return {!goog.math.Long} The difference of this and the given Long.
   */
  goog.math.Long.prototype.subtract = function(other) {
    return this.add(other.negate());
  };


  /**
   * Returns the product of this and the given long.
   * @param {goog.math.Long} other Long to multiply with this.
   * @return {!goog.math.Long} The product of this and the other.
   */
  goog.math.Long.prototype.multiply = function(other) {
    if (this.isZero()) {
      return goog.math.Long.ZERO;
    } else if (other.isZero()) {
      return goog.math.Long.ZERO;
    }

    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return other.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return this.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    }

    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().multiply(other.negate());
      } else {
        return this.negate().multiply(other).negate();
      }
    } else if (other.isNegative()) {
      return this.multiply(other.negate()).negate();
    }

    // If both longs are small, use float multiplication
    if (this.lessThan(goog.math.Long.TWO_PWR_24_) &&
        other.lessThan(goog.math.Long.TWO_PWR_24_)) {
      return goog.math.Long.fromNumber(this.toNumber() * other.toNumber());
    }

    // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };


  /**
   * Returns this Long divided by the given one.
   * @param {goog.math.Long} other Long by which to divide.
   * @return {!goog.math.Long} This Long divided by the given one.
   */
  goog.math.Long.prototype.div = function(other) {
    if (other.isZero()) {
      throw Error('division by zero');
    } else if (this.isZero()) {
      return goog.math.Long.ZERO;
    }

    if (this.equals(goog.math.Long.MIN_VALUE)) {
      if (other.equals(goog.math.Long.ONE) ||
          other.equals(goog.math.Long.NEG_ONE)) {
        return goog.math.Long.MIN_VALUE;  // recall that -MIN_VALUE == MIN_VALUE
      } else if (other.equals(goog.math.Long.MIN_VALUE)) {
        return goog.math.Long.ONE;
      } else {
        // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
        var halfThis = this.shiftRight(1);
        var approx = halfThis.div(other).shiftLeft(1);
        if (approx.equals(goog.math.Long.ZERO)) {
          return other.isNegative() ? goog.math.Long.ONE : goog.math.Long.NEG_ONE;
        } else {
          var rem = this.subtract(other.multiply(approx));
          var result = approx.add(rem.div(other));
          return result;
        }
      }
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.ZERO;
    }

    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().div(other.negate());
      } else {
        return this.negate().div(other).negate();
      }
    } else if (other.isNegative()) {
      return this.div(other.negate()).negate();
    }

    // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.
    var res = goog.math.Long.ZERO;
    var rem = this;
    while (rem.greaterThanOrEqual(other)) {
      // Approximate the result of division. This may be a little greater or
      // smaller than the actual value.
      var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));

      // We will tweak the approximate result by changing it in the 48-th digit or
      // the smallest non-fractional digit, whichever is larger.
      var log2 = Math.ceil(Math.log(approx) / Math.LN2);
      var delta = (log2 <= 48) ? 1 : Math.pow(2, log2 - 48);

      // Decrease the approximation until it is smaller than the remainder.  Note
      // that if it is too large, the product overflows and is negative.
      var approxRes = goog.math.Long.fromNumber(approx);
      var approxRem = approxRes.multiply(other);
      while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
        approx -= delta;
        approxRes = goog.math.Long.fromNumber(approx);
        approxRem = approxRes.multiply(other);
      }

      // We know the answer can't be zero... and actually, zero would cause
      // infinite recursion since we would make no progress.
      if (approxRes.isZero()) {
        approxRes = goog.math.Long.ONE;
      }

      res = res.add(approxRes);
      rem = rem.subtract(approxRem);
    }
    return res;
  };


  /**
   * Returns this Long modulo the given one.
   * @param {goog.math.Long} other Long by which to mod.
   * @return {!goog.math.Long} This Long modulo the given one.
   */
  goog.math.Long.prototype.modulo = function(other) {
    return this.subtract(this.div(other).multiply(other));
  };


  /** @return {!goog.math.Long} The bitwise-NOT of this value. */
  goog.math.Long.prototype.not = function() {
    return goog.math.Long.fromBits(~this.low_, ~this.high_);
  };


  /**
   * Returns the bitwise-AND of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to AND.
   * @return {!goog.math.Long} The bitwise-AND of this and the other.
   */
  goog.math.Long.prototype.and = function(other) {
    return goog.math.Long.fromBits(this.low_ & other.low_,
                                   this.high_ & other.high_);
  };


  /**
   * Returns the bitwise-OR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to OR.
   * @return {!goog.math.Long} The bitwise-OR of this and the other.
   */
  goog.math.Long.prototype.or = function(other) {
    return goog.math.Long.fromBits(this.low_ | other.low_,
                                   this.high_ | other.high_);
  };


  /**
   * Returns the bitwise-XOR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to XOR.
   * @return {!goog.math.Long} The bitwise-XOR of this and the other.
   */
  goog.math.Long.prototype.xor = function(other) {
    return goog.math.Long.fromBits(this.low_ ^ other.low_,
                                   this.high_ ^ other.high_);
  };


  /**
   * Returns this Long with bits shifted to the left by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the left by the given amount.
   */
  goog.math.Long.prototype.shiftLeft = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var low = this.low_;
      if (numBits < 32) {
        var high = this.high_;
        return goog.math.Long.fromBits(
            low << numBits,
            (high << numBits) | (low >>> (32 - numBits)));
      } else {
        return goog.math.Long.fromBits(0, low << (numBits - 32));
      }
    }
  };


  /**
   * Returns this Long with bits shifted to the right by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount.
   */
  goog.math.Long.prototype.shiftRight = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >> numBits);
      } else {
        return goog.math.Long.fromBits(
            high >> (numBits - 32),
            high >= 0 ? 0 : -1);
      }
    }
  };


  /**
   * Returns this Long with bits shifted to the right by the given amount, with
   * the new top bits matching the current sign bit.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount, with
   *     zeros placed into the new leading bits.
   */
  goog.math.Long.prototype.shiftRightUnsigned = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >>> numBits);
      } else if (numBits == 32) {
        return goog.math.Long.fromBits(high, 0);
      } else {
        return goog.math.Long.fromBits(high >>> (numBits - 32), 0);
      }
    }
  };

  //======= begin jsbn =======

  var navigator = { appName: 'Modern Browser' }; // polyfill a little

  // Copyright (c) 2005  Tom Wu
  // All Rights Reserved.
  // http://www-cs-students.stanford.edu/~tjw/jsbn/

  /*
   * Copyright (c) 2003-2005  Tom Wu
   * All Rights Reserved.
   *
   * Permission is hereby granted, free of charge, to any person obtaining
   * a copy of this software and associated documentation files (the
   * "Software"), to deal in the Software without restriction, including
   * without limitation the rights to use, copy, modify, merge, publish,
   * distribute, sublicense, and/or sell copies of the Software, and to
   * permit persons to whom the Software is furnished to do so, subject to
   * the following conditions:
   *
   * The above copyright notice and this permission notice shall be
   * included in all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND, 
   * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY 
   * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.  
   *
   * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
   * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
   * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
   * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
   * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * In addition, the following condition applies:
   *
   * All redistributions must retain an intact copy of this copyright notice
   * and disclaimer.
   */

  // Basic JavaScript BN library - subset useful for RSA encryption.

  // Bits per digit
  var dbits;

  // JavaScript engine analysis
  var canary = 0xdeadbeefcafe;
  var j_lm = ((canary&0xffffff)==0xefcafe);

  // (public) Constructor
  function BigInteger(a,b,c) {
    if(a != null)
      if("number" == typeof a) this.fromNumber(a,b,c);
      else if(b == null && "string" != typeof a) this.fromString(a,256);
      else this.fromString(a,b);
  }

  // return new, unset BigInteger
  function nbi() { return new BigInteger(null); }

  // am: Compute w_j += (x*this_i), propagate carries,
  // c is initial carry, returns final carry.
  // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
  // We need to select the fastest one that works in this environment.

  // am1: use a single mult and divide to get the high bits,
  // max digit bits should be 26 because
  // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
  function am1(i,x,w,j,c,n) {
    while(--n >= 0) {
      var v = x*this[i++]+w[j]+c;
      c = Math.floor(v/0x4000000);
      w[j++] = v&0x3ffffff;
    }
    return c;
  }
  // am2 avoids a big mult-and-extract completely.
  // Max digit bits should be <= 30 because we do bitwise ops
  // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
  function am2(i,x,w,j,c,n) {
    var xl = x&0x7fff, xh = x>>15;
    while(--n >= 0) {
      var l = this[i]&0x7fff;
      var h = this[i++]>>15;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
      c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
      w[j++] = l&0x3fffffff;
    }
    return c;
  }
  // Alternately, set max digit bits to 28 since some
  // browsers slow down when dealing with 32-bit numbers.
  function am3(i,x,w,j,c,n) {
    var xl = x&0x3fff, xh = x>>14;
    while(--n >= 0) {
      var l = this[i]&0x3fff;
      var h = this[i++]>>14;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x3fff)<<14)+w[j]+c;
      c = (l>>28)+(m>>14)+xh*h;
      w[j++] = l&0xfffffff;
    }
    return c;
  }
  if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
    BigInteger.prototype.am = am2;
    dbits = 30;
  }
  else if(j_lm && (navigator.appName != "Netscape")) {
    BigInteger.prototype.am = am1;
    dbits = 26;
  }
  else { // Mozilla/Netscape seems to prefer am3
    BigInteger.prototype.am = am3;
    dbits = 28;
  }

  BigInteger.prototype.DB = dbits;
  BigInteger.prototype.DM = ((1<<dbits)-1);
  BigInteger.prototype.DV = (1<<dbits);

  var BI_FP = 52;
  BigInteger.prototype.FV = Math.pow(2,BI_FP);
  BigInteger.prototype.F1 = BI_FP-dbits;
  BigInteger.prototype.F2 = 2*dbits-BI_FP;

  // Digit conversions
  var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
  var BI_RC = new Array();
  var rr,vv;
  rr = "0".charCodeAt(0);
  for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
  rr = "a".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  rr = "A".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

  function int2char(n) { return BI_RM.charAt(n); }
  function intAt(s,i) {
    var c = BI_RC[s.charCodeAt(i)];
    return (c==null)?-1:c;
  }

  // (protected) copy this to r
  function bnpCopyTo(r) {
    for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
    r.t = this.t;
    r.s = this.s;
  }

  // (protected) set from integer value x, -DV <= x < DV
  function bnpFromInt(x) {
    this.t = 1;
    this.s = (x<0)?-1:0;
    if(x > 0) this[0] = x;
    else if(x < -1) this[0] = x+DV;
    else this.t = 0;
  }

  // return bigint initialized to value
  function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

  // (protected) set from string and radix
  function bnpFromString(s,b) {
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 256) k = 8; // byte array
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else { this.fromRadix(s,b); return; }
    this.t = 0;
    this.s = 0;
    var i = s.length, mi = false, sh = 0;
    while(--i >= 0) {
      var x = (k==8)?s[i]&0xff:intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-") mi = true;
        continue;
      }
      mi = false;
      if(sh == 0)
        this[this.t++] = x;
      else if(sh+k > this.DB) {
        this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
        this[this.t++] = (x>>(this.DB-sh));
      }
      else
        this[this.t-1] |= x<<sh;
      sh += k;
      if(sh >= this.DB) sh -= this.DB;
    }
    if(k == 8 && (s[0]&0x80) != 0) {
      this.s = -1;
      if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
    }
    this.clamp();
    if(mi) BigInteger.ZERO.subTo(this,this);
  }

  // (protected) clamp off excess high words
  function bnpClamp() {
    var c = this.s&this.DM;
    while(this.t > 0 && this[this.t-1] == c) --this.t;
  }

  // (public) return string representation in given radix
  function bnToString(b) {
    if(this.s < 0) return "-"+this.negate().toString(b);
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else return this.toRadix(b);
    var km = (1<<k)-1, d, m = false, r = "", i = this.t;
    var p = this.DB-(i*this.DB)%k;
    if(i-- > 0) {
      if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
      while(i >= 0) {
        if(p < k) {
          d = (this[i]&((1<<p)-1))<<(k-p);
          d |= this[--i]>>(p+=this.DB-k);
        }
        else {
          d = (this[i]>>(p-=k))&km;
          if(p <= 0) { p += this.DB; --i; }
        }
        if(d > 0) m = true;
        if(m) r += int2char(d);
      }
    }
    return m?r:"0";
  }

  // (public) -this
  function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }

  // (public) |this|
  function bnAbs() { return (this.s<0)?this.negate():this; }

  // (public) return + if this > a, - if this < a, 0 if equal
  function bnCompareTo(a) {
    var r = this.s-a.s;
    if(r != 0) return r;
    var i = this.t;
    r = i-a.t;
    if(r != 0) return (this.s<0)?-r:r;
    while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
    return 0;
  }

  // returns bit length of the integer x
  function nbits(x) {
    var r = 1, t;
    if((t=x>>>16) != 0) { x = t; r += 16; }
    if((t=x>>8) != 0) { x = t; r += 8; }
    if((t=x>>4) != 0) { x = t; r += 4; }
    if((t=x>>2) != 0) { x = t; r += 2; }
    if((t=x>>1) != 0) { x = t; r += 1; }
    return r;
  }

  // (public) return the number of bits in "this"
  function bnBitLength() {
    if(this.t <= 0) return 0;
    return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
  }

  // (protected) r = this << n*DB
  function bnpDLShiftTo(n,r) {
    var i;
    for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
    for(i = n-1; i >= 0; --i) r[i] = 0;
    r.t = this.t+n;
    r.s = this.s;
  }

  // (protected) r = this >> n*DB
  function bnpDRShiftTo(n,r) {
    for(var i = n; i < this.t; ++i) r[i-n] = this[i];
    r.t = Math.max(this.t-n,0);
    r.s = this.s;
  }

  // (protected) r = this << n
  function bnpLShiftTo(n,r) {
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<cbs)-1;
    var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
    for(i = this.t-1; i >= 0; --i) {
      r[i+ds+1] = (this[i]>>cbs)|c;
      c = (this[i]&bm)<<bs;
    }
    for(i = ds-1; i >= 0; --i) r[i] = 0;
    r[ds] = c;
    r.t = this.t+ds+1;
    r.s = this.s;
    r.clamp();
  }

  // (protected) r = this >> n
  function bnpRShiftTo(n,r) {
    r.s = this.s;
    var ds = Math.floor(n/this.DB);
    if(ds >= this.t) { r.t = 0; return; }
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<bs)-1;
    r[0] = this[ds]>>bs;
    for(var i = ds+1; i < this.t; ++i) {
      r[i-ds-1] |= (this[i]&bm)<<cbs;
      r[i-ds] = this[i]>>bs;
    }
    if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
    r.t = this.t-ds;
    r.clamp();
  }

  // (protected) r = this - a
  function bnpSubTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]-a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c -= a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c -= a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c -= a.s;
    }
    r.s = (c<0)?-1:0;
    if(c < -1) r[i++] = this.DV+c;
    else if(c > 0) r[i++] = c;
    r.t = i;
    r.clamp();
  }

  // (protected) r = this * a, r != this,a (HAC 14.12)
  // "this" should be the larger one if appropriate.
  function bnpMultiplyTo(a,r) {
    var x = this.abs(), y = a.abs();
    var i = x.t;
    r.t = i+y.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
    r.s = 0;
    r.clamp();
    if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
  }

  // (protected) r = this^2, r != this (HAC 14.16)
  function bnpSquareTo(r) {
    var x = this.abs();
    var i = r.t = 2*x.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < x.t-1; ++i) {
      var c = x.am(i,x[i],r,2*i,0,1);
      if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
        r[i+x.t] -= x.DV;
        r[i+x.t+1] = 1;
      }
    }
    if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
    r.s = 0;
    r.clamp();
  }

  // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
  // r != q, this != m.  q or r may be null.
  function bnpDivRemTo(m,q,r) {
    var pm = m.abs();
    if(pm.t <= 0) return;
    var pt = this.abs();
    if(pt.t < pm.t) {
      if(q != null) q.fromInt(0);
      if(r != null) this.copyTo(r);
      return;
    }
    if(r == null) r = nbi();
    var y = nbi(), ts = this.s, ms = m.s;
    var nsh = this.DB-nbits(pm[pm.t-1]);	// normalize modulus
    if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
    else { pm.copyTo(y); pt.copyTo(r); }
    var ys = y.t;
    var y0 = y[ys-1];
    if(y0 == 0) return;
    var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
    var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
    var i = r.t, j = i-ys, t = (q==null)?nbi():q;
    y.dlShiftTo(j,t);
    if(r.compareTo(t) >= 0) {
      r[r.t++] = 1;
      r.subTo(t,r);
    }
    BigInteger.ONE.dlShiftTo(ys,t);
    t.subTo(y,y);	// "negative" y so we can replace sub with am later
    while(y.t < ys) y[y.t++] = 0;
    while(--j >= 0) {
      // Estimate quotient digit
      var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
      if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {	// Try it out
        y.dlShiftTo(j,t);
        r.subTo(t,r);
        while(r[i] < --qd) r.subTo(t,r);
      }
    }
    if(q != null) {
      r.drShiftTo(ys,q);
      if(ts != ms) BigInteger.ZERO.subTo(q,q);
    }
    r.t = ys;
    r.clamp();
    if(nsh > 0) r.rShiftTo(nsh,r);	// Denormalize remainder
    if(ts < 0) BigInteger.ZERO.subTo(r,r);
  }

  // (public) this mod a
  function bnMod(a) {
    var r = nbi();
    this.abs().divRemTo(a,null,r);
    if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
    return r;
  }

  // Modular reduction using "classic" algorithm
  function Classic(m) { this.m = m; }
  function cConvert(x) {
    if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
    else return x;
  }
  function cRevert(x) { return x; }
  function cReduce(x) { x.divRemTo(this.m,null,x); }
  function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
  function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

  Classic.prototype.convert = cConvert;
  Classic.prototype.revert = cRevert;
  Classic.prototype.reduce = cReduce;
  Classic.prototype.mulTo = cMulTo;
  Classic.prototype.sqrTo = cSqrTo;

  // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
  // justification:
  //         xy == 1 (mod m)
  //         xy =  1+km
  //   xy(2-xy) = (1+km)(1-km)
  // x[y(2-xy)] = 1-k^2m^2
  // x[y(2-xy)] == 1 (mod m^2)
  // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
  // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
  // JS multiply "overflows" differently from C/C++, so care is needed here.
  function bnpInvDigit() {
    if(this.t < 1) return 0;
    var x = this[0];
    if((x&1) == 0) return 0;
    var y = x&3;		// y == 1/x mod 2^2
    y = (y*(2-(x&0xf)*y))&0xf;	// y == 1/x mod 2^4
    y = (y*(2-(x&0xff)*y))&0xff;	// y == 1/x mod 2^8
    y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;	// y == 1/x mod 2^16
    // last step - calculate inverse mod DV directly;
    // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
    y = (y*(2-x*y%this.DV))%this.DV;		// y == 1/x mod 2^dbits
    // we really want the negative inverse, and -DV < y < DV
    return (y>0)?this.DV-y:-y;
  }

  // Montgomery reduction
  function Montgomery(m) {
    this.m = m;
    this.mp = m.invDigit();
    this.mpl = this.mp&0x7fff;
    this.mph = this.mp>>15;
    this.um = (1<<(m.DB-15))-1;
    this.mt2 = 2*m.t;
  }

  // xR mod m
  function montConvert(x) {
    var r = nbi();
    x.abs().dlShiftTo(this.m.t,r);
    r.divRemTo(this.m,null,r);
    if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
    return r;
  }

  // x/R mod m
  function montRevert(x) {
    var r = nbi();
    x.copyTo(r);
    this.reduce(r);
    return r;
  }

  // x = x/R mod m (HAC 14.32)
  function montReduce(x) {
    while(x.t <= this.mt2)	// pad x so am has enough room later
      x[x.t++] = 0;
    for(var i = 0; i < this.m.t; ++i) {
      // faster way of calculating u0 = x[i]*mp mod DV
      var j = x[i]&0x7fff;
      var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
      // use am to combine the multiply-shift-add into one call
      j = i+this.m.t;
      x[j] += this.m.am(0,u0,x,i,0,this.m.t);
      // propagate carry
      while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
    }
    x.clamp();
    x.drShiftTo(this.m.t,x);
    if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
  }

  // r = "x^2/R mod m"; x != r
  function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

  // r = "xy/R mod m"; x,y != r
  function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

  Montgomery.prototype.convert = montConvert;
  Montgomery.prototype.revert = montRevert;
  Montgomery.prototype.reduce = montReduce;
  Montgomery.prototype.mulTo = montMulTo;
  Montgomery.prototype.sqrTo = montSqrTo;

  // (protected) true iff this is even
  function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }

  // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
  function bnpExp(e,z) {
    if(e > 0xffffffff || e < 1) return BigInteger.ONE;
    var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
    g.copyTo(r);
    while(--i >= 0) {
      z.sqrTo(r,r2);
      if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
      else { var t = r; r = r2; r2 = t; }
    }
    return z.revert(r);
  }

  // (public) this^e % m, 0 <= e < 2^32
  function bnModPowInt(e,m) {
    var z;
    if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
    return this.exp(e,z);
  }

  // protected
  BigInteger.prototype.copyTo = bnpCopyTo;
  BigInteger.prototype.fromInt = bnpFromInt;
  BigInteger.prototype.fromString = bnpFromString;
  BigInteger.prototype.clamp = bnpClamp;
  BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
  BigInteger.prototype.drShiftTo = bnpDRShiftTo;
  BigInteger.prototype.lShiftTo = bnpLShiftTo;
  BigInteger.prototype.rShiftTo = bnpRShiftTo;
  BigInteger.prototype.subTo = bnpSubTo;
  BigInteger.prototype.multiplyTo = bnpMultiplyTo;
  BigInteger.prototype.squareTo = bnpSquareTo;
  BigInteger.prototype.divRemTo = bnpDivRemTo;
  BigInteger.prototype.invDigit = bnpInvDigit;
  BigInteger.prototype.isEven = bnpIsEven;
  BigInteger.prototype.exp = bnpExp;

  // public
  BigInteger.prototype.toString = bnToString;
  BigInteger.prototype.negate = bnNegate;
  BigInteger.prototype.abs = bnAbs;
  BigInteger.prototype.compareTo = bnCompareTo;
  BigInteger.prototype.bitLength = bnBitLength;
  BigInteger.prototype.mod = bnMod;
  BigInteger.prototype.modPowInt = bnModPowInt;

  // "constants"
  BigInteger.ZERO = nbv(0);
  BigInteger.ONE = nbv(1);

  // jsbn2 stuff

  // (protected) convert from radix string
  function bnpFromRadix(s,b) {
    this.fromInt(0);
    if(b == null) b = 10;
    var cs = this.chunkSize(b);
    var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
    for(var i = 0; i < s.length; ++i) {
      var x = intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
        continue;
      }
      w = b*w+x;
      if(++j >= cs) {
        this.dMultiply(d);
        this.dAddOffset(w,0);
        j = 0;
        w = 0;
      }
    }
    if(j > 0) {
      this.dMultiply(Math.pow(b,j));
      this.dAddOffset(w,0);
    }
    if(mi) BigInteger.ZERO.subTo(this,this);
  }

  // (protected) return x s.t. r^x < DV
  function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }

  // (public) 0 if this == 0, 1 if this > 0
  function bnSigNum() {
    if(this.s < 0) return -1;
    else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
    else return 1;
  }

  // (protected) this *= n, this >= 0, 1 < n < DV
  function bnpDMultiply(n) {
    this[this.t] = this.am(0,n-1,this,0,0,this.t);
    ++this.t;
    this.clamp();
  }

  // (protected) this += n << w words, this >= 0
  function bnpDAddOffset(n,w) {
    if(n == 0) return;
    while(this.t <= w) this[this.t++] = 0;
    this[w] += n;
    while(this[w] >= this.DV) {
      this[w] -= this.DV;
      if(++w >= this.t) this[this.t++] = 0;
      ++this[w];
    }
  }

  // (protected) convert to radix string
  function bnpToRadix(b) {
    if(b == null) b = 10;
    if(this.signum() == 0 || b < 2 || b > 36) return "0";
    var cs = this.chunkSize(b);
    var a = Math.pow(b,cs);
    var d = nbv(a), y = nbi(), z = nbi(), r = "";
    this.divRemTo(d,y,z);
    while(y.signum() > 0) {
      r = (a+z.intValue()).toString(b).substr(1) + r;
      y.divRemTo(d,y,z);
    }
    return z.intValue().toString(b) + r;
  }

  // (public) return value as integer
  function bnIntValue() {
    if(this.s < 0) {
      if(this.t == 1) return this[0]-this.DV;
      else if(this.t == 0) return -1;
    }
    else if(this.t == 1) return this[0];
    else if(this.t == 0) return 0;
    // assumes 16 < DB < 32
    return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
  }

  // (protected) r = this + a
  function bnpAddTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]+a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c += a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c += a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += a.s;
    }
    r.s = (c<0)?-1:0;
    if(c > 0) r[i++] = c;
    else if(c < -1) r[i++] = this.DV+c;
    r.t = i;
    r.clamp();
  }

  BigInteger.prototype.fromRadix = bnpFromRadix;
  BigInteger.prototype.chunkSize = bnpChunkSize;
  BigInteger.prototype.signum = bnSigNum;
  BigInteger.prototype.dMultiply = bnpDMultiply;
  BigInteger.prototype.dAddOffset = bnpDAddOffset;
  BigInteger.prototype.toRadix = bnpToRadix;
  BigInteger.prototype.intValue = bnIntValue;
  BigInteger.prototype.addTo = bnpAddTo;

  //======= end jsbn =======

  // Emscripten wrapper
  var Wrapper = {
    abs: function(l, h) {
      var x = new goog.math.Long(l, h);
      var ret;
      if (x.isNegative()) {
        ret = x.negate();
      } else {
        ret = x;
      }
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
    },
    ensureTemps: function() {
      if (Wrapper.ensuredTemps) return;
      Wrapper.ensuredTemps = true;
      Wrapper.two32 = new BigInteger();
      Wrapper.two32.fromString('4294967296', 10);
      Wrapper.two64 = new BigInteger();
      Wrapper.two64.fromString('18446744073709551616', 10);
      Wrapper.temp1 = new BigInteger();
      Wrapper.temp2 = new BigInteger();
    },
    lh2bignum: function(l, h) {
      var a = new BigInteger();
      a.fromString(h.toString(), 10);
      var b = new BigInteger();
      a.multiplyTo(Wrapper.two32, b);
      var c = new BigInteger();
      c.fromString(l.toString(), 10);
      var d = new BigInteger();
      c.addTo(b, d);
      return d;
    },
    stringify: function(l, h, unsigned) {
      var ret = new goog.math.Long(l, h).toString();
      if (unsigned && ret[0] == '-') {
        // unsign slowly using jsbn bignums
        Wrapper.ensureTemps();
        var bignum = new BigInteger();
        bignum.fromString(ret, 10);
        ret = new BigInteger();
        Wrapper.two64.addTo(bignum, ret);
        ret = ret.toString(10);
      }
      return ret;
    },
    fromString: function(str, base, min, max, unsigned) {
      Wrapper.ensureTemps();
      var bignum = new BigInteger();
      bignum.fromString(str, base);
      var bigmin = new BigInteger();
      bigmin.fromString(min, 10);
      var bigmax = new BigInteger();
      bigmax.fromString(max, 10);
      if (unsigned && bignum.compareTo(BigInteger.ZERO) < 0) {
        var temp = new BigInteger();
        bignum.addTo(Wrapper.two64, temp);
        bignum = temp;
      }
      var error = false;
      if (bignum.compareTo(bigmin) < 0) {
        bignum = bigmin;
        error = true;
      } else if (bignum.compareTo(bigmax) > 0) {
        bignum = bigmax;
        error = true;
      }
      var ret = goog.math.Long.fromString(bignum.toString()); // min-max checks should have clamped this to a range goog.math.Long can handle well
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
      if (error) throw 'range error';
    }
  };
  return Wrapper;
})();

//======= end closure i64 code =======



// === Auto-generated postamble setup entry stuff ===

if (memoryInitializer) {
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    var data = Module['readBinary'](memoryInitializer);
    HEAPU8.set(data, STATIC_BASE);
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      HEAPU8.set(data, STATIC_BASE);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}

function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
    Module.printErr('preload time: ' + (Date.now() - preloadStartTime) + ' ms');
  }

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);

  initialStackTop = STACKTOP;

  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    ensureInitRuntime();

    preMain();

    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;

  // exit the runtime
  exitRuntime();

  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371

  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }

  ABORT = true;
  EXITSTATUS = 1;

  throw 'abort() at ' + stackTrace();
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}


run();

// {{POST_RUN_ADDITIONS}}






// {{MODULE_ADDITIONS}}






