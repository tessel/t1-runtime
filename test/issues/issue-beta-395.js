var a = [ 'oauth_signature', 'oauth_token', 'oauth_version', 'oauth_nonce', 'oauth_timestamp', 'oauth_signature_method', 'oauth_consumer_key' ]
var b = a.slice()

console.log(a);

a.sort()

console.log(a);

console.log(b.sort());