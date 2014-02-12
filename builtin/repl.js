var EventEmitter = require('events').EventEmitter;

exports.start = function () {
	return new EventEmitter();
};