var request = require('request');
var ip = '1.2.3.4.5.6.7'; // example ip address

request({
    method: 'GET',                                                                                    
    uri: 'http://' + ip + '/api/endpoint'
}, function (err, body, res) {
  console.log('are you sure it doesnt get here?');
    // execution doens't get here
});