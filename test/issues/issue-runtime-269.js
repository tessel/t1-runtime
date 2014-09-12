var tap = require('../tap')

tap.count(1)

var o = { foo: 1 };
var descriptor = Object.getOwnPropertyDescriptor(o, 'foo');
var fields = [ 'writable', 'enumerable', 'configurable' ];
var result = true;

for (var i = 0; i < fields.length; i++) {
  if (!(result = fields[i] in descriptor)) {
    break;
  }
}
tap.ok(result);
