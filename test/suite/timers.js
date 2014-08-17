var tap = require('../tap');

tap.count(5);

setTimeout(function () {
  tap.ok(this == global, '"this" value in timer is global object');
  tap.ok(true, 'console.log of global works #TODO');
  // console.log(this)
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