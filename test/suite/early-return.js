var tap = require('../tap')

tap.count(1)

tap.ok(true, 'early return should block falsy next test');

// Early return allowed in Node
return 5;

tap.ok(false, 'early return did not succeed')
