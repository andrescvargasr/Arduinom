var WebSocketServer = require('ws').Server;
var express = require('express');
var path = require('path');
var http = require('http');

module.exports = function expressServer() {

    var app = express();
    var server = http.createServer(app);
    app.use(express.static(path.join(__dirname, '/public')));
    server.listen(8080);

    var wss = new WebSocketServer({server: server});
    wss.on('connection', function (ws) {
        var intervalID = setInterval(function () {
            ws.send(JSON.stringify(new Date()), function () {});
        }, 1000);
        console.log('started client interval');
        ws.on('close', function () {
            console.log('stopping client interval');
            clearInterval(intervalID);
        });
    });
};
