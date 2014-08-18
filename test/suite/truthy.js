var tap = require('../tap');

tap.count(16);

tap.ok(!(0) == true, '0 is falsy');
tap.ok(!(false) == true, 'false is falsy');
tap.ok(!(undefined) == true, 'undefined is falsy')
tap.ok(!(nil) == true, 'nil is falsy')
tap.ok(!('') == true, '"" is falsy');
tap.ok(!!([]) == true, '[] is truthy');
tap.ok(!!("0") == true, '\"0\" is truthy');
tap.ok(!!({}) == true, '{} is truthy');

var a;
a = 0; tap.ok(!(a) == true, '0 is falsy');
a = false; tap.ok(!(a) == true, 'false is falsy');
a = undefined; tap.ok(!(a) == true, 'undefined is falsy')
a = nil; tap.ok(!(a) == true, 'nil is falsy')
a = ''; tap.ok(!(a) == true, '"" is falsy');
a = []; tap.ok(!!(a) == true, '[] is truthy');
a = "0"; tap.ok(!!(a) == true, '\"0\" is truthy');
a = {}; tap.ok(!!(a) == true, '{} is truthy');
