'use strict';

module.exports = function(socket) {
    const devices = {};

    const deviceTypes={
        OpenBio:require('./OpenBio')(socket),
        OpenSpectro:require('./OpenSpectro')(socket)
    }

    var arduino = new EventEmitter();

    socket.on('newDevice', device => {
        if(devices[device.id]) {
            arduino.emit('error', new Error('Same device received twice. There is a bug!'));
            return;
        }
        devices[device.id]= new deviceTypes[device.type](device.id);
        arduino.emit('newDevice', devices[device.id]);
    })
};