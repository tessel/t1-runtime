var b = [1, 2, 3];
var a = {b: b};
console.log('[object Object] { b: [ 1, 2, 3 ] } 1,2,3 [ 1, 2, 3 ] [object Object]');
console.log(String(a), a, String(b), b, String(global));
console.log('');
console.log("undefined null true 5 hi { hey: 'there' }")
console.log(undefined, null, true, 5, "hi", {hey: 'there'})
console.log('')
console.log('true true true');
console.log(b instanceof Array, a instanceof Object, parseFloat instanceof Function);
console.log('')
console.log('false true false');
console.log(a instanceof Array, parseFloat instanceof Object, b instanceof Function);
console.log('')
console.log('false true false');
console.log(parseFloat instanceof Array, b instanceof Object, a instanceof Function);