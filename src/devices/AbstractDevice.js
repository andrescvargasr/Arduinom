'use strict';

const EventEmitter = require("events");
const Serial = require("./../SerialDevices");
//const SerialQManager = require("./../SerialQueueManager");
const debug = require("debug")('main:abstractDevice');
//const pouchDB = require("./../pouch");
//const util = require("./../util");

class AbstractDevice extends EventEmitter {

    constructor(id) {
        super();
        this._init(id)
        this.id = id;
    }

    _init(id) {
        Serial.refreshDevices({manufacturer: 'Arduino_LLC'}, {
            init: 'q',
            endString: '\r\n\r\n'
        })
            .then(() => {
                debug('devices refreshed');
                return Serial.getSerialQ(id);
            })
            .then(Q => {
                if (Q) this.serialQ = Q;
                else throw new Error('no serialQ for device ', id);
            })
            .then(() => {
                return Serial.getDB(id);
            })
            .then(db => {
                this.resurrectDevice(db);
            })
            .catch((err)=> {
                debug(err);
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
    resurrectDevice(db) {
        var id = this.id;
        if (db) {
            this.db = db;
            this._ready = true;
            this.emit('ready', id);
            debug('device ready');
            this.serialQ.on('close', this._closeListener);
            this.serialQ.on('reinitialized', this._reinitListener);
            this.serialQ.on('disconnect', this._disconnectListener);
            this.serialQ.on('error', this._errorListener);
            this.serialQ.on('open', this._openListener);
        }
        else throw new Error('no db for device ', id);
    }

    disableDevice() {
        this.serialQ={} //removing reference to serialQ
        this._ready = false;
        this.serialQ.off('close', this._closeListener);
        this.serialQ.off('reinitialized', this._reinitListener);
        this.serialQ.off('disconnect', this._disconnectListener);
        this.serialQ.off('error', this._errorListener);
        this.serialQ.off('open', this._openListener);
    }

}

module.exports = AbstractDevice;