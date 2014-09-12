var test = require('tinytap'),
    https = require('https');

test('https', function (t) {
 var https = require('https')
 console.log('imported');
 https.get("https://google.com", function (res) {
   t.equal(res.headers.location, "https://www.google.com/");
   res.resume();
   t.end();
 });
});