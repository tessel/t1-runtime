var tap = require('../tap');

tap.count(1);

function getparams (fn) {
	return fn.toString().match(/\(([^\)]+)/)[1].split(/,\s*/);
}

function ok (a, b, c) {
	console.log('yay');
}

console.log('#', ok.toString())
tap.eq(getparams(ok).join(','), 'a,b,c', 'can extract param names from fn');
