'use strict'
const OpenBio = require('../devices/OpenBio/OpenBio');
const OpenSpectro = require('../devices/OpenSpectro/OpenSpectro');
const express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3000);

app.use(express.static('src/public'));

io.on('connection', function (socket) {
    socket.emit('news', {hello: 'world'});
    socket.on('my other event', function (data) {
        console.log(data);
    });
});


var path = require('path');
var DeviceFactory = require("../devices/DeviceFactory");
// Emit welcome message on connection
io.on('connection', function (socket) {
    console.log('connection')
    var deviceList = DeviceFactory.getDeviceList();
    socket.emit('deviceList', JSON.stringify(deviceList));
    // Use socket to communicate with this particular client only, sending it it's own id
    setListeners(io);
    socket.emit('welcome', {message: 'Welcome!', id: socket.id});
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

    socket.on('i am client', console.log);
    socket.on('disconnect', function () {
        console.log('stopping socket.io client');
        clearListeners();
    });
});


//Listeners
function setListeners(io) {
    clearListeners();
    DeviceFactory.on('deviceList', (deviceList)=> {
        io.emit('deviceList', JSON.stringify(deviceList));
    });
}
function clearListeners() {
    DeviceFactory.removeAllListeners('deviceList'); //why is it displaying an error here ?=
}
