console.log(JSON.parse("{\"hi\": 5}"), JSON.stringify({"hi": 5}));


console.log(JSON.parse("[0, 1, 2]"), JSON.stringify([0, 1, 2]));


console.log(JSON.parse("{\"hi\": 5}").hasOwnProperty);
console.log(JSON.parse("[0, 1, 2]").slice);
console.log(JSON.stringify({a: function () {}, b: 5}));