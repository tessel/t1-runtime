console.log([0, 1, 2, 3].reduce(function(a, b) {
    return a + b;
}), 6);

console.log([[0, 1], [2, 3], [4, 5]].reduce(function(a, b) {
    return a.concat(b);
}), [0, 1, 2, 3, 4, 5]);