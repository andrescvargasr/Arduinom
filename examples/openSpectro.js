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
    console.log('We found an OpenSpectro');

    spectroMethods();

    async function spectroMethods() {

        console.log(separator,'calibrate',separator);
        var delay=await device.calibrate();
        console.log(delay);

        return;

        console.log(separator,'setExperimentDelay',separator);
        var delay=await device.setExperimentDelay(1);
        console.log(delay);

        console.log(separator,'getExperimentDelay',separator);
        var delay=await device.getExperimentDelay();
        console.log(delay);

        console.log(separator,'testAllColors',separator);
        var allColors=await device.testAllColors();
        console.log(allColors);

        console.log(separator,'testAllColors',separator);
        var allColors=await device.testAndParseAllColors();
        console.log(allColors);

        console.log(separator,'runExperiment',separator);
        var experiment=await device.runExperiment();
        console.log(experiment);

        console.log(separator,'runAndParseExperiment',separator);
        var experiment=await device.runAndParseExperiment();
        console.log(experiment);
    }
});

DeviceFactory.on('error', err => console.log);