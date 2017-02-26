'use strict';

const IncPoll = require('./../lib/utilities/IncPoll');
const arr = Array.from({length:12}).map((val, idx) => {
    return idx;
});

const incPoll = new IncPoll({
    interval: 300,
    chunk: 5,
    task: function (inc) {
        return new Promise(function(resolve) {
            console.log('poll, inc: ', inc);
            setTimeout(() => {
                resolve(arr.slice(inc, inc + 5));
            }, 3000);
        });
    },
    start: 3
});

incPoll.on('data', data => console.log('data', data));
incPoll.on('progress', progress => {console.log(progress) });

incPoll.start();

setTimeout(() => {
    //incPoll.stop();
},2000);