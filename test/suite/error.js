var tap = require('../tap');

tap.count(22);

try {
	throw new Error('ok')
} catch (e) {
	tap.ok(e.message == 'ok');
}


tap.ok(Error)
tap.ok(Error('ok').type == 'Error')
tap.ok(new Error('ok').type == 'Error')
tap.ok(EvalError)
tap.ok(EvalError('ok').type == 'EvalError')
tap.ok(new EvalError('ok').type == 'EvalError')
tap.ok(RangeError)
tap.ok(RangeError('ok').type == 'RangeError')
tap.ok(new RangeError('ok').type == 'RangeError')
tap.ok(ReferenceError)
tap.ok(ReferenceError('ok').type == 'ReferenceError')
tap.ok(new ReferenceError('ok').type == 'ReferenceError')
tap.ok(SyntaxError)
tap.ok(SyntaxError('ok').type == 'SyntaxError')
tap.ok(new SyntaxError('ok').type == 'SyntaxError')
tap.ok(TypeError)
tap.ok(TypeError('ok').type == 'TypeError')
tap.ok(new TypeError('ok').type == 'TypeError')
tap.ok(URIError)
tap.ok(URIError('ok').type == 'URIError')
tap.ok(new URIError('ok').type == 'URIError')