/**
 * Created by qcabrol on 9/26/16.
 */
"use strict"
const Serial = require("./SerialDevices");
const SerialQManager = require("./SerialQueueManager");
const debug = require("debug")('main:openspectro');
//const PouchDB = require("pouchdb");


class openSpectro /*extends EventEmitter*/ { //issue with extends EventEmitter
    constructor(id) {
        this.id=id;
        this._ready=false;
        this.serialQ = {};// new SerialQManager();
        this.db = {};
        this._init=this.openspectroInit(id);
    }

    openspectroInit(id){
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
                    if(db) {
                        this.db = db;
                        this._ready=true;
                        debug('openspectro device ready');
                    }
                    else throw new Error('no db for device ', id);
                }).catch((err)=>{
                debug(err);
                this._scheduleInit(id);
            });
        }

    //here we clear the timeout if already existing, avoid multiple instances of serialportinit running in parallel
    _scheduleInit(id){
        if(this.initTimeout){
            clearTimeout(this.initTimeout) //core of the solution
        }
        this.initTimeout= setTimeout(()=> {
            this.openspectroInit(id)
        }, 2000);
    }


    _notReady(){
        debug('openspectro no ready or not existing device', this.id);
    }


    /********************************
     *      User utililties
     ********************************/

    getHelp() {
        if (this._ready) this.serialQ.addRequest('h').then((buff)=>debug(buff));
        else this._notReady();
    }

    getSettings() {
        if (this._ready) this.serialQ.addRequest('s').then((buff)=>debug(buff));
        else this._notReady();
    }

    getEpoch() {
        if (this._ready) this.serialQ.addRequest('e').then((buff)=>debug(buff)); //buffer is accessible here
        else this._notReady();
    }

    getFreeMem() {
        if (this._ready) this.serialQ.addRequest('f').then((buff)=>debug(buff));
        else this._notReady();
    }

    getQualifier() {
        if (this._ready) this.serialQ.addRequest('q').then((buff)=>debug('qualifier :', buff));
        else this._notReady();
    }

    getEEPROM() {
        if (this._ready) this.serialQ.addRequest('z',{timeout: 3000}).then((buff)=>debug('eeprom :',buff));
        else this._notReady();
    }

    initializeParameters() {
        if (this._ready) this.serialQ.addRequest('i').then((buff)=>debug(buff));
        else this._notReady();
    }

    //careful, the data acquisition on the openspectro require time, sending to many requests can overfill the queue
    //request exceeding maxQueue length will be disregarded
    getRGB() {
        if (this._ready) this.serialQ.addRequest('a',{timeout: 15000}).then((buff)=>debug('rgb data: ', buff));
        else this._notReady();
    }


    testAll() {
        if (this._ready) this.serialQ.addRequest('t',{timeout: 15000}).then((buff)=>debug('test all: ', buff));
        else this._notReady();
    }

    runExperiment() {
        if (this._ready) this.serialQ.addRequest('r',{timeout: 15000}).then((buff)=>debug('experiment results: ', buff));
        else this._notReady();
    }

    calibrate() {
        if (this._ready) this.serialQ.addRequest('c',{timeout: 2000}).then((buff)=>debug(buff));
        else this._notReady();
    }

     //start experiment acquisition with command 'r' and log in the dedicated database
     //runExperimentAndLog(){}
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
        spectro = new openSpectro(21296);
    }

    spectro.testAll();
    /*
     for (let key in bioreactorQManagers) {
     if (bioreactorQManagers[key].ready) {
     _readCommand(bioreactorQManagers[key], 'a').then(function (buffer) {
     console.log('qualifier is :' + buffer);
     }).catch(function (err) {
     console.log('getQualifier error' + err);
     });
     }
     }*/

}, 2000);


module.exports = openSpectro;