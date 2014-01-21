#!/Users/tim/Code/technical/git/runtime/build/osx/colony

var test = require('tape');

test('timing test', function (t) {
    t.plan(1);

    t.ok("garbage 09 _ - !@#$%".match(/^[\s\S]+$/), "Invalid regex match.");
});