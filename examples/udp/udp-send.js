var dgram = require('dgram');

// Use the IP of the computer we deployed from.
var ip = process.env.DEPLOY_IP || '192.168.152.144' || '127.0.0.1';
var port = process.argv[3] || 3333;

console.log('Args: [ip] [port]')
console.log('Connecting to IP', ip, 'port', port);

var udp = dgram.createSocket('udp4');
var i = 0;
setInterval(function () {
  console.log('Sending UDP packet #' + i + '...');
  var buf = new Buffer("Packet #" + i++);
  udp.send(buf, 0, buf.length, port, ip);
}, 250)