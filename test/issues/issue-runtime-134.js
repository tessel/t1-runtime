console.log('1..1');


var regexSeparators = /\x2E|\u3002|\uFF0E|\uFF61/g;

console.log((/\x50/).test('P') ? 'ok' : 'not ok');
console.log((/\u0050/).test('P') ? 'ok' : 'not ok');
