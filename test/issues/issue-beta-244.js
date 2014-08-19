var tap = require('../tap');

tap.count(2);

var json = JSON.parse('{"1":true,"one":true}');

tap.ok(json[1]);
tap.ok(json['one']);
console.log('#', json)