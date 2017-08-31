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

    generalMethods();

    async function generalMethods() {
        /*
         We can now call all the 'default' methods. Those methods are
         expected to be implemented in all our devices
         */

        console.log(separator,'getFormattedFreeMemory',separator);
        var aa=await device.getFormattedFreeMemory();
        console.log(aa);

        return;
        console.log(separator,'setParameterValue A',separator);
        var a=await device.setParameterValue('A',12.345);
        console.log(a);

        console.log(separator,'getParameterValue A',separator);
        var a=await device.getParameterValue('A');
        console.log(a);

        return;

        console.log(separator,'getCurrentDeviceInformation',separator);
        var status = await device.getCurrentDeviceInformation()
        console.log(status);
        return;
        console.log(separator,'getHelp',separator);
        var data = await device.getHelp()
        console.log(data);

        console.log(separator,'getFreeMemmory',separator);
        var freeMemory=await device.getFreeMemory();
        console.log(freeMemory);

        console.log(separator,'getDeviceInformation',separator);
        var parameters=await device.getDeviceInformation();
        console.log(parameters);

        console.log(separator,'getEpoch',separator);
        var epoch=await device.getEpoch();
        console.log(epoch);

        console.log(separator,'getParameter A',separator);
        var a=await device.getParameter('A');
        console.log(a);

        console.log(separator,'getSettings',separator);
        var settings=await device.getSettings();
        console.log(settings);

        console.log(separator,'getFormattedSettings',separator);
        var settings=await device.getFormattedSettings();
        console.log(settings);
    }

});

DeviceFactory.on('error', err => console.log);