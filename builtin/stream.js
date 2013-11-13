var events = require('events');
var util = require('util');

function Stream () {
}

util.inherits(Stream, events.EventEmitter);

Stream.prototype.write = function () { /* ... */ }
Stream.prototype.pipe = function (target) {
  this.on('data', function (data) {
    target.write(data);
  })
}

exports.Stream = Stream;
