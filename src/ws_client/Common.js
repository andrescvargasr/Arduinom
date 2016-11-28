"use strict";

const EventEmitter = require('events');
class Common extends EventEmitter {
    constructor(id, socket) {
        super();
        this.id = id;
        this.socket = socket;
        this._init = this._setListeners();
        this.statusColor = 'PaleGreen';
    }

    _setListeners() {
        this.socket.on('connect', id=> {
            if (id === this.id) this._available();
        });

        this.socket.on('disconnect', id=> {
            if (id === this.id) this._unavailable();
        })
    }


    _available() {
        this.statusColor = 'PaleGreen';
        this.emit('connected');
    }

    _unavailable() {
        this.statusColor = 'Tomato';
        this.emit('disconnected');
    }

}

module.exports = Common;