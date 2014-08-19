var tap = require('../tap');

tap.count(8);

var n = 42;
tap.ok(n.toString(10) == '42')
console.log("# base 10:", JSON.stringify(n.toString(10)));
tap.ok(n.toString(16) == '2a')
console.log("# base 16:", JSON.stringify(n.toString(16)));
tap.ok(n.toString(2) == '101010')
console.log("# base  2:", JSON.stringify(n.toString(2)));
tap.ok(n.toString(24) == '1i')
console.log("# base 24:", JSON.stringify(n.toString(24)));

console.log()

// stress test invalid radixes
try { n.toString(1); tap.ok(false); }
catch (e) { tap.ok(e); }
try { n.toString(0); tap.ok(false); }
catch (e) { tap.ok(e); }
try { n.toString(37); tap.ok(false); }
catch (e) { tap.ok(e); }
try { n.toString("1"); tap.ok(false); }
catch (e) { tap.ok(e); }