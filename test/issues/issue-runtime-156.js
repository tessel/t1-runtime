var querystring = require('querystring');
var util = require('util');

console.log('1..4');
console.log('#', isFinite(5))
console.log(isFinite(5) == true ? 'ok' : 'not ok');
console.log('#', querystring.stringify({room_id: 5}))
console.log(querystring.stringify({room_id: 5}) == 'room_id=5' ? 'ok' : 'not ok')
console.log(isFinite("0") == true ? 'ok' : 'not ok');
console.log(isFinite("hi") == false ? 'ok' : 'not ok');
