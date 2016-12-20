'use strict';

const DeviceManager = require('serial-requests').DeviceManager;
const deviceManager = new DeviceManager({
    optionCreator: function(portInfo) {
        if(portInfo.manufacturer === 'Arduino_LLC') {
            return {
                baudrate: 38400,
                getIdCommand: 'q',
                getIdResponseParser: function (buffer) {
                    if (!buffer.match(/^\d{1,5}\r\n\r\n$/)) {
                        throw new Error('invalid qualifier');
                    }
                    return parseInt(buffer);
                },
                checkResponse: function (buffer) {
                    return buffer.endsWith('\r\n\r\n');
                }
            }
        }
    }
});

// Search for devices now and then every x seconds
deviceManager.refresh();
setInterval(() => deviceManager.refresh(), 8000);

module.exports = deviceManager;