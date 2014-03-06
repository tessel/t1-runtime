/* test rig */ var t = 1, tmax = 3
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);
ok(process.versions.colony, 'running in colony')

try {
	throw new Error('ok')
} catch (e) {
	ok(e.message == 'ok');
}


ok(Error)
ok(Error('ok').type == 'Error')
ok(new Error('ok').type == 'Error')
ok(EvalError)
ok(EvalError('ok').type == 'EvalError')
ok(new EvalError('ok').type == 'EvalError')
ok(RangeError)
ok(RangeError('ok').type == 'RangeError')
ok(new RangeError('ok').type == 'RangeError')
ok(ReferenceError)
ok(ReferenceError('ok').type == 'ReferenceError')
ok(new ReferenceError('ok').type == 'ReferenceError')
ok(SyntaxError)
ok(SyntaxError('ok').type == 'SyntaxError')
ok(new SyntaxError('ok').type == 'SyntaxError')
ok(TypeError)
ok(TypeError('ok').type == 'TypeError')
ok(new TypeError('ok').type == 'TypeError')
ok(URIError)
ok(URIError('ok').type == 'URIError')
ok(new URIError('ok').type == 'URIError')