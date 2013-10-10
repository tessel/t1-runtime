exports.parse = function (str) {
  return {
    protocol: null,
    slashes: null,
    auth: null,
    host: null,
    port: null,
    hostname: null,
    hash: null,
    search: null,
    query: null,
    pathname: '/',
    path: '/',
    href: '/'
  }
};