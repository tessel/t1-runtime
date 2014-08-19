var tap = require('../tap');

tap.count(2);

var a = function () {
	var fake = Array.prototype.slice(arguments);
	tap.eq(fake && fake.length, 0, '.slice with improper arguments does nothing.');

    var args = Array.prototype.slice.apply(arguments);
    tap.eq(args && args.length, 3, '.slice with arguments as call object returns proper array.');
}

a(1, 2, 3);