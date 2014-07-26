var result = 0;

if (NaN) {
  // This should not be reached.
  result++;
}

console.log('1..1');
console.log(!result ? 'ok' : 'not ok');
