var str = "x".replace(/x/, function () {
  return true;
});
console.log(JSON.stringify(str));
