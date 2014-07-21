//var test = require('ttt');
// WORKAROUND: https://github.com/tessel/runtime/issues/276
var test = require("../../node_modules/ttt/ttt.js"),
    util = require('util');

test('sanity', function (t) {
    t.ok(true, "haz plumbings!");
    t.end();
});

test('string formatting', function (t) {
    t.equal(util.format("%s, %s!", "Hello", "world"), "Hello, world!");
    t.end();
});
