var tap = require('../tap');

tap.count(5);

var b;

b = new Buffer(4);
b.fill('a');
tap.eq('aaaa', b.toString(), 'buffer contains "aaaa"');

b = new Buffer(4);
b.fill('ab');
tap.eq('abab', b.toString(), 'buffer contains "abab"');

b = new Buffer(4);
b.fill('abc');
tap.eq('abca', b.toString(), 'buffer contains "abca"');

b = new Buffer(10);
b.fill('abc');
tap.eq('abcabcabca', b.toString(), 'buffer contains "abcabcabca"');

b = new Buffer([0x10, 0x20, 0x30, 0x40]);
b.fill('');
tap.eq('\0\0\0\0', b.toString(), 'buffer contains "\\0\\0\\0\\0"');
