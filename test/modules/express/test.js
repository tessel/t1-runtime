var express = require('express');

var app = express();

app.get('/', function(req, res){
  res.send('Hello World');
});
app.get('foo', function(req, res){
  res.send('Hello World');
});

app.get('*', function(req, res) {
  res.send('got sometin!');
})
app.listen(3000);
console.log('Listening on http://localhost:3000');