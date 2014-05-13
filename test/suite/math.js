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

// functions
ok(Math.pow(2, 2) == 4, 'Math.pow')