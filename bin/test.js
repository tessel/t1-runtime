console.log('hi', Math.random());

var i = 0;
setInterval(function a () {
  console.log('This will run on next event loop.');
  if (i++ == 5) {
    dointerrupt();
  }
  console.log('Closing event loop...');
}, 100)