// Tests that NaN / Inf keys don't trigger errors.

var tap = require('../tap')

tap.count(1)

var a = {}
a.NaN = 0/0
a.nan = 0/0
a['-NaN'] = 0/0
a['-nan'] = 0/0
a.Infinity = 0/0
a.infinity = 0/0
a['-Infinity'] = 0/0
a['-infinity'] = 0/0

tap.ok(true);
