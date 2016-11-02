"use strict";
process.on('unhandledRejection', e => {
    throw e
});
const AbstractDevice = require("./../AbstractDevice");
const debug = require("debug")('main:openspectro');
const pouchDB = require("./../../pouch");
const paramConfig = require("./spectroParam");

class OpenSpectro extends AbstractDevice { //issue with extends EventEmitter
    constructor(id) {
        super(id);
        this.paramInfo = paramConfig;
    }

    _pendingExperiment() {
        debug('rejected request, wait for completion of the experiment running on openspectro :', this.id);
        return Promise.reject(new Error('rejected request, wait for completion of the experiment running on openspectro :' + this.id));
    }

    /********************************
     *      User utililties
     ********************************/

    getHelp() {
        if (!this.pending) this.addRequest('h').then((buff)=>debug(buff));
        else return this._pendingExperiment();
    }

    getSettings() {
        if (!this.pending) this.addRequest('s').then((buff)=> {
            debug(buff);
        });
        else return this._pendingExperiment();
    }

    getEpoch() {
        if (!this.pending) this.addRequest('e').then((buff)=>debug(buff)); //buffer is accessible here
        else return this._pendingExperiment();
    }

    getFreeMem() {
        if (!this.pending) this.addRequest('f').then((buff)=>debug(buff));
        else return this._pendingExperiment();
    }

    getQualifier() {
        if (!this.pending) this.addRequest('q').then((buff)=>debug('qualifier :', buff));
        else return this._pendingExperiment();
    }

    getEEPROM() {
        if (!this.pending) this.addRequest('z', {timeout: 3000}).then((buff)=>debug('eeprom :', buff));
        else return this._pendingExperiment();
    }

    initializeParameters() {
        if (!this.pending) this.addRequest('i').then((buff)=>debug(buff));
        else return this._pendingExperiment();
    }

    //careful, the data acquisition on the openspectro require time, sending to many requests can overfill the queue
    //request exceeding maxQueue length will be disregarded
    getRGB() {
        if (!this.pending) {
            this.pending = true;
            this.addRequest('a', {timeout: 5000}).then((buff)=> {
                this.pending = false;
                debug('rgb data: ', buff)
            });
        }
        else return this._pendingExperiment();
    }


    testAll() {
        if (!this.pending) {
            this.pending = true;
            this.addRequest('t', {timeout: 5000}).then((buff)=> {
                this.pending = false;
                debug('test all: ', buff);
            });
        }
        else return this._pendingExperiment();
    }

    runExperiment(title, description) {
        if (this.pending) return this._pendingExperiment();
        else if (!this._ready) return this._notReady();
        else {
            this.pending = true;
            return this.addRequest('I', {timeout: 500})
                .then((delay)=> {
                    debug('experiment delay in ms :', parseInt(delay));
                    return this.addRequest('r', {timeout: (parseInt(delay) * 1000 + 5000)});
                })
                .then((buff)=> {
                    this.pending = false;
                    debug('openspectro experiment results received');
                    return pouchDB.parseAndSaveToSerialData(buff, 'r', {
                        devicetype: 'openspectro',
                        deviceID: this.id,
                        title: title,
                        description: description
                    });
                });
        }

    }
/*
    getExperimentResults() {
        return pouchDB.getPouchEntriesSerialData({devicetype: 'openspectro', deviceID: this.id});
    }
*/
    calibrate() {
        if (!this.pending) this.addRequest('c', {timeout: 500}).then((buff)=>debug(buff));
        else return this._pendingExperiment();
    }


}


module.exports = OpenSpectro;