var subj1 = "there are 99 red balloons";
var subj2 = "here is a caveaaAEEAAEeaeaEAEaeeaEEAEEAet about regexes."

var a = new RegExp("\\d+");
console.log(subj1.match(a))

var b = /\d+/;
console.log(subj1.match(b))

var c = /cav[ea]+t/i;
console.log(subj2.match(c))