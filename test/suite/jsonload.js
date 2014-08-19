var tap = require('../tap');

tap.count(2);

tap.eq(require('./jsonload-json').hello, 'hi', 'json imported');
tap.eq(require('./jsonload-json.json').hello, 'hi', 'json imported explicitly');