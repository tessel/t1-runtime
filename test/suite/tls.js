var tls = require('tls'),
    tap = require('../tap');

tap.count(3);

var options = {
  host : 'www.google.com',
  port : 443,
};

var socket = tls.connect(options, function connected() {
  tap.eq(true, true, 'connect callback is called');
});

socket.once('secureConnect', function() {
  tap.eq(true, true, 'secureConnect event is called');
  socket.write('GET / HTTP/1.1\nAccept: */*\nHost: www.google.com\nUser-Agent: HTTPie/0.7.2\n\n');
});

socket.once('data', function(data) {
  tap.eq(data.length > 0, true, 'we got data back from google over a secure TCP socket');
  socket.destroy();
});


