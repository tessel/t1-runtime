var tap = require('../tap')

tap.count(5)

var arr = [1, 2, 3, 4, 5];

var compare = [
	[0,3,4,5],
	[1,0,4,5],
	[1,2,0,5],
	[1,2,3,0],
]

arr.forEach(function(val, index){
  if (index+1 < arr.length) {
    var newArr =  JSON.parse(JSON.stringify(arr));
    newArr[index+1] = 0;
    newArr.splice(index, 1);
    tap.eq(newArr.join(','), compare[index].join(','), 'array splice iteration ' + index);
  }
});

var arr2 = [1, 0, 2, 3]
arr2.shift();
tap.eq(arr2.join(','), '0,2,3', 'array shift works with leading 0 index')
