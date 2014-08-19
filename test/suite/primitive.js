var tap = require('../tap');

tap.count(43);

tap.ok(null < 400, 'null < positive');
tap.ok(!(5 < null), 'positive < null');
tap.ok(null > -400, 'null > negative');
tap.ok(!(null > 0), 'null not > 0');
tap.ok(!(null < 0), 'null not < 0');
tap.ok(null != 0, 'null != 0');
tap.ok(!(null < null), 'null < null')
tap.ok(!(null > null), 'null > null')
tap.ok(null == null, 'null == null')
// tap.ok((null * 5) == 0, 'null * 5')

tap.ok(undefined < 400, 'undefined < positive #TODO');
tap.ok(undefined > -400, 'undefined > positive #TODO');

tap.ok(('hasOwnProperty' in {}) == true, 'in works and is boolean');

var b = [1, 2, 3];
var a = {b: b};

tap.ok(a instanceof Object);
tap.ok(!(a instanceof Array));
tap.ok(!(a instanceof Function))
tap.ok(b instanceof Object)
tap.ok(b instanceof Array);
tap.ok(!(b instanceof Function))
tap.ok(parseFloat instanceof Object)
tap.ok(!(parseFloat instanceof Array))
tap.ok(parseFloat instanceof Function)

// operators
tap.ok(('null' << 'null') == 0)

// ternary
var initial = true;
tap.ok((initial || initial != 'low' ? 'a' : 'a') == 'a', 'ternary works with boolean operators');

// void
tap.ok((void 0) == undefined, 'void')

// isNaN
tap.ok(isNaN(0/0), 'isNaN');

// Boolean
Boolean.prototype.cool = function () { return true; }
tap.ok((true).cool(), 'Boolean prototype exposed');
tap.ok((false).constructor == Boolean, 'Boolean constructor exposed');

// Number
Number.prototype.cool = function () { return true; }
tap.ok((1).cool(), 'Number prototype exposed');
tap.ok((1).constructor == Number, 'Number constructor exposed');
tap.ok(Number(true) == 1, 'Number(true) == 1')

// String
String.prototype.cool = function () { return true; }
tap.ok(("").cool(), 'String prototype exposed');
tap.ok(("").constructor == String, 'String constructor exposed');
tap.ok(String(1) == '1', 'String(1) == "1"')

// Function
Function.prototype.cool = function () { return true; }
tap.ok((function () { }).cool(), 'Function prototype exposed');
tap.ok((function () { }).constructor == Function, 'Function constructor exposed');

// Array
Array.prototype.cool = function () { return true; }
tap.ok(([]).cool(), 'Array prototype exposed');
tap.ok(([]).constructor == Array, 'Array constructor exposed');

// Regex
RegExp.prototype.cool = function () { return true; }
tap.ok((/a/).cool(), 'RegExp prototype exposed');
tap.ok((/b/).constructor == RegExp, 'RegExp constructor exposed');

// Object 
// (last because all things inherit from Object)
Object.prototype.cool = function () { return 'true'; }
tap.ok(({}).cool(), 'Object prototype exposed');
tap.ok(({}).constructor == Object, 'Object constructor exposed');
tap.ok(JSON.stringify(Object()) == '{}', 'Object() constructor')
console.log('#', Object({a: 5}))
tap.ok(Object({a: 5}).a == 5, 'Object(obj) constructor')