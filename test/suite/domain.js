var tap = require('../tap')
var domain = require('domain');
var EventEmitter = require('events').EventEmitter;

tap.count(2);

test1();

function test1 () {
	var d = domain.create();
	d.on('error', function(er) {
	  tap.ok(true, 'thrown error caught')
	  test2();
	});
	d.run(function() {
	  throw new Error('lol')
	});
}

function test2 () {
	var d = domain.create();
	d.on('error', function(er) {
	  tap.ok(true, 'emitted error caught')
	});
	d.run(function() {
		var e = new EventEmitter();
		e.emit('error', new Error('lol'))
	});
}