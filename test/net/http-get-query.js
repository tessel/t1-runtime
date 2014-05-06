console.log('1..1');
var http = require('http');

http.get("http://api.openweathermap.org/data/2.5/weather?id=5327684&units=imperial", function(res) {
  console.log('#', res.statusCode)
  if (res.statusCode == 200) {
    console.log('ok');
  } else {
    console.log('not ok');
  }
}).on('error', function(e) {
  console.log('not ok -', e);
});