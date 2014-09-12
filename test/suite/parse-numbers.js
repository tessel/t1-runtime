var tap = require('../tap');

tap.count(13);

var s = '10';
tap.ok(parseInt(s,10) == 10);
tap.ok(parseFloat(s,10) == 10);
console.log("# base 10:", parseInt(s,10));
tap.ok(parseInt(s,16) == 16);
tap.ok(parseFloat(s,16) == 10);
console.log("# base 16:", parseInt(s,16));
tap.ok(parseInt(s,2) == 2);
tap.ok(parseFloat(s,2) == 10);
console.log("# base  2:", parseInt(s,2));

tap.ok(parseInt('0399') == 399, 'octal int');
tap.ok(parseFloat('0399') == 399, 'octal float');

// stress test invalid radixes
tap.ok(parseInt(s,0) == 10, 'radix 0');
tap.ok(isNaN(parseInt(s,37)));
tap.ok(isNaN(parseInt(s,1)));
tap.ok(isNaN(parseInt(s,"1")));
tap.ok(!isNaN(parseFloat(s,0)));