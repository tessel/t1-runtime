var a = [1];
a.splice(0, 1);
console.log(a, []);

var a = [1, 2, 3];
a.splice(1, 1);
console.log(a, [1, 3]);

var a = [2, 3];
a.unshift(1);
console.log(a, [1, 2, 3]);

var a = [];
a.unshift(1);
console.log(a, [1]);