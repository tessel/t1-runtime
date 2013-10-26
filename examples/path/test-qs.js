var querystring = require('./module');

console.log(querystring.stringify({ foo: 'bar', baz: ['qux', 'quux'], corge: '' }))
console.log(querystring.stringify({foo: 'bar', baz: 'qux'}, ';', ':'))
console.log(querystring.parse('foo=bar&baz=qux&baz=quux&corge'))