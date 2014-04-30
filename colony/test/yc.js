var B = function A (arg) {
  if (!arg) { A('works!'); }
  else { console.log(arg); }
}

B();
console.log(typeof A);

var C = function test2 (arg) {
	function A () {
		if (!arg) { test2('works!'); }
  		else { console.log(arg); }
	}
	A();
}

C();