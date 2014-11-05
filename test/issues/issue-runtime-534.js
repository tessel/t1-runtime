var tap = require('../tap');

tap.count(4);

var split1 = ''.split('.');
tap.eq(typeof split1[0], 'string', 'split empty string (with string) returns [""]');

var split2 = ''.split(/ *; */);
tap.eq(typeof split2[0], 'string', 'split empty string (with regex) returns [""]');

var split3 = 'apple'.split('.');
tap.eq(split3[0], 'apple', 'split "apple" (with string) returns ["apple"]');

var split4 = 'apple'.split(/ *; */);
tap.eq(split4[0], 'apple', 'split "apple" (with regex) returns ["apple"]');
