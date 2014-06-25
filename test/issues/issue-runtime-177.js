console.log('1..1');

var a = {}
a.NaN = 0/0
a.nan = 0/0
a['-NaN'] = 0/0
a['-nan'] = 0/0
a.Infinity = 0/0
a.infinity = 0/0
a['-Infinity'] = 0/0
a['-infinity'] = 0/0

console.log('ok');
