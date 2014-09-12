var tap = require('../tap');

tap.count(7);

function MyObject(name){
    this.name = name;
}
MyObject.prototype.yo = function(){
    tap.ok(true, "Greetings from " + this.name);
}
var o = new MyObject("adrian");
tap.ok(o, "original");
o.yo();

var i = Object(o);
tap.ok(i, "Object()");
i.name = "zankich";
i.yo();
o.yo();

tap.ok(i, "Object()");
tap.ok(o, "original");
