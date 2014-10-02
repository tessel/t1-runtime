var tap = require('../tap')

tap.count(1)

tap.eq(JSON.stringify({}, null, '  '), '{}', 'If partial is empty, then let final be "{}".');
