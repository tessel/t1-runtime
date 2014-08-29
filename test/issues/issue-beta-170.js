var tap = require('../tap');

tap.count(1);

tap.ok(a, 'function is hoisted');
function a () { }