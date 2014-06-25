console.log('1..7');
console.log(Number.isFinite('5') == false ? 'ok' : 'not ok');
console.log(Number.isFinite(NaN) == false ? 'ok' : 'not ok');
console.log(Number.isFinite(Infinity) == false ? 'ok' : 'not ok');
console.log(Number.isFinite(-Infinity) == false ? 'ok' : 'not ok');
console.log(Number.isFinite(1.7976931348623157E+10308) == false ? 'ok' : 'not ok');
console.log(Number.isFinite(1.7976931348623157E+10308 - 1) == true ? 'ok' : 'not ok');
console.log(Number.isFinite(5) == true ? 'ok' : 'not ok');
