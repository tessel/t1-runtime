var b = 0;
function a () {
	return b = 5; 
}

console.log((b = {a: 5}).a);

var test = [function () { console.log(ok); }]

test[a]();