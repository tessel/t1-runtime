var subj1 = "there are 99 red balloons";

var a = new RegExp("\\d+");
console.log(subj1.match(a))

var b = /\d+/;
console.log(subj1.match(b))
