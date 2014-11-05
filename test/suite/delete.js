var tap = require('../tap');

tap.count(2);

a = {b: 5, c: 6}

delete a.b;
tap.eq(delete a.c, true, 'delete on existing prop returns true');
tap.eq(a.b, null, 'deleted prop does not exist');
