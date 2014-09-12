var tap = require('../tap')

tap.count(5);

tap.ok(!(null < {}))
tap.ok(!({} > null))
tap.ok(!({} < {}))
tap.ok(!({} > {}))
tap.ok(true, 'null comparisons succeed without erroring out.')
