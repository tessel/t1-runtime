var colony = require('./compile_lua');

colony.print = function (arg) {
}
var go = colony.cwrap('go_for_it', 'number', ['string', 'number', 'string']);

exports.compile = function (code, name) {
	var bufs = [];
	global.OKAY = function (arg) {
		bufs.push(new Buffer([arg]));
	};
	var res = go(code, code.length, name);
	if (res) {
		throw new Error('Bytecode compilation failed with error code ' + res);
	}

	return Buffer.concat(bufs);
}