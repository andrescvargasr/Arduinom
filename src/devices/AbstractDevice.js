'use strict';

const EventEmitter = require("events");
const device = require("./../DeviceHandler");
const debug = require("debug")('main:abstractDevice');

class AbstractDevice extends EventEmitter {

    constructor(id) {
        super();
        this._init(id)
        this.id = id;
    }

    _init(id) {
        device.Handler.refreshDevices({manufacturer: 'Arduino_LLC'}, {
            init: 'q',
            endString: '\r\n\r\n'
        })
            .then(() => {
                debug('devices refreshed');
                return device.Handler.getSerialQ(id);
            })
            .then(Q => {
                if (Q!=={}) this.serialQ = Q;
                else throw new Error('no serialQ for device ', id);
            })
            .then(() => {
                this.initDeviceListeners();
            })
            .catch((err)=> {
                debug(err);
                if(this.serialQ!=={})this.disableDeviceListeners();
                this._scheduleInit(id);
            });
    }

    //here we clear the timeout if already existing, avoid multiple instances of serialportinit running in parallel
    _scheduleInit(id) {
        if (this.initTimeout) {
            clearTimeout(this.initTimeout) //core of the solution
        }
        this.initTimeout = setTimeout(()=> {
            this._init(id)
        }, 5000);
    }

    /**********************************
     *          Listeners
     **********************************/
    _closeListener() {
        this._ready = false;
        this.pending = false;
        debug('disconnected device, experiment interrupted');
        this.emit('close', this.id);
    }

    _reinitListener() {
        debug('device reinitialized');
        this._ready = true;
        this.emit('reinitialized', this.id);
    }

    _disconnectListener() {
        this.emit('disconnect', this.id);
    }

    _errorListener(err) {
        this.emit('error', err);
    }

    _openListener() {
        this.emit('open', this.id);
    }


    /*******************************************
     *      Enable or Disable Listeners
     ******************************************/
    initDeviceListeners() {
        var id = this.id;
        this._ready = true;
        this.emit('ready', id);
        debug('device ready');
        this.serialQ.on('close', this._closeListener);
        this.serialQ.on('reinitialized', this._reinitListener);
        this.serialQ.on('disconnect', this._disconnectListener);
        this.serialQ.on('error', this._errorListener);
        this.serialQ.on('open', this._openListener);
    }

    disableDeviceListeners() {
        this._ready = false;
        this.serialQ.off('close', this._closeListener);
        this.serialQ.off('reinitialized', this._reinitListener);
        this.serialQ.off('disconnect', this._disconnectListener);
        this.serialQ.off('error', this._errorListener);
        this.serialQ.off('open', this._openListener);
    }

}

module.exports = AbstractDevice;