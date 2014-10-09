// ES6 methods not in Node 0.10
// Number.isSafeInteger, Number.parseInt, Number.parseFloat

console.log('1..14');

console.log(Number.isSafeInteger('3') == false ? 'ok' : 'not ok - isSafeInteger string');
console.log(Number.isSafeInteger(0/0) == false ? 'ok' : 'not ok - isSafeInteger NaN');
console.log(Number.isSafeInteger(Infinity) == false ? 'ok' : 'not ok - isSafeInteger Infinity');
console.log(Number.isSafeInteger(-Infinity) == false ? 'ok' : 'not ok - isSafeInteger -Infinity');
console.log(Number.isSafeInteger(3.3) == false ? 'ok' : 'not ok - isSafeInteger float');
console.log(Number.isSafeInteger(2e53) == false ? 'ok' : 'not ok - isSafeInteger 2e53');
console.log(Number.isSafeInteger((9007199254740991)) == true ? 'ok' : 'not ok - isSafeInteger 2e53 -1');
console.log(Number.isSafeInteger(3) == true ? 'ok' : 'not ok - isSafeInteger 3');

console.log(Number.parseInt('4') == 4 ? 'ok' : 'not ok - parseInt int string');
console.log(Number.parseInt('0') == 0 ? 'ok' : 'not ok - parseInt int string');
console.log(isNaN(Number.parseInt('string')) ? 'ok' : 'not ok - parseInt string');

console.log(Number.parseFloat('4.3') == 4.3 ? 'ok' : 'not ok - parseFloat float string');
console.log(Number.parseFloat('0') == 0 ? 'ok' : 'not ok - parseFloat float string');
console.log(isNaN(Number.parseFloat('string')) ? 'ok' : 'not ok - parseFloat string' );
