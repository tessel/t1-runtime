console.log('1..8');

console.log("Blue Whale".indexOf("Blue") == 0 ? 'ok' : 'not ok');
console.log("Blue Whale".indexOf("Whale") == 5 ? 'ok' : 'not ok');
console.log("Blue Whale".indexOf("Blute") == -1 ? 'ok' : 'not ok');
console.log("Blue Whale".indexOf("Whale", 0) == 5 ? 'ok' : 'not ok');
console.log("Blue Whale".indexOf("Whale", 5) == 5 ? 'ok' : 'not ok');
console.log("Blue Whale".indexOf("", 9) == 9 ? 'ok' : 'not ok');
console.log("Blue Whale".indexOf("", 10) == 10 ? 'ok' : 'not ok');
console.log("Blue Whale".indexOf("", 11) == 10 ? 'ok' : 'not ok');