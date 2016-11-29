'use strict'
const debug = require('debug')('main:sever socket-io');
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
    debug('connection');
    // at startup of the connection, all the deviceList is sent,
    // the ready event ensures the code init in the visualizer is served before the events

    socket.on('ready', function () {
        var deviceList = DeviceFactory.getDeviceList();
        for (let key in deviceList) {
            socket.emit('newDevice', {id: parseInt(key), type: deviceList[key].type, status: deviceList[key].status});
        }
    });

    /*
    socket.on('refreshList', function () {
        var deviceList = DeviceFactory.getDeviceList();
        var devices=[];
        var count =0;
        for (let key in deviceList) {
            devices[count]={id: parseInt(key), type: deviceList[key].type, status: deviceList[key].status};
            count++;
        }
        socket.emit('refreshList', devices);
    });*/

    //handling server requests
    socket.on('request', function (request, fn) {
        debug('received request from client:' +JSON.stringify(request));
        debug('device id is ' + request.id);
        var device = DeviceFactory.getDevice(request.id);
        //apply is used to call the static method with provided args
        //check if undefined is ok for request.args
        if (request.type === 'static-method') Promise.resolve(device.constructor[request.method].apply(null, request.args))
            .then((data) => ({status: 'success', data: data}))
            .then(fn)
            .catch((err) => fn({status: 'error', error: err.message}));

        if (request.type === 'method') Promise.resolve(device[request.method].apply(device, request.args))
            .then((data) => {
                debug(data);
                return ({status: 'success', data: data});

            })
            .then(fn)
            .catch((err) => fn({status: 'error', error: err.message}));
    });

    socket.on('disconnect', function () {
        debug('stopping socket.io client');
    });

    socket.on('error', console.error.bind(console)); // see if we emit instead

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

