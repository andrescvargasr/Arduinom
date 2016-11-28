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
    // at startup of the connection, all the deviceList is sent
    var deviceList = DeviceFactory.getDeviceList();
    for (var key in deviceList) {
        socket.emit('newDevice', {id: key, type: deviceList[key].type});
    }
    //handling server requests
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

    socket.on('error', console.error.bind(console)); // see if we emit instead
});


// //Listeners
DeviceFactory.on('newDevice', device => {
    io.emit('newDevice', {
        id: device.id,
        type: device.type,
    });
});

DeviceFactory.on('connect', id => {
    io.emit('connect',id);
});

DeviceFactory.on('disconnect', id => {
    io.emit('disconnect',id);
});

