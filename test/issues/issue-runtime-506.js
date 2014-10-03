var tap = require('../tap')

tap.count(1)

function A(a) {

}

Object.defineProperty(A, 'test', {
  get: function () {
    return 'foo'
  },
});

tap.eq(A.test, 'foo', 'defineProperty works on functions')
