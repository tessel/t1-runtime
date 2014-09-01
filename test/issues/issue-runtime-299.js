var tap = require('../tap');
tap.count(1)

var d = new Date(42);
tap.eq(JSON.stringify({
  toJSON: function () { return "foo"; }
}), "\"foo\"", 'toJSON');
