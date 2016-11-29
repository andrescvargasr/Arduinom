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
        this.socket.on('connect', id=> {
            if (id === this.id) this._available();
        });

        this.socket.on('disconnect', id=> {
            if (id === this.id) this._unavailable();
        })
    }

    _available() {
        this.status='connect';
        this.emit('connect');
    }

    _unavailable() {
        this.status='disconnect';
        this.emit('disconnect');
    }
}

module.exports = Common;