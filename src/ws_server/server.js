/**
 * Created by qcabrol on 11/23/16.
 */
'use strict';
var WebSocketServer = require('ws').Server;
var express = require('express');
var path = require('path');
var http = require('http');

var deviceLister = require('./deviceLister'); //move to other file ?

var app = express();
var server = http.createServer(app);

app.use(express.static(path.join(__dirname, '../public')));
server.listen(8080);

var wss = new WebSocketServer({server: server});
wss.on('connection', function (ws) {
  setListeners(ws);
  console.log('started ws client');
  ws.on('close', function () {
    console.log('stopping ws client');
    clearListeners ();
  });


});

//need to add broadcast methods for some of the events ?


function setListeners(ws) {
  deviceLister.on('update', (array)=> {
    console.log(array);
    ws.send(JSON.stringify(array)/*, function ack(err){
      console.log('error on ws send', err.message)
    }*/);
  });
}
function clearListeners() {
  deviceLister.removeAllListeners('update');
}