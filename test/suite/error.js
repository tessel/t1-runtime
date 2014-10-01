var tap = require('../tap');

tap.count(34);

try {
	throw new Error('ok')
} catch (e) {
	tap.ok(e.message == 'ok');
}


tap.ok(Error)
tap.ok(Error('ok').name == 'Error')
tap.ok(new Error('ok').name == 'Error')
tap.ok(EvalError)
tap.ok(EvalError('ok').name == 'EvalError')
tap.ok(new EvalError('ok').name == 'EvalError')
tap.ok(RangeError)
tap.ok(RangeError('ok').name == 'RangeError')
tap.ok(new RangeError('ok').name == 'RangeError')
tap.ok(ReferenceError)
tap.ok(ReferenceError('ok').name == 'ReferenceError')
tap.ok(new ReferenceError('ok').name == 'ReferenceError')
tap.ok(SyntaxError)
tap.ok(SyntaxError('ok').name == 'SyntaxError')
tap.ok(new SyntaxError('ok').name == 'SyntaxError')
tap.ok(TypeError)
tap.ok(TypeError('ok').name == 'TypeError')
tap.ok(new TypeError('ok').name == 'TypeError')
tap.ok(URIError)
tap.ok(URIError('ok').name == 'URIError')
tap.ok(new URIError('ok').name == 'URIError')

// stack capturing
var err = new Error('thing');
function CAPTURER(err, ctor) {
  Error.captureStackTrace(err, ctor);
}
CAPTURER(err);
tap.ok(/CAPTURER/.test(err.stack), "expected callsite in trace");
CAPTURER(err, CAPTURER);
tap.ok(!/CAPTURER/.test(err.stack), "excludable via argument");

// non-Error stacktraces
var obj = {};
CAPTURER(obj);
tap.ok(/CAPTURER/.test(obj.stack), "expected callsite in object trace");

// stack formatting
var prepErr, prepArr;
Error.prepareStackTrace = function (err, arr) {
  prepErr = err;
  prepArr = arr;
  return "my stack";
}
var err = Error();
CAPTURER(err);
tap.eq(err.stack, "my stack", "got return value");
tap.eq(prepErr, err, "saw correct object");
tap.ok(Array.isArray(prepArr), "got array too");
tap.eq(prepArr[0].constructor.name, "CallSite", "correct object type");
tap.eq(prepArr[0].getFunction(), CAPTURER, "correct function");
tap.ok(prepArr.length > 1, "multiple callsites");

// stack limiting
Error.stackTraceLimit = 1;
var err = Error();
CAPTURER(err);
tap.ok(err.stack);
tap.eq(prepArr.length, 1, "only one callsite");
tap.eq(prepArr[0].getFunction(), CAPTURER, "correct function");