var tap = require('../tap');

tap.count(2);

function Test(testMessage) {
    this.test = testMessage;
}

function printit(err, obj) {
    tap.ok(err == null, 'No error');
    tap.ok(obj.test == 'Success', 'String passed');
}

var test = new Test("Success");

printit.bind(null, null, test)();
