var arr = [];
arr.hello = 'hi';
arr.push(1, 2, 3, 4, 5);

for (var i in arr) {
	console.log(i, '=>', arr[i]);
}