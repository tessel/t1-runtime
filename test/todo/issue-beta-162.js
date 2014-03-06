var loopNum = 0;

console.log('Starting outer loop.');
var outerLoop = setInterval(function(){
  loopNum++;
  console.log('.. Starting inner loop #', loopNum);
  var myLoop = setInterval(function(){
    console.log('.. -- looped [10ms]');
  }, 10);
  setTimeout(function(){
    console.log('.. Clearing inner loop #' + loopNum + ' after 50ms. (5 iterations)');
    clearInterval(myLoop);
  }, 50);
}, 60);

setTimeout(function(){
    console.log('Stopping outer loop after 1000ms (' + (1000/60 - 1).toFixed(0) + ' iterations)');
    clearInterval(outerLoop);
}, 1000);