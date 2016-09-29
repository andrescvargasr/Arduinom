/**
 * Created by qcabrol on 9/26/16.
 */
"use strict"
const Serial = require("./SerialDevices");
const SerialQManager = require("./SerialQueueManager");
const debug = require("debug")('main:openspectro');
const pouchDB = require("./pouch");
const util = require("./util");

class openSpectro /*extends EventEmitter*/ { //issue with extends EventEmitter
    constructor(id) {
        this.id = id;
        this._ready = false;
        this.serialQ = {};// new SerialQManager();
        this.db = {};
        this._init = this.openspectroInit(id);
    }

    openspectroInit(id) {
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
                    debug('openspectro device ready');

                    /*this.serialQ.on('ready', ()=> {

                     });*/
                    this.serialQ.on('close', ()=> {
                        this._ready = false;
                        this.pending = false;
                        debug('disconnected openspectro, experiment interrupted');
                    });
                    this.serialQ.on('reinitialized', ()=> {
                        debug('openspectro reinitialized');
                        this._ready=true;
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
            this.openspectroInit(id)
        }, 5000);
    }


    _notReady() {
        debug('openspectro not ready or not existing device :', this.id);
    }

    _pendingExperiment() {
        debug('rejected request, wait for completion of the experiment running on openspectro :', this.id);
    }

    /********************************
     *      User utililties
     ********************************/

    getHelp() {
        if (this._ready && !this.pending) this.serialQ.addRequest('h').then((buff)=>debug(buff));
        else if (this.pending) this._pendingExperiment();
        else this._notReady();
    }

    getSettings() {
        if (this._ready && !this.pending) this.serialQ.addRequest('s').then((buff)=>debug(buff));
        else if (this.pending) this._pendingExperiment();
        else this._notReady();
    }

    getEpoch() {
        if (this._ready && !this.pending) this.serialQ.addRequest('e').then((buff)=>debug(buff)); //buffer is accessible here
        else if (this.pending) this._pendingExperiment();
        else this._notReady();
    }

    getFreeMem() {
        if (this._ready && !this.pending) this.serialQ.addRequest('f').then((buff)=>debug(buff));
        else if (this.pending) this._pendingExperiment();
        else this._notReady();
    }

    getQualifier() {
        if (this._ready && !this.pending) this.serialQ.addRequest('q').then((buff)=>debug('qualifier :', buff));
        else if (this.pending) this._pendingExperiment();
        else this._notReady();
    }

    getEEPROM() {
        if (this._ready && !this.pending) this.serialQ.addRequest('z', {timeout: 3000}).then((buff)=>debug('eeprom :', buff));
        else if (this.pending) this._pendingExperiment();
        else this._notReady();
    }

    initializeParameters() {
        if (this._ready && !this.pending) this.serialQ.addRequest('i').then((buff)=>debug(buff));
        else if (this.pending) this._pendingExperiment();
        else this._notReady();
    }

    //careful, the data acquisition on the openspectro require time, sending to many requests can overfill the queue
    //request exceeding maxQueue length will be disregarded
    getRGB() {
        if (this._ready && !this.pending) {
            this.pending = true;
            this.serialQ.addRequest('a', {timeout: 5000}).then((buff)=> {
                this.pending = false;
                debug('rgb data: ', buff)
            });
        }
        else if (this.pending) this._pendingExperiment();
        else this._notReady();
    }


    testAll() {
        if (this._ready && !this.pending) {
            this.pending = true;
            this.serialQ.addRequest('t', {timeout: 5000}).then((buff)=> {
                this.pending = false;
                debug('test all: ', buff);
            });
        }
        else if (this.pending) this._pendingExperiment();
        else this._notReady();
    }

    runExperiment() {
        if (this._ready && !this.pending) {
            this.pending = true;
            this.serialQ.addRequest('I', {timeout: 500})
                .then((delay)=> {
                    debug('experiment delay in ms :', parseInt(delay));
                    return this.serialQ.addRequest('r', {timeout: (parseInt(delay) * 1000 + 4000)});
                })
                .then((buff)=> {
                    this.pending = false;
                    debug('openspectro experiment results received');
                    pouchDB.addPouchEntry(this.db.db, buff, 'r', {devicetype: 'openspectro'});
                });
        }
        else if (this.pending) this._pendingExperiment();
        else this._notReady();
    }

    calibrate() {
        if (this._ready && !this.pending) this.serialQ.addRequest('c', {timeout: 500}).then((buff)=>debug(buff));
        else if (this.pending) this._pendingExperiment();
        else this._notReady();
    }


}

/**********************************************************************************
 * This file will have to be separated between pouch related generic functions and
 * device related ones (setEpoch, requireLog, requireMultiLog...)
 **********************************************************************************/
var spectro = {}; //create a device spectro for address 'S0' = 21296
var initialized = false;

//need to add options here for pouchdb eg dbname, adapter, ajax... ++ remove the setinterval
setInterval(()=> {
    if (!initialized) {
        initialized = true;
        spectro = new openSpectro(util.deviceIdStringToNumber('S0'));
    }

    if (spectro._ready) spectro.runExperiment();


}, 5000);


module.exports = openSpectro;