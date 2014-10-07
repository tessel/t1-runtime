var tap = require('../tap');

tap.count(16);

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
