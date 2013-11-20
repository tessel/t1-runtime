var http = require('http');

var options = {
  hostname: 'google.com',
  port: 80,
  path: '/',
  method: 'GET'
};

var req = http.request(options, function(res) {
  console.log('STATUS: ' + res.statusCode);
  // console.log('HEADERS: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    console.log('BODY: ' + chunk.length);
  });
});

req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});

// write data to request body
// req.write('data\n');
// req.write('data\n');
req.end();

// var net = require('net');
// var client = net.connect(80, '74.125.235.20', function() { //'connect' listener
//   console.log('client connected');
//   client.write('GET / HTTP/1.1\r\n\r\n');
// });
// client.on('data', function(data) {
//   console.log(String(data));
//   // client.end();
// });
// // client.on('end', function() {
// //   console.log('client disconnected');
// // });