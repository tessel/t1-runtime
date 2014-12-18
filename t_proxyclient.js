var net = require("./src/colony/modules/net-tmp.js");

net.on('ready', function () {
  net.createConnection(80, 'ipcalf.com', function () {
    this.write(["GET / HTTP/1.1", "Host: ipcalf.com", "Connection: close", '',''].join('\r\n'));
    this.on('data', function (d) { console.log(d.toString()); });
    this.on('end', function () { console.log("[[end]]"); });
  });
});
