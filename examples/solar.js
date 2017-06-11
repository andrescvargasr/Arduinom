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
    if (device.type !== 'Solar') return;
    console.log('We found a Solars');

    solarMethods();

    async function solarMethods() {

        console.log(separator,'getMultiLog',separator);
        var lastLog=await device.getMultiLog();
        console.log(lastLog);

        console.log(separator,'getParsedMultiLog',lastLog,separator);
        var multilog=await device.getParsedMultiLog(lastLog-10, {
            hasEvent:false
        });
        console.log(multilog);

        console.log(separator,'getTemperature',separator);
        var temperature=await device.getTemperature();
        console.log(temperature);

        console.log(separator,'getHumidity',separator);
        var humidity=await device.getHumidity(1);
        console.log(humidity);

        console.log(separator,'getLight',separator);
        var light=await device.getLight();
        console.log(light);

        console.log(separator,'getPressure',separator);
        var pressure=await device.getPressure();
        console.log(pressure);


        console.log(separator,'getMultiLog',lastLog,separator);
        var multilog=await device.getMultiLog(lastLog-10);
        console.log(multilog);



    }
});

DeviceFactory.on('error', err => console.log);