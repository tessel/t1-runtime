/* TAP rig */
function tap (max) { tap.t = 1; console.log(tap.t + '..' + max); };
function ok (a, d) { console.log((a ? '' : 'not ') + 'ok', tap.t++, '-', d); }

tap(3);

var simpleQueue = new Array();

simpleQueue.pushItem = function(item) {
  this.push(item);
  ok(this.length == 2, "Length should be 2: " + this.length);
};

simpleQueue.push(1);
ok(simpleQueue.length == 1);

simpleQueue.pushItem('foo');

var b = new Array();
b[0] = 5;
b[1] = 5;
b.push(1);
ok(b.length == 3);
