console.log('1..3')
var b = { $super: {} };
var c = b.$super.init;
console.log('ok');

a: {
	if (true) {
		break a;
	}
}

console.log('ok');


function inheritAsync () {
    for (var i in this) {
        i = function (next) {
            try {
            } catch (e) {
            }
        };
    }
};

console.log('ok')