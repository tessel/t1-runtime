var id = setInterval(function () {
  console.log('error');
}, 100)

clearInterval(id);

console.log('please dont say "error". timeout id:', id)