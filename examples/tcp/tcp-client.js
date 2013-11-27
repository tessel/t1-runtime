var net = require('net');
var client = net.connect(80, '74.125.235.20', function() { //'connect' listener
  console.log('client connected');
  client.write('GET / HTTP/1.1\r\n\r\n');
});
client.on('data', function(data) {
  console.log(String(data));
  // client.end();
});
// client.on('end', function() {
//   console.log('client disconnected');
// });