var fs = require('fs');

console.log(fs.readFileSync(__dirname + '/files_fs/hello.txt', 'utf-8'));