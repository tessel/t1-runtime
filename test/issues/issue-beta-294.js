var tap = require('../tap');

tap.count(1);

var b = [], c = 0, d = 0;
a = b[++c] = d;
tap.ok(true);
