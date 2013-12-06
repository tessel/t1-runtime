var dgram = require('dgram');

// Use the IP of the computer we deployed from.
var ip = process.env.DEPLOY_IP || '127.0.0.1';
var port = 3333;

console.log('Connecting to IP', ip, 'port', port);

var udp = dgram.createSocket();
var i = 0;
setInterval(function () {
  console.log('Sending UDP packet #' + i + '...');
  udp.send(ip, port, "Packet #" + i++);
}, 250)