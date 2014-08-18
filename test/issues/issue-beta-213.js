var tap = require('../tap');

tap.count(7);

var n = 0xF0F0F0F0E1;
tap.ok(String(n) == '1034834473185');
tap.ok(n.toString(10) == '1034834473185');
console.log("# base 10:", n.toString(10), '==', '1034834473185');
tap.ok(n.toString(16) == 'f0f0f0f0e1');
console.log("# base 16:", n.toString(16), '==', 'f0f0f0f0e1');

var n = 1034834473185;
tap.ok(String(n) == '1034834473185');
tap.ok(n.toString(10) == '1034834473185');
console.log('# base 10:', n.toString(10), '==', '1034834473185');
tap.ok(n.toString(16) == 'f0f0f0f0e1');
console.log('# base 16:', n.toString(16), '==', 'f0f0f0f0e1');

tap.ok((0xFFFFFFFF * 2) > 0xFFFFFFFF, "supports > 0xFFFFFFFF")