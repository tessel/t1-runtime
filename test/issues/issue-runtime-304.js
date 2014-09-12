// Tests throw/catch/finally blocks with return statements.

var tap = require('../tap');

tap.count(3);

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

tap.eq(test(false), 'try finally -> try');
tap.eq(test(true), 'try catch finally -> catch');

// This is an edge case for colony-compiler where try{} and catch{}
// blocks are actually evaluated closures. Before 0.6.16, try blocks can
// "return null" and actually continue with execution(!)

var ret = (function () {
  try {
    return null
  } catch (e) { }
  tap.ok(false);
  return true;
})();
if (ret == null) {
  tap.ok(true);
}
