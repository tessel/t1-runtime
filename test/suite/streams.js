var tap = require('../tap')

tap.count(1);

var Readable = require('stream').Readable;
var Writable = require('stream').Writable;
var Transform = require('stream').Transform;

var input = ["1", "2", "3"]

var A = new Readable();
A._read = function () {
	this.push(input.shift());
}

var B = new Transform();
B._transform = function (chunk, encoding, callback) {
	this.push(chunk);
	setImmediate(callback);
}

var C = new Writable();
C._write = function (chunk, encoding, callback) {
	console.log('#', chunk);
	callback();
}

A.pipe(B).pipe(C).on('finish', function () {
	tap.ok(true, 'stream piping ended with end event')
});
