var subj1 = "there are 99 red balloons";
var subj2 = "here is a caveaaAEEAAEeaeaEAEaeeaEEAEEAet about regexes."
var subj3 = " ###    ##     ####  ";

var a = new RegExp("\\d+");
console.log(subj1.match(a))

var b = /(\d+)(\s+)/;
console.log(subj1.match(b))

var c = /cav[ea]+t/i;
console.log(subj2.match(c))

console.log(c.test(subj2))

console.log(subj3.replace(/\#+/, '___'))
console.log(subj3.replace(/\#+/g, '___'))

console.log(subj3.replace(/\#(\#*)/g, function (whole, p1, offset, str) {
  console.log('-->', whole, p1, offset, str);
  return whole.length
}));