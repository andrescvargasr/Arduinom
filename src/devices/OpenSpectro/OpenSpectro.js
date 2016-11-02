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

    _notReady() {
        debug('openspectro not ready or not existing device :', this.id);
        return Promise.reject(new Error('openspectro not ready or not existing device :' + this.id));
    }

    _pendingExperiment() {
        debug('rejected request, wait for completion of the experiment running on openspectro :', this.id);
        return Promise.reject(new Error('rejected request, wait for completion of the experiment running on openspectro :' + this.id));
    }

    /********************************
     *      User utililties
     ********************************/

    getHelp() {
        if (this._ready && !this.pending) this.serialQ.addRequest('h').then((buff)=>debug(buff));
        else if (this.pending) return this._pendingExperiment();
        else return this._notReady();
    }

    getSettings() {
        if (this._ready && !this.pending) this.serialQ.addRequest('s').then((buff)=> {
            debug(buff);
        });
        else if (this.pending) return this._pendingExperiment();
        else return this._notReady();
    }

    getEpoch() {
        if (this._ready && !this.pending) this.serialQ.addRequest('e').then((buff)=>debug(buff)); //buffer is accessible here
        else if (this.pending) return this._pendingExperiment();
        else return this._notReady();
    }

    getFreeMem() {
        if (this._ready && !this.pending) this.serialQ.addRequest('f').then((buff)=>debug(buff));
        else if (this.pending) return this._pendingExperiment();
        else return this._notReady();
    }

    getQualifier() {
        if (this._ready && !this.pending) this.serialQ.addRequest('q').then((buff)=>debug('qualifier :', buff));
        else if (this.pending) return this._pendingExperiment();
        else return this._notReady();
    }

    getEEPROM() {
        if (this._ready && !this.pending) this.serialQ.addRequest('z', {timeout: 3000}).then((buff)=>debug('eeprom :', buff));
        else if (this.pending) return this._pendingExperiment();
        else return this._notReady();
    }

    initializeParameters() {
        if (this._ready && !this.pending) this.serialQ.addRequest('i').then((buff)=>debug(buff));
        else if (this.pending) return this._pendingExperiment();
        else return this._notReady();
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
        else if (this.pending) return this._pendingExperiment();
        else return this._notReady();
    }


    testAll() {
        if (this._ready && !this.pending) {
            this.pending = true;
            this.serialQ.addRequest('t', {timeout: 5000}).then((buff)=> {
                this.pending = false;
                debug('test all: ', buff);
            });
        }
        else if (this.pending) return this._pendingExperiment();
        else return this._notReady();
    }

    runExperiment(title, description) {
        if (this.pending) return this._pendingExperiment();
        else if (!this._ready) return this._notReady();
        else {
            this.pending = true;
            return this.serialQ.addRequest('I', {timeout: 500})
                .then((delay)=> {
                    debug('experiment delay in ms :', parseInt(delay));
                    return this.serialQ.addRequest('r', {timeout: (parseInt(delay) * 1000 + 5000)});
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
        if (this._ready && !this.pending) this.serialQ.addRequest('c', {timeout: 500}).then((buff)=>debug(buff));
        else if (this.pending) return this._pendingExperiment();
        else return this._notReady();
    }


}


module.exports = OpenSpectro;