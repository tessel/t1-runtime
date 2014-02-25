console.log('1..1')
var val = "aa".replace(/(..)/g, '\\$1\\$1\\$1') 
console.log(val == '\\aa\\aa\\aa' ? 'ok' : 'not ok')
console.log('#', val)