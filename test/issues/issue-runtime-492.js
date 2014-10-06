var tap = require('../tap')

tap.count(1)

var http = require('http');

http.createServer(function (req, res) {
  res.end();
  this.close();   // in lieu of unref
}).listen(0, function () {
  http.get({port:this.address().port}, function (res) {
    res.on('end', function () {
      tap.ok(true, 'response ended');
      // WORKAROUND: https://github.com/tessel/runtime/issues/336 perhaps? not relevant to this issue.
      process.exit();
    }).resume();
  });
})//.unref();