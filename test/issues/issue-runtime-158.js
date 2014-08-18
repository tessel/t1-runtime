var tap = require('../tap')

tap.count(7)

tap.eq(Number.isFinite('5'), false);
tap.eq(Number.isFinite(NaN), false);
tap.eq(Number.isFinite(Infinity), false);
tap.eq(Number.isFinite(-Infinity), false);
tap.eq(Number.isFinite(1.7976931348623157E+10308), false);
tap.eq(Number.isFinite(1.7976931348623157E+10308 - 1), true);
tap.eq(Number.isFinite(5), true);
