var tap = require('../tap');

tap(1)

tap.eq(['a','b',{}].join('/'), 'a/b/[object Object]', 'object in array passes Array.prototype.join');
