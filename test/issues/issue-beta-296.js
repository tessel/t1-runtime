var tap = require('../tap');

tap.count(3);


var b = { $super: {} };
var c = b.$super.init;
tap.ok(true);

a: {
	if (true) {
		break a;
	}
}

tap.ok(true);


function inheritAsync () {
    for (var i in this) {
        i = function (next) {
            try {
            } catch (e) {
            }
        };
    }
};

tap.ok(true);
