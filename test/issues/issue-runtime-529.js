var tap = require('../tap')
tap.count(1);

var res = JSON.stringify({
  foundation: "Mozilla",
  model: 'box',
  other: 5,
}, function (key, value) {
  return typeof(value) == "string" ? null : value;
});

tap.ok(res, '{"other":5}');
