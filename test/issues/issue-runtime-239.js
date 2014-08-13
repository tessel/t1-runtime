var tap = require('../tap');

tap.count(4);

try {
    // Invalid use: not an array
    Buffer.concat(new Buffer([1, 2, 3]), 'hey', new Buffer([4, 5, 6]))
} catch (e) {
    tap.ok(e instanceof TypeError);
    tap.ok(e.message && e.message.indexOf('Usage') > -1);
}

try {
    // Invalid use: no method .copy
    Buffer.concat([new Buffer([1, 2, 3]), 'hey', new Buffer([4, 5, 6])])
} catch (e) {
    tap.ok(String(e).indexOf('copy') > -1);
}

try {
    Buffer.concat([new Buffer([1, 2, 3]), new Buffer('hey'), new Buffer([4, 5, 6])])
    tap.ok(true, 'correct Buffer.concat usage')
} catch (e) {
    tap.ok(false, 'correct Buffer.concat usage')
}