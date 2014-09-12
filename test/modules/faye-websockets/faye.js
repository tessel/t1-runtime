var WebSocket = require('faye-websocket'),
  ws = new WebSocket.Client('wss://echo.websocket.org'),
  message = "Hello world!\n"
  ;

ws.on('open', function(event) {
  ws.send(message);
});

ws.on('error', function(data){
	console.log("error", data);
})

ws.on('message', function(event) {
  console.log('message', event.data);
});

ws.on('close', function(event) {
  console.log('close');
  ws = null;
});