'use strict';

const DeviceFactory = require('../src/devices/DeviceFactory');

DeviceFactory.on('newDevice', device => {
    console.log(device);
    device.getParsedCompactLog().then(data => {
        console.log('q res', data);
    })
});

DeviceFactory.on('error', err => console.log);