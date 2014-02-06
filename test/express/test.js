console.log('lord');
var express = require('express');

console.log('hey');
var app = express();

console.log('ok');

app.get('/', function(req, res){
	console.log('yay', res.render)
  res.send('Hello World');
});

app.listen(3000);
console.log('Listening on http://localhost:3000');