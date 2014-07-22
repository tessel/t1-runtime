var a = [1];
var s = new Array(1);
var o = {};
var g = global || this;
var result = 0;

// No null or undefined callbackfn
try {
  a.every(null);
  a.every(undefined);
  // this never happens
  result++;
} catch(e) {}

// No null or undefined context
try {
  a.every.call(null);
  a.every.call(undefined);
  // this never happens
  result++;
} catch(e) {}

// No sparse array iteration
s.every(function() {
  // this never happens
  result++;
});

a.every(function(value, index, object) {
  if (value === 1) {
    result++;
  }

  if (index === 0) {
    result++;
  }

  if (object === a) {
    result++;
  }

  if (this === g) {
    result++;
  }
});

a.every(function(value, index, object) {
  if (this === o) {
    result++;
  }
}, o);

// Returns true when array is empty
if ([].every(function() {})) {
  result++;
}

// Returns true as expected
if ([1, 2, 3].every(function() { return true; })) {
  result++;
}

// Returns false as expected
if ([1].every(function() { return false; })) {
  // This will not be reached
  result++;
}

// Returns on "falsy" as expected
if ([1].every(function() { return ''; })) {
  // This will not be reached
  result++;
}

// Returns on "falsy" as expected
if ([1].every(function() { return 0; })) {
  // This will not be reached
  result++;
}

// Returns on "falsy" as expected
if ([1].every(function() { return null; })) {
  // This will not be reached
  result++;
}

// Returns on "falsy" as expected
if ([1].every(function() { return undefined; })) {
  // This will not be reached
  result++;
}

// Returns on "falsy" as expected
if ([1].every(function() { return NaN; })) {
  // This will not be reached
  result++;
}

// Stops when reaches false
var count = 0;
[1, 2, 3].every(function(value, index, object) {
  count++;
  return false;
});
result += count;

console.log('1..1');
console.log( result === 8 ? 'ok' : 'not ok' );


