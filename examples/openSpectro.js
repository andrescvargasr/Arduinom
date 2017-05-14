'use strict';

const DeviceFactory = require('../src/devices/DeviceFactory');
const separator='='.repeat(30);

DeviceFactory.on('newDevice', device => {
    /*
     Device type is based on the 'qualifier'. All our programs
     should answer to the letter 'q'
     Open spectrometer starts with 'S' so the qualifier should be
     between 83*256+33 to 83*256+123
     [\x21-\x7A]
     Based on the 'high' byte we can determine the kind of device
     it is and know the corresponding functions.
    */

    console.log('We found a new device of type:',device.type);

    if (device.type !== 'OpenSpectro') return;

    generalMethods();

    async function generalMethods() {
        /*
         We can now call all the 'default' methods. Those methods are
         expected to be implemented in all our devices
         */
        console.log(separator,'getHelp',separator);
        var data = await device.getHelp()
        console.log(data);

        console.log(separator,'getFreeMemmory',separator);
        var freeMemory=await device.getFreeMemory();
        console.log(freeMemory);

        console.log(separator,'getParameters',separator);
        var parameters=await device.getParameters();
        console.log(parameters);

        console.log(separator,'getEpoch',separator);
        var epoch=await device.getEpoch();
        console.log(epoch);

    };





});

DeviceFactory.on('error', err => console.log);