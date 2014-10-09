console.log('1..3');

// Number.isNaN

console.log(Number.isNaN('NaN') == false ? 'ok' : 'not ok - isNaN string');
console.log(Number.isNaN(NaN) == true ? 'ok' : 'not ok - isNaN NaN');
console.log(Number.isNaN(3) == false ? 'ok' : 'not ok - isNaN integer');
