var http = require('http');

if (!process.binding('tm').ssl_context_create) {
  throw new Error("SSL/TLS is not supported in this version.");
}

// This reuses the http module, setting a private "_secure" flag.
// Could be done better.

for (var key in http) {
  exports[key] = http[key];
}

exports._secure = true;