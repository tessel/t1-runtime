var i = 0
apples: while (i < 5) {
	print("Level " + i)
	i++
	var j = 0
	pears: while (j < 5) {
		print("J: " + j)
		if (i == 3) continue apples;
		j++
	}
}

for (var i = 0; i < 5; i++) {
	if (i % 2) continue;
	print('Even i: ' + i)
}

var i = 0
candy: while (i < 7) {
	i++
	try {
		if (i == 3) continue candy;
		print("i="+i)
		if (i == 5) throw "Some error when i == 5"
	} catch (e) {
		print("Error: " + e)
	}
	print("Incrementing...")
}
