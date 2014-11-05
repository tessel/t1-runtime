var tap = require('../tap');

tap.count(1);

function reduceBuffer(buf, start, end, fn, res) {
    // NOTE: does not handle missing `res` like Array.prototype.reduce would
    for (var i = start, len = end; i < len; ++i) {
        res = fn(res, buf[i]);
    }
    return res;
}

tap.ok(true);
