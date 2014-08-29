// A JS error should be thrown on invalid Objects.

var tap = require('../tap')

tap.count(9)

function test (source, isobject) {
  console.log('');
  try {
    Object.keys(source);
    if (isobject) {
      tap.ok(true, 'no error on object')
    } else {
      tap.ok(false, 'error not generated for non-object');
    }
  } catch (e) {
    if (isobject) {
      tap.ok(false, 'error generated on object');
      tap.ok(false, 'error generated on object');
    } else {
      tap.ok(e instanceof Error);
      tap.ok(e instanceof TypeError);
      console.log('#', e.message)
    }
  }
}

test(5, false);
test('', false);
test({}, true);
test(null, false);
test(true, false);
