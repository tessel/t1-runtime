var arr = [1, 2, 3, 4, 5];
arr.hello = 'hi';

for (var i in arr) {
	console.log(i, '=>', arr[i]);
}