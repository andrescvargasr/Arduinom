'use strict'
const OpenBio = require('../devices/OpenBio/OpenBio');
const OpenSpectro = require('../devices/OpenSpectro/OpenSpectro');
const express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3000);

app.use(express.static('src/public'));

var path = require('path');
var DeviceFactory = require("../devices/DeviceFactory");
// Emit welcome message on connection
io.on('connection', function (socket) {
    console.log('connection');
    var deviceList = DeviceFactory.getDeviceList();
    for(var key in deviceList){

    }
    //socket.emit('deviceList', JSON.stringify(deviceList));
    //socket.emit('welcome', {message: 'Welcome!', id: socket.id});
    socket.on('request', function (request, fn) {
        deviceList = DeviceFactory.getDeviceList();
        var device = deviceList[request.id];
        //apply is used to call the static method with provided args
        //check if undefined is ok for request.args
        if (request.type === 'static-method') device.constructor[request.method].apply(null, request.args)
            .then((data) => ({status: 'success', data: data}))
            .then(fn)
            .catch((err) => fn({status: 'error', error: err.message}));

        if (request.type === 'method') device[request.method].apply(device, request.args)
            .then((data) => ({status: 'success', data: data}))
            .then(fn)
            .catch((err) => fn({status: 'error', error: err.message}));
    });

    socket.on('disconnect', function () {
        console.log('stopping socket.io client');
    });
});


//Listeners
DeviceFactory.on('devices', (deviceList)=> {
    io.emit('devices', JSON.stringify(deviceList));
});

DeviceFactory.on('newDevice', device => {
    return {
        id: device.id,
        type: device.type
    }
});
