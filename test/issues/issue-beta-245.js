var tap = require('../tap');

tap.count(1);

var l = [,1];
tap.eq(l[1], 1, 'empty elements allowed');
