var tap = require('../tap');

tap.count(3);

var source = setTimeout(function () {
  // TODO this test differs between Node and browser.
  // tap.ok(this == source, '"this" value in timer is timer return value');
}, 10);

var id = setInterval(function () {
  tap.ok(false, 'error, interval was not cancelled');
  process.exit(1);
}, 100)
clearInterval(id);

console.log('# timeout id:', id)

var count = 0;
var jk = setInterval(function () {
	count++;
	clearInterval(jk);
	if (count > 1) {
		tap.ok(false, 'error, interval was not cancelled from inside interval')
		process.exit(1)
	}
}, 0)

setImmediate(function (arg1, arg2, arg3) {
	tap.ok(arg1 != null, 'args passed into callback');
	tap.ok(arg2 == null, 'null args allowed in callback');
	tap.ok(arg3 != null, 'null args allowed in callback');
}, 5, null, 6)