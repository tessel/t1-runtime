// INSPECT_MAX_BYTES exposes the wrong number of bytes
// on Node master (2014/10/07). Check for the correct number.

var tap = require('../tap')

tap.count(1);

require('buffer').INSPECT_MAX_BYTES = 2;
tap.ok(Buffer([1,2,3]).inspect() === '<Buffer 01 02 ...>', 'inspect follows custom limit')
