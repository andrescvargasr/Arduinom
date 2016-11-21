'use strict';
var WebSocketServer = require('ws').Server;
var express = require('express');
var path = require('path');
var http = require('http');

//need to add event listeners here

console.log('Accelerometer created');

var app = express();
var server = http.createServer(app);
app.use(express.static(path.join(__dirname, '/public')));
server.listen(8080);

var wss = new WebSocketServer({server: server});
wss.on('connection', function (ws) {
  var id = setInterval(function () {
    ws.send(JSON.stringify(Math.random()), function () { /* ignore errors */ });
  }, 100);
  console.log('started client interval');
  ws.on('close', function () {
    console.log('stopping client interval');
    clearInterval(id);
  });
});
