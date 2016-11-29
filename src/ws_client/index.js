'use strict';

module.exports = function(socket) {
    const devices = {};
    const EventEmitter = require('events');

    const deviceTypes={
        OpenBio:require('./OpenBio')(socket),
        OpenSpectro:require('./OpenSpectro')(socket)
    }

    var arduino = new EventEmitter();

    arduino.getDevices=function(){
        return devices;
    }

    socket.on('newDevice', device => {
        if(devices[device.id]) {
            arduino.emit('error', new Error('Same device received twice. There is a bug!'));
            return;
        }
        devices[device.id]= new deviceTypes[device.type](device.id);
        devices[device.id].status=device.status;
        arduino.emit('newDevice', devices[device.id]);
    })

    arduino.ready=function(){
        socket.emit('ready');
    }
    return arduino;
};