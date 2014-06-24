var express = require('express');
console.log('instantiating');
var app = express();

console.log('setting route');
app.get('/', function(req, res){
    res.send('Hello World');
});

console.log('listening on http://' + require('my-local-ip')() + ':' + 3000);
var server = app.listen(3000);
