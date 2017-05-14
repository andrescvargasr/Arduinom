'use strict';

const DeviceFactory = require('../src/devices/DeviceFactory');

DeviceFactory.on('newDevice', device => {
    console.log('New device', device);



    device.getParsedCompactLog().then(data => {
        console.log(data);
    });


    device.getParsedMultiLog(0).then(data => {
        console.log(data);
    })

});

DeviceFactory.on('error', err => console.log);