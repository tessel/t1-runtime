var test = require('tape');

test('timing test', function (t) {
    t.plan(1);

    setTimeout(function () {
		console.log('TEST RAN');
        t.equal(100, 100);
    }, 100);
});