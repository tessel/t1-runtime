var path = require('path');

console.log(path.normalize('/foo/bar//baz/asdf/quux/..'));
console.log(path.dirname(__filename));
console.log(path.basename(__filename));
console.log(path.basename(__filename, '.js'));
console.log(path.join('/foo', 'bar', 'baz/asdf', 'quux', '..'));
console.log(path.resolve('foo/bar', '/tmp/file/', '..', 'a/../subfile'))
console.log(path.relative('/data/orandea/test/aaa', '/data/orandea/impl/bbb'))
console.log(path.extname('index.html'))
console.log(path.sep)
console.log(path.delimiter)