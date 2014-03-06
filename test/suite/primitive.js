/* test rig */ var t = 1, tmax = 3
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
// console.log(t + '..' + tmax);
ok(process.versions.colony, 'running in colony')

ok(null < 400, 'null < positive');
ok(!(5 < null), 'positive < null');
ok(null > -400, 'null > negative');
ok(!(null > 0), 'null not > 0');
ok(!(null < 0), 'null not < 0');
ok(null != 0, 'null != 0');
ok(!(null < null), 'null < null')
ok(!(null > null), 'null > null')
ok(null == null, 'null == null')
// ok((null * 5) == 0, 'null * 5')

ok(undefined < 400, 'undefined < positive #TODO');
ok(undefined > -400, 'undefined > positive #TODO');

ok(('hasOwnProperty' in {}) == true, 'in works and is boolean');

var b = [1, 2, 3];
var a = {b: b};

ok(a instanceof Object);
ok(!(a instanceof Array));
ok(!(a instanceof Function))
ok(b instanceof Object)
ok(b instanceof Array);
ok(!(b instanceof Function))
ok(parseFloat instanceof Object)
ok(!(parseFloat instanceof Array))
ok(parseFloat instanceof Function)

// operators
ok(('null' << 'null') == 0)

// ternary
var initial = true;
ok((initial || initial != 'low' ? 'a' : 'a') == 'a', 'ternary works with boolean operators');

// void
ok((void 0) == undefined, 'void')

// isNaN
ok(isNaN(0/0), 'isNaN');

// Boolean
Boolean.prototype.cool = function () { return true; }
ok((true).cool(), 'Boolean prototype exposed');
ok((false).constructor == Boolean, 'Boolean constructor exposed');

// Number
Number.prototype.cool = function () { return true; }
ok((1).cool(), 'Number prototype exposed');
ok((1).constructor == Number, 'Number constructor exposed');
ok(Number(true) == 1, 'Number(true) == 1')

// String
String.prototype.cool = function () { return true; }
ok(("").cool(), 'String prototype exposed');
ok(("").constructor == String, 'String constructor exposed');
ok(String(1) == '1', 'String(1) == "1"')

// Function
Function.prototype.cool = function () { return true; }
ok((function () { }).cool(), 'Function prototype exposed');
ok((function () { }).constructor == Function, 'Function constructor exposed');

// Array
Array.prototype.cool = function () { return true; }
ok(([]).cool(), 'Array prototype exposed');
ok(([]).constructor == Array, 'Array constructor exposed');

// Regex
RegExp.prototype.cool = function () { return true; }
ok((/a/).cool(), 'RegExp prototype exposed');
ok((/b/).constructor == RegExp, 'RegExp constructor exposed');

// Object 
// (last because all things inherit from Object)
Object.prototype.cool = function () { return 'true'; }
ok(({}).cool(), 'Object prototype exposed');
ok(({}).constructor == Object, 'Object constructor exposed');
ok(JSON.stringify(Object()) == '{}', 'Object() constructor')
console.log('#', Object({a: 5}))
ok(Object({a: 5}).a == 5, 'Object(obj) constructor')