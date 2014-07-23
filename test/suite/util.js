//var test = require('ttt');
// WORKAROUND: https://github.com/tessel/runtime/issues/276
var test = require("../../node_modules/ttt/ttt.js"),
    fmt = require('util').format;

test('string formatting', function (t) {
  // basic checks
  t.ok(fmt, "format function available")
  t.equal(fmt("%s, %s!", "Hello", "world"), "Hello, world!");
  
  // examples from http://nodejs.org/api/util.html#util_util_format_format
  t.equal(fmt('%s:%s', 'foo'), 'foo:%s');
  t.equal(fmt('%s:%s', 'foo', 'bar', 'baz'), 'foo:bar baz');
  t.equal(fmt('%s:%s', 'foo', 'bar', 'baz'), 'foo:bar baz');
  t.equal(fmt(1, 2, 3), '1 2 3');
  
  // more mismatched format string cases
  t.equal(fmt("%s %x %s", "foo", "bar", "baz"), "foo %x bar baz");
  t.equal(fmt("%%%"), "%%");
  
  // stringification and inspect behaviour
  t.equal(fmt("%s", "a"), "a");
  t.equal(fmt("%s", true), "true");     // NOTE: fails due to https://github.com/tessel/runtime/issues/292
  t.equal(fmt("%s", null), "null");     // NOTE: fails due to https://github.com/tessel/runtime/issues/294
  t.equal(fmt("%s", void 0), "undefined");
  t.equal(fmt("%s", /abcdef/g), "/abcdef/g");   // FAILS: see https://github.com/tessel/runtime/issues/295
  var o = {inspect:function () { return 42; }};
  t.equal(fmt("%s", o), "[object Object]");
  t.equal(fmt("", o), " 42");
  
  // number tests
  t.equal(fmt("%d", new Date(0x42)), "66");     // FAILS: see https://github.com/tessel/runtime/issues/296
  t.equal(fmt("%d", "0xFF"), "255");
  t.equal(fmt("%d", "010"), "10");
  t.equal(fmt("%d", false), "0");
  t.equal(fmt("%d", "x"), "NaN");               // FAILS: see https://github.com/tessel/runtime/issues/298
  
  // sanity check json
  t.equal(fmt("%j%j %j%j%j", true, false, null, '', void 0), "truefalse null\"\"undefined");
  t.equal(fmt("%j", {foo:42,bar:void 0}), "{\"foo\":42}");
  t.equal(fmt("%j", new Date(0x42)), "\"1970-01-01T00:00:00.066Z\""); // FAILS: https://github.com/tessel/runtime/issues/299
  
  t.end();
});
