var test = /^(?::(\d*))?/
var a = ('WRONG'.match(test))
for (var i = 0; i < a.length; i++) {
    console.log(JSON.stringify(a[i]));
}

var test = /^(?::(\d*))?/
var a = (':5'.match(test))
for (var i = 0; i < a.length; i++) {
    console.log(JSON.stringify(a[i]));
}