var async = require('async');

async.each([1, 2], function (a, next) {
  setTimeout(function () {
    console.log('done with', a);
    next();
  }, Math.random());
}, function () {
  console.log('done');
})