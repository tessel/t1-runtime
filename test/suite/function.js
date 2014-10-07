var tap = require('../tap');

tap.count(2);

function a (a, b, c, d, e) { }
tap.eq(a.length, 5, 'function arity == 5')
tap.ok(new Function(), 'empty Function() constructor')
