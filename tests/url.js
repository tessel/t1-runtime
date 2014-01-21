var url = require('url');

var a = /^[a-z]/i;
var a = /^[a-z]$/i;
var a = /^[a-z][a-z0-9]*$/i;
var a = /^[a-z][a-z0-9\-+]*$/i;
var a = /^[a-z][a-z0-9\-+]*$/i;

console.log("1234567890".substring(3, 6), "456")
console.log("ababababab".indexOf('a'), 0)
console.log("ababababab".lastIndexOf('a'), 8)
console.log(url.parse('http://tools.ietf.org/html/draft-ietf-6man-text-addr-representation-04#section-6'));