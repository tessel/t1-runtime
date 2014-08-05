// Tests throw/catch/finally blocks with return statements.

console.log('1..3');

function test (dothrow) {
  var a = [];

  function fn () {
    try {
      a.push('try');
      if (dothrow) {
        throw up;
      } else {
        return 'try';
      }
    } catch (e) {
      a.push('catch');
      return 'catch';
    } finally {
      a.push('finally');
    }
    a.push('function');
    return 'function';
  }

  var ret = fn();
  a.push('->', ret);
  return a.join(' ');
}

console.log(test(false) == 'try finally -> try' ? 'ok' : 'not ok')
console.log(test(true) == 'try catch finally -> catch' ? 'ok' : 'not ok')

// This is an edge case for colony-compiler where try{} and catch{}
// blocks are actually evaluated closures. Before 0.6.16, try blocks can
// "return null" and actually continue with execution(!)

var ret = (function () {
  try {
    return null
  } catch (e) { }
  console.log('not ok');
  return true;
})();
if (ret == null) {
  console.log('ok');
}
