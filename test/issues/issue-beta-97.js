var tap = require('../tap');

tap.count(2);

function MyObject(name){
    this.name = name;
    MyObject.booyakasha = function() {
      return "Hear me now!";
    }
}
MyObject.prototype.yo = function(){
    console.log("# Greetings from " + this.name);
}

var o = new MyObject("adrian");
o.yo();

tap.ok(o.constructor, "o.constructor");
tap.eq(o.constructor.booyakasha(), 'Hear me now!', "o.constructor.booyakasha()");
