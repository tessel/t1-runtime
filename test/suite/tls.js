var tls = require('tls'),
    tap = require('../tap');

tap.count(1);

var options = {
  host : 'www.google.com',
  port : 443,
};

var socket = tls.connect(options, function connected() {
  socket.write('GET / HTTP/1.1\nAccept: */*\nHost: www.google.com\nUser-Agent: HTTPie/0.7.2\n\n');
});

socket.once('data', function(data) {
  tap.eq(data.length > 0, true, 'we got data back from google over a secure TCP socket');
})