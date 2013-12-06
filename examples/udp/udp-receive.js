var dgram = require('dgram');

var port = 3333;

console.log('Listening on port', port);

var udp = dgram.createSocket()
udp.bind(port);
udp.on('data', function (data) {
  console.log('Received:', data);
})