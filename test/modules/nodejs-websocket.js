var test = require('tinytap'),
    ws = require("nodejs-websocket");

var port = 8000;

test('basics', function (t) {
  ws.createServer(function (conn) {
    conn.on("text", function (s) {
      conn.sendText(s.toUpperCase()+"!!!")
    });
  }).listen(port, function () {
    var self = this.socket;   // ???
    ws.connect('ws://localhost:' + self.address().port, function() {
      this.sendText("Testing 123")
    }).on('text', function (s) {
      t.equal(s, "TESTING 123!!!");
      t.end();
    });  
  });
});