process.stdin.resume();
process.stdin.on('data', function (buf) {
console.log(buf);
process.stdin.pause();
})
