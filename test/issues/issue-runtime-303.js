// A JS error should be thrown on invalid Objects.

console.log('1..9');

function test (source, isobject) {
  console.log('');
  try {
    Object.keys(source);
    if (isobject) {
      console.log('ok - no error on object')
    } else {
      console.log('not ok - error not generated for non-object');
    }
  } catch (e) {
    if (isobject) {
      console.log('not ok - error generated on object');
      console.log('not ok - error generated on object');
    } else {
      console.log(e instanceof Error ? 'ok' : 'not ok');
      console.log(e instanceof TypeError ? 'ok' : 'not ok');
      console.log('#', e.message)
    }
  }
}

test(5, false);
test('', false);
test({}, true);
test(null, false);
test(true, false);
