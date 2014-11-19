var tap = require('../tap');

tap.count(4);

tap.ok(isNaN('hello'), 'string is NaN');
tap.ok(isNaN(undefined), 'undefined is NaN');
tap.ok(isNaN(NaN), 'NaN is NaN (but != NaN... you get the picture)');
tap.ok(!isNaN(0), '0 is aN');
