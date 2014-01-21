console.log('1..2')
console.log(process.versions.colony ? 'ok' : 'not ok', '1 - running in colony')
console.log("garbage 09 _ - !@#$%".match(/^[\s\S]+$/) ? 'ok' : 'not ok', '2 - regex match');