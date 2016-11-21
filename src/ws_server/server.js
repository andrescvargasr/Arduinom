'use strict';
var WebSocketServer = require('ws').Server;
var express = require('express');
var path = require('path');
var http = require('http');
var deviceLister=require('./deviceLister');

var app = express();
var server = http.createServer(app);
app.use(express.static(path.join(__dirname, '/public')));
server.listen(8080);

//init webserver
var wss = new WebSocketServer({server: server});
wss.on('connection', function (ws) {
  //setListeners();
  var id = setInterval(function () {
    ws.send(JSON.stringify(Math.random()), function () { /* ignore errors */ });
  }, 100);
  console.log('started client interval');
  ws.on('close', function () {
    console.log('stopping client interval');
    clearInterval(id);
    //clearListeners();
  });
});


/*
function setListeners(){
  deviceLister.on('update', ()=>{});
} // deviceLister is not exporting anything but the device table !!! not ok to define listeners in this state

function setListeners(){
  deviceLister.off('update');
}*/