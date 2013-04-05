// var i = 0
// apples: while (i < 5) {
// 	console.log("Level " + i)
// 	i++
// 	var j = 0
// 	pears: while (j < 5) {
// 		console.log("J: " + j)
// 		if (i == 3) continue apples;
// 		j++
// 	}
// }

// for (var i = 0; i < 5; i++) {
// 	if (i % 2) continue;
// 	console.log('Even i: ' + i)
// }

var i = 0
candy: while (i < 7) {
	i++
	try {
		if (i == 3) continue candy;
		console.log("i="+i)
		if (i == 5) throw "Some error when i == 5"
	} catch (e) {
		console.log("Error: " + e)
	}
	console.log("Incrementing...")
}
