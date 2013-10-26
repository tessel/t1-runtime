var url = require('./module');

console.log(url.resolve('/one/two/three', 'four'));
console.log(url.format({protocol: 'http:', host: 'google.com', pathname: '/search'}))