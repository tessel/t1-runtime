var a = 0x555, b = 0xFF
console.log((-a) % b == -90);
console.log((-a) % b);
console.log('modulus check: -0x555 % 0xFF == -90');

console.log('');
var a = 1407017207642.3; b = 1e3;
console.log(a,'%', b);
console.log(a % b);
var c1 = 100, c2 = 1407025930011, c3 = -100, c4 = -1100;
console.log(c1 % b, c2 %b, c3 % b, c4 % b);