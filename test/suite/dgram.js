// NOTE: see https://github.com/tcr/tinytap/issues/4 — not all tests get applied?!
var test = require('tinytap'),
    dgram = require('dgram');

test('hello', function (t) {
  // from http://nodejs.org/dist/v0.11.13/docs/api/dgram.html#dgram_socket_send_buf_offset_length_port_address_callback
  var message = new Buffer("Some bytes");
  var client = dgram.createSocket("udp4");
  client.send(message, 0, message.length, 41234, "localhost", function(err) {
    client.close();
  });
});