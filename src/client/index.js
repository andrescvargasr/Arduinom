'use strict';

module.exports = function (socket) {
    const devices = {};
    const EventEmitter = require('events');

    const deviceTypes = {
        OpenBio: require('./OpenBio')(socket),
        OpenSpectro: require('./OpenSpectro')(socket)
    };

    var arduino = new EventEmitter();

    arduino.getDevices = function () {
        return devices;
    };

    socket.on('newDevice', device => {
        if (devices[device.id]) {
            devices[device.id].setStatus('connect');
            return;
        }
        devices[device.id] = new deviceTypes[device.type](device.id);
        devices[device.id].status = device.status;
        arduino.emit('newDevice', devices[device.id]);
    });

    socket.on('connect_error', ()=> {
        arduino.emit('serverLost');
    });

    socket.on('reconnect', ()=> {
        arduino.emit('serverReconnected');
    });


    arduino.ready = function () {
        socket.emit('ready');
    };
    return arduino;
};
