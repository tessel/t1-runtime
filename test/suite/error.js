var tap = require('../tap');

tap.count(33);

try {
	throw new Error('ok')
} catch (e) {
	tap.ok(e.message == 'ok');
}


tap.ok(Error)
// TODO: these `.type ==` checks don't pass under v8!
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

// stack capturing
var err = new Error('thing');
function CAPTURER(err, ctor) {
  Error.captureStackTrace(err, ctor);
}
CAPTURER(err);
tap.ok(/CAPTURER/.test(err.stack), "expected callsite in trace");
CAPTURER(err, CAPTURER);
tap.ok(!/CAPTURER/.test(err.stack), "excludable via argument");

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
