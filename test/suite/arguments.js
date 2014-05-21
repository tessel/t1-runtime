console.log('1..2');

var a = function () {
	var fake = Array.prototype.slice(arguments);
	console.log(fake && fake.length == 0 ? 'ok' : 'not ok');

    var args = Array.prototype.slice.apply(arguments);
    console.log(args && args.length == 3 ? 'ok' : 'not ok');
}

a(1, 2, 3);