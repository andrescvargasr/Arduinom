'use strict';

const path = require('path');
const Koa = require('koa');
const koaStatic = require('koa-static');
const koaCors = require('koa-cors');
const app = new Koa();
const callback = app.callback();
const server = require('http').Server(callback);
const argv = require('minimist')(process.argv.slice(2));
const io = require('socket.io')(server);
const ioDevices = require('./socketio/devices');
const dbRouter = require('./routes/db');

server.listen(3000);

app.use(koaCors());
app.use(dbRouter.routes());
app.use(koaStatic(path.join(__dirname, '../public')));
// Emit welcome message on connection
ioDevices(io);

if (argv['sync-db']) {
    // Launch db sync
    require('../db/sync');
}

