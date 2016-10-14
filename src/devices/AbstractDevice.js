'use strict';

const EventEmitter = require("events");
const Serial = require("./../SerialDevices");
const SerialQManager = require("./../SerialQueueManager");
const debug = require("debug")('main:openBio');
const pouchDB = require("./../pouch");
const util = require("./../util");

class AbstractDevice extends EventEmitter {

    constructor(id) {
        super();
        this._init(id)
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
                if (db) {
                    this.db = db;
                    this._ready = true;
                    this.emit('ready', id);
                    debug('device device ready');


                    this.serialQ.on('close', ()=> {
                        this._ready = false;
                        this.pending = false;
                        debug('disconnected device, experiment interrupted');
                        this.emit('close', id);
                    });


                    this.serialQ.on('reinitialized', ()=> {
                        debug('device reinitialized');
                        this._ready = true;
                        this.emit('reinitialized', id);
                    });

                    this.serialQ.on('disconnect', ()=> {
                        this.emit('disconnect', id);
                    });

                    this.serialQ.on('error', (err)=> {
                        this.emit('error', err);
                    });

                    this.serialQ.on('open', (err)=> {
                        this.emit('open', id);
                    });

                }
                else throw new Error('no db for device ', id);
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
            this.openBioInit(id)
        }, 5000);
    }

}

module.exports = AbstractDevice;