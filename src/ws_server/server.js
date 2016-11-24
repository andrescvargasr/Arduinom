const express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3000);

app.use(express.static('src/public'));

io.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
        console.log(data);
    });
});


var path = require('path');
var DeviceFactory = require("../devices/DeviceFactory");

// Emit welcome message on connection
io.on('connection', function (socket) {
    console.log('connection')
    // Use socket to communicate with this particular client only, sending it it's own id
    setListeners(io);
    socket.emit('welcome', {message: 'Welcome!', id: socket.id});
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
