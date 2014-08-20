var Keen = require('keen.io');

// Configure instance. Only projectId and writeKey are required to send data.
var client = Keen.configure({
    projectId: "53ea6609c9e1630d52000002",
    writeKey: "af7df55b5c7eb1cb2bb951892e5137764804b8e39854027b50b3fd19823e060e3be712ada94c76053a4e03ffa18809719a18fba83f042f3c20ff9b74e4cbdd8ba3fb2d86db0f324959fd090245bd8fdbbee5c1daf911bc8cc537b7683ed0bc5d77f3e4facc04c91e35328d03e48ed5bd",
});

// send single event to Keen IO
console.log('adding event');
client.addEvent("my event collection", {"property name": "property value"}, function(err, res) {
    if (err) {
        console.log("Oh no, an error!", err);
    } else {
        console.log("Hooray, it worked!");
    }
});