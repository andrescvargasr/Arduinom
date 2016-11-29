"use strict";

const EventEmitter = require('events');
class Common extends EventEmitter {
    constructor(id, socket) {
        super();
        this.id = id;
        this.socket = socket;
        this._init = this._setListeners();
    }

    _setListeners() {
        this.socket.on('deviceConnected', id=> {
            console.log('client connect event', id, this.id);
            if (id === this.id) this._available();
        });

        this.socket.on('deviceDisconnected', id=> {
            console.log('client connect event', id, this.id);
            if (id === this.id) this._unavailable();
        });

        this.socket.on('disconnect', this._serverLost);
    }

    //no event on server crash !!!
    _serverLost(){
        this.status='serverLost';
        this.emit('serverLost');
    }

    _available() {
        this.status='connect';
        this.emit('connect');
    }

    _unavailable() {
        console.log('disconnected server');
        this.status='disconnect';
        this.emit('disconnect');
    }
}

module.exports = Common;