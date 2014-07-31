console.log('1..4');

console.log('#', parseFloat("x"));
console.log(isNaN(parseFloat("x")) ? 'ok' : 'not ok');

console.log('#', parseInt("x"));
console.log(isNaN(parseInt("x")) ? 'ok' : 'not ok');

console.log('#', Number("x"));
console.log(isNaN(Number("x")) ? 'ok' : 'not ok');

console.log('#', +"x");
console.log(isNaN(+"x") ? 'ok' : 'not ok');
