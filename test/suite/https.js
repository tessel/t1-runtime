var test = require('tinytap'),
    https = require('https');

test('https', function (t) {
 var https = require('https')
 https.get("https://tessel-httpbin.herokuapp.com/", function (res) {
   t.equal(res.statusCode, 200, 'https status code is 200')
   t.equal(res.connection.remotePort, 443, 'remote port is 443 for https')
   res.resume();
   t.end();
 });
});