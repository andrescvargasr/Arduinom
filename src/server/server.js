'use strict';
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const ioDevices = require('./socketio/devices');

server.listen(3000);

app.use(express.static('src/public'));
// Emit welcome message on connection
ioDevices(io);

