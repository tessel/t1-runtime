var tap = require('../tap');

tap.count(1);

function MyObject(name){
  this.name = name;
}
var o = new MyObject("adrian");
var a = [].concat(o);
tap.eq(String(a), '[object Object]');
