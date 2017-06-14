'use strict';
const DeviceFactory = require('../../devices/DeviceFactory');
const debug = require('debug')('arduimon:socketio:devices');


module.exports = function (io) {

    io.on('connection', function (socket) {
        debug('connection');
        // at startup of the connection, all the deviceList is sent,
        // the ready event ensures the code init in the visualizer is served before the events

        socket.on('ready', function () {
            var deviceList = DeviceFactory.getDeviceList();
            for (let key in deviceList) {
                socket.emit('newDevice', {id: parseInt(key), type: deviceList[key].type, status: deviceList[key].status});
            }
        });

        //handling server requests
        socket.on('request', function (request, fn) {
            if (request.type === 'static-method') {
                debug('received static request from client:' + JSON.stringify(request));
                debug('device constructor is ' + request.constructorName);
                var constructor = require('../devices/' + request.constructorName + '/' + request.constructorName);
                var method = request.method;
                if (constructor[method] === undefined) {
                    fn({
                        status: 'error',
                        error: 'no device present corresponding to the request'
                    });
                } else {
                    Promise.resolve(constructor[method].apply(null, request.args))
                        .then((data) => ({status: 'success', data: data}))
                        .then(fn)
                        .catch((err) => fn({status: 'error', error: err.message}));
                }

            } else if (request.type === 'method') {
                var device = DeviceFactory.getDevice(request.id);
                debug('received request from client:' + JSON.stringify(request));
                debug('device id is ' + request.id);
                debug('device is:' + JSON.stringify(device));
                if (device === undefined) {
                    fn({
                        status: 'error',
                        error: 'no device present corresponding to the request'
                    });
                } else {
                    Promise.resolve(device[request.method].apply(device, request.args))
                        .then((data) => ({status: 'success', data: data}))
                        .then(fn)
                        .catch((err) => fn({status: 'error', error: err.message}));
                }
            }


        });

        socket.on('disconnect', function () {
            debug('stopping socket.io client');
        });

        socket.on('error', err => debug(`socket error: ${err.message}`));

    });

    // //Listeners
    DeviceFactory.on('newDevice', device => {
        io.emit('newDevice', {
            id: device.id,
            type: device.type,
            status: device.status
        });
    });

    DeviceFactory.on('connect', id => {
        debug('connect event server:' + id);
        io.emit('deviceConnected', id);
    });

    DeviceFactory.on('disconnect', id => {
        debug('disconnect event server:' + id);
        io.emit('deviceDisconnected', id);
    });

};
