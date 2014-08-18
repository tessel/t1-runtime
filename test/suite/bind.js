var tap = require('../tap');

tap.count(4);

var util = require('util');
var EventEmitter = require('events').EventEmitter;

function UART(){}
util.inherits(UART, EventEmitter);

var globalUART = new UART();
function Test() {
    this.uart = globalUART;
    this.uart.on('data', this.parseIncoming.bind(this));
}

var i = 1;
Test.prototype.parseIncoming = function(data, _, _, _, _, c) {
    tap.ok(data == i, 'test ' + i + ' bound arguments correctly');
    console.log('#', arguments)
    i++
    if (i == 4) {
    	tap.ok(c != null, 'last numerical value included');
    }
}

var test = new Test();
setTimeout(function() {
    globalUART.emit('data', 1)
    globalUART.emit('data', 2, 'extra args');
    globalUART.emit('data', 3, 'extra args', 'more extra args', 1, 2, 3);
}, 0);