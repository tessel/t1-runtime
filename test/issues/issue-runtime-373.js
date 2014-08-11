var tap = require('../tap');

tap.count(6);

var fruits = ["Banana", "Orange", "Apple", "Mango", "Cherry"];
fruits.splice(0, 4);
tap.eq(fruits.toString(), 'Cherry', 'splice is correct w/ deleting at 0');

var fruits = ["Banana", "Orange", "Apple", "Mango", "Cherry"];
fruits.splice(0, 4, 'Pear');
tap.eq(fruits.toString(), 'Pear,Cherry', 'splice is correct w/ deleting and inserting at 0');

var fruits = ["Banana", "Orange", "Apple", "Mango", "Cherry"];
fruits.splice(0, 0, 'Pear');
tap.eq(fruits.toString(), 'Pear,Banana,Orange,Apple,Mango,Cherry', 'splice is correct w/ inserting at 0');

var fruits = ["Banana", "Orange", "Apple", "Mango", "Cherry"];
fruits.splice(1, 4);
tap.eq(fruits.toString(), 'Banana', 'splice is correct w/ deleting at 1');

var fruits = ["Banana", "Orange", "Apple", "Mango", "Cherry"];
fruits.splice(1, 4, 'Pear');
tap.eq(fruits.toString(), 'Banana,Pear', 'splice is correct w/ deleting and inserting at 1');

var fruits = ["Banana", "Orange", "Apple", "Mango", "Cherry"];
fruits.splice(1, 0, 'Pear');
tap.eq(fruits.toString(), 'Banana,Pear,Orange,Apple,Mango,Cherry', 'splice is correct w/ inserting at 1');
