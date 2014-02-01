/* test rig */ var t = 1, tmax = 2
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);
ok(process.versions.colony, 'running in colony')


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

ok(o.constructor, "o.constructor");
ok(o.constructor.booyakasha() == 'Hear me now!', "o.constructor.booyakasha()");