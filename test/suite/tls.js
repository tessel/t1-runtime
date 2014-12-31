var //tls = require('tls'),
    tls = require("../../src/colony/modules/tls.js"),
    tap = require('../tap');

tap.count(3);

var options = {
  host : 'www.google.com',
  port : 443,
  //rejectUnauthorized: false
};

var socket = tls.connect(options, function connected() {
  tap.ok(true, 'connect callback is called');
});

socket.once('secureConnect', function() {
  tap.ok(true, 'secureConnect event is called');
  socket.write('GET / HTTP/1.1\nAccept: */*\nHost: www.google.com\nUser-Agent: HTTPie/0.7.2\n\n');
});

socket.once('data', function(data) {
  tap.ok(data.length > 0, 'we got data back from google over a secure TCP socket');
  socket.destroy();
});
