var arr = [];

console.log('1..1')
for (var i in arr) {
	console.log(i);
	console.log('nok', '- Array should not have found index', i)
  process.exit(1);
}
console.log('ok')