/* test rig */ var t = 1, tmax = 2
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);
ok(process.versions.colony, 'running in colony')

// variables
ok(Math.E == 2.718281828459045, 'Math.E')
ok(Math.LN2 == 0.6931471805599453, 'Math.LN2')
ok(Math.LN10 == 2.302585092994046, 'Math.LN10')
ok(Math.LOG2E == 1.4426950408889634, 'Math.LOG2E')
ok(Math.LOG10E == 0.4342944819032518, 'Math.LOG10E')
ok(Math.PI == 3.141592653589793, 'Math.PI')
ok(Math.SQRT1_2 == 0.7071067811865476, 'Math.SQRT1_2')
ok(Math.SQRT2 == 1.4142135623730951, 'Math.SQRT2')

// clz32
ok(Math.clz32(nil) == 32, 'Math.clz32(nil)')
ok(Math.clz32(1) == 31, 'Math.clz32(1)')
ok(Math.clz32(1000) == 22, 'Math.clz32(22)')
ok(Math.clz32(true) == 31, 'Math.clz32(true)')
ok(Math.clz32(3.5) == 30, 'Math.clz32(3.5)')
ok(Math.clz32(-3.5) == 0, 'Math.clz32(-3.5)')
ok([NaN, Infinity, -Infinity, 0, -0, null, undefined, "foo", {}, []].filter(function (n) {
  return Math.clz32(n) !== 32
}).length == 0, 'Math.clz32([NaN, Infinity, -Infinity, 0, -0, null, undefined, "foo", {}, []])')

// sign
ok(Math.sign(3) == 1, 'Math.sign(3)')
ok(Math.sign(-3) == -1, 'Math.sign(-3)')
ok(Math.sign('-3') == -1, 'Math.sign("-3")')
ok(Math.sign(0) == 0, 'Math.sign(0)')
ok(Math.sign(-0) == -0, 'Math.sign(-0)')
ok(isNaN(Math.sign(NaN)), 'Math.sign(NaN)')
ok(isNaN(Math.sign("foo")), 'Math.sign("foo")')
ok(isNaN(Math.sign()), 'Math.sign()')

// tanh
ok(Math.tanh(0) == 0, 'Math.tanh(0)')
ok(Math.tanh(Infinity) == 1, 'Math.tanh(Infinity)')
ok(Math.tanh(1) == 0.7615941559557649, 'Math.tanh(1)')

// trunc
ok(Math.trunc(13.37) == 13, 'Math.trunc(13.37)')
ok(Math.trunc(42.84) == 42, 'Math.trunc(42.84)')
ok(Math.trunc(0.123) ==  0, 'Math.trunc(0.123)')
ok(Math.trunc(-0.123) == -0, 'Math.trunc(-0.123)')
ok(Math.trunc("-1.123") == -1, 'Math.trunc("-1.123")')
ok(isNaN(Math.trunc(NaN)), 'Math.trunc(NaN)')
ok(isNaN(Math.trunc("foo")), 'Math.trunc("foo")')
ok(isNaN(Math.trunc()), 'Math.trunc()')

// log2
ok(Math.log2(3) == 1.5849625007211563, 'Math.log2(3)') // TODO check this value against ES6
ok(Math.log2(2) == 1, 'Math.log2(2)')
ok(Math.log2(1) == 0, 'Math.log2(1)')
ok(Math.log2(0) == -Infinity, 'Math.log2(0)')
ok(isNaN(Math.log2(-2)), 'Math.log2(-2)')
ok(Math.log2(1024) == 10, 'Math.log2(1024)')

// fround
ok(Math.fround(0) == 0, 'Math.fround(0)')
ok(Math.fround(1) == 1, 'Math.fround(1)')
ok(Math.fround(1.337) == 1.3370000123977661, 'Math.fround(1.337)')
ok(Math.fround(1.5) == 1.5, 'Math.fround(1.5)')
ok(isNaN(Math.fround(NaN)), 'Math.fround(NaN)')

// log1p
ok(Math.log1p(1) == 0.6931471805599453, 'Math.log1p(1)')
ok(Math.log1p(0) == 0, 'Math.log1p(0)')
ok(Math.log1p(-1) == -Infinity, 'Math.log1p(-1)')
ok(isNaN(Math.log1p(-2)), 'Math.log1p(-2)')

// hypot
ok(Math.hypot(3, 4) == 5, 'Math.hypot(3, 4)')
ok(Math.hypot(3, 4, 5) == 7.0710678118654755, 'Math.hypot(3, 4, 5)')
ok(Math.hypot() == 0, 'Math.hypot()')
ok(isNaN(Math.hypot(NaN)), 'Math.hypot(NaN)')
ok(isNaN(Math.hypot(3, 4, "foo")), 'Math.hypot(3, 4, "foo")')
ok(Math.hypot(3, 4, "5") == 7.0710678118654755, 'Math.hypot(3, 4, "5")')
ok(Math.hypot(-3) == 3, 'Math.hypot(-3)')

// imul
ok(Math.imul(2, 4) == 8, 'Math.imul(2, 4)')
ok(Math.imul(-1, 8) == -8, 'Math.imul(-1, 8)')
ok(Math.imul(-2, -2) == 4, 'Math.imul(-2, -2)')
ok(Math.imul(0xffffffff, 5) == -5, 'Math.imul(0xffffffff, 5)')
ok(Math.imul(0xfffffffe, 5) == -10, 'Math.imul(0xfffffffe, 5)')

// round
ok(Math.round(20.49) == 20, 'Math.round(20.49)')
ok(Math.round(20.5) == 21, 'Math.round(20.5)')
ok(Math.round(-20.5) == -20, 'Math.round(-20.5)')
ok(Math.round(-20.51) == -21, 'Math.round(-20.51)')
// Note the rounding error because of inaccurate floating point arithmetics
ok((Math.round(1.005*100)/100) == 1, 'Math.round(1.005*100)/100');

// etc
ok(Math.pow(2, 2) == 4, 'Math.pow')