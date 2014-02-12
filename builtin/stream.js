var events = require('events');
var util = require('util');

function Stream () {
}

util.inherits(Stream, events.EventEmitter);

Stream.prototype.write = function (data) {
	this.emit('data', data);
}
Stream.prototype.pipe = function (target) {
  this.on('data', function (data) {
    target.write(data);
  })
  return target;
}
Stream.prototype.resume = function () {
}
Stream.prototype.setEncoding = function () {
}

module.exports = Stream;
Stream.Stream = Stream;
