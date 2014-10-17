// NOTE: see https://github.com/tcr/tinytap/issues/4 — not all tests get applied?!
var test = require('tinytap'),
    dgram = require('dgram');

test('basics', function (t) {
  // based on http://nodejs.org/dist/v0.11.13/docs/api/dgram.html#dgram_socket_bind_port_address_callback
  var server = dgram.createSocket('udp4');
  server.on('error', function (err) {
    console.log("# server error!");
    server.close();
  });
  server.on('message', function (msg, rinfo) {
    console.log("# server got: " + msg + " from " + rinfo.address + ":" + rinfo.port);
      t.equal(msg.toString(), message.toString());
      t.ok('address' in rinfo);
      t.ok('port' in rinfo);
      t.end();
  });
  server.on('listening', function () {
    t.pass("event fired");
    sendMessageFromClient(server.address().port);
  });
  server.bind(41234, function () {
    t.pass("callback run");
  });
  
  // based on http://nodejs.org/dist/v0.11.13/docs/api/dgram.html#dgram_socket_send_buf_offset_length_port_address_callback
  var message = new Buffer("Some bytes");
  var client = dgram.createSocket('udp4');
  function sendMessageFromClient(port) {
    client.send(message, 0, message.length, port, "localhost", function(err) {
      client.close();
    });
  }
});