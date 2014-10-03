var tap = require('../tap');
tap.count(1)

var obj = {}
Error.captureStackTrace(obj)
tap.eq(typeof obj.stack, 'string', "non-Error object gets captured stack");
