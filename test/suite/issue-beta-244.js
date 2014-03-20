var json = JSON.parse('{"1":true,"one":true}');

console.log('1..2')
console.log(json[1] ? 'ok' : 'not ok');
console.log(json['one'] ? 'ok' : 'not ok');
console.log('#', json)