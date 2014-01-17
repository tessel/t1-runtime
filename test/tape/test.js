var test = require('tape');

test('timing test', function (t) {
    t.plan(1);

    setTimeout(function () {
        t.equal(100, 100);
    }, 100);
});