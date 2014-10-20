var tap = require('../tap');

tap.count(1);

iCalled();

function iCalled() { callMeMaybe(); }
function callMeMaybe() {
    tap.ok(arguments.callee== callMeMaybe,'function callee');
}

/*
var splunkjs = require('splunk-sdk');

setImmediate(function start() {
    var service = new splunkjs.Service({
        username: "admin", 
        password: "changeme", 
        host:"192.168.20.106", 
        port:"8089"}
    );

    service.login(function(err, success) {
        if (err) {
            throw err;
        }

        console.log("Login was successful: " + success);
        service.jobs().fetch(function(err, jobs) {
            var jobList = jobs.list();
            for(var i = 0; i < jobList.length; i++) {
                console.log("Job " + i + ": " + jobList[i].sid);
            }
        });
    });
});*/