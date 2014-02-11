/* test rig */ var t = 1, tmax = 2
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);
ok(process.versions.colony, 'running in colony')

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
    ok(data == i, 'test ' + i + ' bound arguments correctly');
    console.log('#', arguments)
    i++
    if (i == 4) {
    	ok(c != null, 'last numerical value included');
    }
}

var test = new Test();
setTimeout(function() {
    globalUART.emit('data', 1)
    globalUART.emit('data', 2, 'extra args');
    globalUART.emit('data', 3, 'extra args', 'more extra args', 1, 2, 3);
}, 0);