var http = require('http');

// This reuses the http module, setting a private "_secure" flag.
// Could be done better.

for (var key in http) {
  exports[key] = http[key];
}

exports._secure = true;