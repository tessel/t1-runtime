var tap = require('../tap')

tap.count(7)

tap.eq(Number.isFinite('5'), false);
tap.eq(Number.isFinite(NaN), false);
tap.eq(Number.isFinite(Infinity), false);
tap.eq(Number.isFinite(-Infinity), false);
tap.eq(Number.isFinite(1.79769313486231580794E+308), false);
tap.eq(Number.isFinite(1.79769313486231580793E+308), true);
tap.eq(Number.isFinite(5), true);
