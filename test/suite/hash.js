var a = { hi: "hi", heya: "there", hellos: "amigos", hitheres: "goodbye" }

console.log('... nullifying values')

a.hellos = null
a.hi = null

console.log('... setting new values')

a.abcdefghij = "pear"
a.abcdefghijkl = "cob"

console.log('... should output some undefined values:')
for (var key in a) {
	console.log(key, '=>', a[key])
}

console.log();


console.log('... array test');
var b = [1, 2, 3, 4, 5]
console.log(b.length, '==5');
b[4] = null
console.log(b.length, '==5');
b[2] = null
console.log(b.length, '==5');
b[20] = 5
console.log(b.length, '==21');
