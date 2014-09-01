var tap = require('../tap');
tap.count(1)

tap.eq(JSON.stringify({
  toJSON: function () { return "foo"; }
}), "\"foo\"", 'toJSON');
