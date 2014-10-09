var tap = require('../tap');

tap.count(4);

var regexSeparators = /\x2E|\u3002|\uFF0E|\uFF61/g;

tap.ok((/\x50/).test('P'))
tap.ok((/\u0050/).test('P'))

var regexSeparators = new RegExp("\\x2E|\\u3002|\\uFF0E|\\uFF61", "g");

tap.ok(new RegExp("\\x50").test('P'))
tap.ok(new RegExp("\\u0050").test('P'))
