//var test = require('ttt');
// WORKAROUND: https://github.com/tessel/runtime/issues/276
var test = require("../../node_modules/ttt/ttt.js"),
    net = require('net');

test('connection', function (t) {
  // basic checks
  var net = require('net');
  t.ok(net.createConnection, "method available");
  t.ok(net.connect, "method available");
  
  // connects
  var client = net.connect(80, "ipcalf.com", function () {
    t.pass("callback called");
  });
  t.ok(client instanceof net.Socket, "returned socket");
  client.on('connect', function () {
    t.pass("socket connected");
    client.write("GET / HTTP/1.1\nHost: ipcalf.com\nAccept: text/plain\n\n");
  });
  client.on('error', function () {
    t.fail("socket error");
  });
  
  // lives/dies
  client.on('data', function (d) {
    t.equal(d.slice(0,8).toString(), "HTTP/1.1", "got response");
    client.end();
  });
  client.on('end', function () {
    t.ok(true, "socket closed");
  });
});
