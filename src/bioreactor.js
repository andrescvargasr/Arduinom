/**
 * Created by qcabrol on 9/26/16.
 */
"use strict"
const Serial = require("./SerialDevices");
const SerialQManager = require("./SerialQueueManager");
const debug = require("debug")('main:openspectro');
//const pouchDB = require(""./pouch");


class openBioreactor /*extends EventEmitter*/ { //issue with extends EventEmitter
    constructor(id) {
        this.id=id;
        this._ready=false;
        this.serialQ = {};// new SerialQManager();
        this.db = {};
        this._init=this.openBioInit(id);
    }

    openBioInit(id){
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
            this.openBioInit(id)
        }, 5000);
    }


    _notReady(){
        debug('openspectro no ready or not existing device', this.id);
    }


    /********************************
     *      User utililties ---> Need to be redefined for the bioreactor application
     ********************************/

    /*
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
    //runExperimentAndLog(){}*/
}



module.exports = openBioreactor;