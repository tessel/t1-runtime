console.log('1..4');
console.log([1,2,3].join() == '1,2,3' ? 'ok' : 'not ok');
console.log([1,2,3].join('###') == '1###2###3' ? 'ok' : 'not ok');
console.log([1,2,3].join(1) == '11213' ? 'ok' : 'not ok');
console.log([1,2,3].join(null) == '1,2,3' ? 'ok' : 'not ok');
