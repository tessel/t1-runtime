var tap = require('../tap')

tap.count(1)

tap.eq([0, 1].join(','), '0,1', '[0,1].join() does not omit 0');
