var tap = require('../tap');

tap.count(4);

var test = /^(?::(\d*))?/
var a = ('WRONG'.match(test))

tap.eq(a[0], "");
tap.eq(a[1], undefined);

var test = /^(?::(\d*))?/
var a = (':5'.match(test))

tap.eq(a[0], ":5")
tap.eq(a[1], "5");
