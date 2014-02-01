function MyObject(name){
  this.name = name;
}
var o = new MyObject("adrian");
var a = [].concat(o);
console.log(a);
console.log('ok')