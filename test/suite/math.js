var tap = require('../tap');

tap.count(69);

// number encoding
tap.ok(0644 == 420, 'octal encoding');

// variables
tap.ok(Math.E == 2.718281828459045, 'Math.E')
tap.ok(Math.LN2 == 0.6931471805599453, 'Math.LN2')
tap.ok(Math.LN10 == 2.302585092994046, 'Math.LN10')
tap.ok(Math.LOG2E == 1.4426950408889634, 'Math.LOG2E')
tap.ok(Math.LOG10E == 0.4342944819032518, 'Math.LOG10E')
tap.ok(Math.PI == 3.141592653589793, 'Math.PI')
tap.ok(Math.SQRT1_2 == 0.7071067811865476, 'Math.SQRT1_2')
tap.ok(Math.SQRT2 == 1.4142135623730951, 'Math.SQRT2')

// clz32
tap.ok(Math.clz32(nil) == 32, 'Math.clz32(nil)')
tap.ok(Math.clz32(1) == 31, 'Math.clz32(1)')
tap.ok(Math.clz32(1000) == 22, 'Math.clz32(22)')
tap.ok(Math.clz32(true) == 31, 'Math.clz32(true)')
tap.ok(Math.clz32(3.5) == 30, 'Math.clz32(3.5)')
tap.ok(Math.clz32(-3.5) == 0, 'Math.clz32(-3.5)')
tap.ok([NaN, Infinity, -Infinity, 0, -0, null, undefined, "foo", {}, []].filter(function (n) {
  return Math.clz32(n) !== 32
}).length == 0, 'Math.clz32([NaN, Infinity, -Infinity, 0, -0, null, undefined, "foo", {}, []])')

// sign
tap.ok(Math.sign(3) == 1, 'Math.sign(3)')
tap.ok(Math.sign(-3) == -1, 'Math.sign(-3)')
tap.ok(Math.sign('-3') == -1, 'Math.sign("-3")')
tap.ok(Math.sign(0) == 0, 'Math.sign(0)')
tap.ok(Math.sign(-0) == -0, 'Math.sign(-0)')
tap.ok(isNaN(Math.sign(NaN)), 'Math.sign(NaN)')
tap.ok(isNaN(Math.sign("foo")), 'Math.sign("foo")')
tap.ok(isNaN(Math.sign()), 'Math.sign()')

// tanh
tap.ok(Math.tanh(0) == 0, 'Math.tanh(0)')
tap.ok(Math.tanh(Infinity) == 1, 'Math.tanh(Infinity)')
tap.ok(Math.tanh(1) == 0.7615941559557649, 'Math.tanh(1)')

// trunc
tap.ok(Math.trunc(13.37) == 13, 'Math.trunc(13.37)')
tap.ok(Math.trunc(42.84) == 42, 'Math.trunc(42.84)')
tap.ok(Math.trunc(0.123) ==  0, 'Math.trunc(0.123)')
tap.ok(Math.trunc(-0.123) == -0, 'Math.trunc(-0.123)')
tap.ok(Math.trunc("-1.123") == -1, 'Math.trunc("-1.123")')
tap.ok(isNaN(Math.trunc(NaN)), 'Math.trunc(NaN)')
tap.ok(isNaN(Math.trunc("foo")), 'Math.trunc("foo")')
tap.ok(isNaN(Math.trunc()), 'Math.trunc()')

// log2
tap.ok(Math.log2(3) == 1.5849625007211563, 'Math.log2(3)') // TODO check this value against ES6
tap.ok(Math.log2(2) == 1, 'Math.log2(2)')
tap.ok(Math.log2(1) == 0, 'Math.log2(1)')
tap.ok(Math.log2(0) == -Infinity, 'Math.log2(0)')
tap.ok(isNaN(Math.log2(-2)), 'Math.log2(-2)')
tap.ok(Math.log2(1024) == 10, 'Math.log2(1024)')

// fround
tap.ok(Math.fround(0) == 0, 'Math.fround(0)')
tap.ok(Math.fround(1) == 1, 'Math.fround(1)')
tap.ok(Math.fround(1.337) == 1.3370000123977661, 'Math.fround(1.337)')
tap.ok(Math.fround(1.5) == 1.5, 'Math.fround(1.5)')
tap.ok(isNaN(Math.fround(NaN)), 'Math.fround(NaN)')

// log1p
tap.ok(Math.log1p(1) == 0.6931471805599453, 'Math.log1p(1)')
tap.ok(Math.log1p(0) == 0, 'Math.log1p(0)')
tap.ok(Math.log1p(-1) == -Infinity, 'Math.log1p(-1)')
tap.ok(isNaN(Math.log1p(-2)), 'Math.log1p(-2)')

// hypot
tap.ok(Math.hypot(3, 4) == 5, 'Math.hypot(3, 4)')
tap.ok(Math.hypot(3, 4, 5) == 7.0710678118654755, 'Math.hypot(3, 4, 5)')
tap.ok(Math.hypot() == 0, 'Math.hypot()')
tap.ok(isNaN(Math.hypot(NaN)), 'Math.hypot(NaN)')
tap.ok(isNaN(Math.hypot(3, 4, "foo")), 'Math.hypot(3, 4, "foo")')
tap.ok(Math.hypot(3, 4, "5") == 7.0710678118654755, 'Math.hypot(3, 4, "5")')
tap.ok(Math.hypot(-3) == 3, 'Math.hypot(-3)')

// imul
tap.ok(Math.imul(2, 4) == 8, 'Math.imul(2, 4)')
tap.ok(Math.imul(-1, 8) == -8, 'Math.imul(-1, 8)')
tap.ok(Math.imul(-2, -2) == 4, 'Math.imul(-2, -2)')
tap.ok(Math.imul(0xffffffff, 5) == -5, 'Math.imul(0xffffffff, 5)')
tap.ok(Math.imul(0xfffffffe, 5) == -10, 'Math.imul(0xfffffffe, 5)')

// round
tap.ok(Math.round(20.49) == 20, 'Math.round(20.49)')
tap.ok(Math.round(20.5) == 21, 'Math.round(20.5)')
tap.ok(Math.round(-20.5) == -20, 'Math.round(-20.5)')
tap.ok(Math.round(-20.51) == -21, 'Math.round(-20.51)')
// Note the rounding error because of inaccurate floating point arithmetics
tap.ok((Math.round(1.005*100)/100) == 1, 'Math.round(1.005*100)/100');

// etc
tap.ok(Math.pow(2, 2) == 4, 'Math.pow')

// nan
console.log('#', String(0/0))
tap.ok(String(0/0) == 'NaN', 'NaN is NaN and not nan');
