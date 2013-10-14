var connect = require('connect')
  , http = require('http');

var app = connect()
  .use(connect.favicon())
  // .use(connect.logger('dev'))
  // .use(connect.static('public'))
  // .use(connect.directory('public'))
  // .use(connect.cookieParser())
  // .use(connect.session({ secret: 'my secret here' }))
  .use(function(req, res){
    res.end('Hello from Connect!\n');
  });

http.createServer(app).listen(3000);