var tap = require('../tap')

tap.count(2)

tap.eq(JSON.stringify('a,b,c,d'.split(/,/)), JSON.stringify(['a', 'b', 'c', 'd']), 'split(/,/)');
tap.eq(JSON.stringify('a\r\nb\r\nc\r\nd'.split(/[\r\n]+/)), JSON.stringify(['a', 'b', 'c', 'd']), 'split(/[\\r\\n]+/)');
