console.log('1..7')

function MyObject(name){
    this.name = name;
}
MyObject.prototype.yo = function(){
    console.log("ok Greetings from " + this.name);
}
var o = new MyObject("adrian");
console.log("ok original", o);
o.yo();

var i = Object(o);
console.log("ok Object()", i);
i.name = "zankich";
i.yo();
o.yo();

console.log("ok Object()", i);
console.log("ok original", o);