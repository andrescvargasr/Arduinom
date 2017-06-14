'use strict';
const debug = require('debug')('arduimon:client:common');
const EventEmitter = require('events');
class Common extends EventEmitter {
    constructor(id, socket) {
        super();
        this.id = id;
        this.socket = socket;
        this._init = this._setListeners();
    }

    setStatus(event) {
        switch (event) {
            case 'connect':
                this.status = 'connect';
                this.emit('connect');
                break;
            case 'disconnect':
                this.status = 'disconnect';
                this.emit('disconnect');
                break;
            case 'serverLost':
                this.status = 'serverLost';
                this.emit('serverLost');
                break;
            case 'serverReconnected':
                this.status = 'disconnect';
                this.emit('serverReconnected');
                break;
            default:
                throw new Error('Unknown status was set');
        }
    }

    _setListeners() {
        this.socket.on('deviceConnected', id=> {
            if (id === this.id) this.setStatus('connect');
        });

        this.socket.on('deviceDisconnected', id=> {
            debug('client connect event', id, this.id);
            if (id === this.id) this.setStatus('disconnect');
        });

        this.socket.on('connect_error', ()=> {
            debug('server was lost');
            this.setStatus('serverLost');
        });

        this.socket.on('reconnect', ()=> {
            debug('server is back');
            this.setStatus('serverReconnected');
        });
    }

}

module.exports = Common;
