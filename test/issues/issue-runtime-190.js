var tap = require('../tap')

tap.count(1)

tap.eq(JSON.stringify({ foo: 1 }, null, 2), '{\n  "foo": 1\n}', 'Integer space argument in stringify.');
