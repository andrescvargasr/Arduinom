"use strict";
process.on('unhandledRejection', e => {
    throw e
});
const AbstractDevice = require("./../AbstractDevice");
const debug = require("debug")('main:openspectro');
const pouchDB = require("./../../pouch");
const paramConfig = require("./spectroParam");
const parser = require("./../../parser");

class OpenSpectro extends AbstractDevice { //issue with extends EventEmitter
    constructor(id) {
        super(id);
        this.maxParam = 26;
        this.paramInfo = paramConfig;
    }

    _pendingExperiment() {
        debug('rejected request, wait for completion of the experiment running on openspectro :', this.id);
        return Promise.reject(new Error('rejected request, wait for completion of the experiment running on openspectro :' + this.id));
    }

    /********************************
     *      User utililties
     ********************************/
    getCompactLog() {
        if (this.pending) return this._pendingExperiment();
        return this.addRequest('c').then((buff)=> {
            debug('getting compact Log');
            return buff;
        });
    }

    getParsedCompactLog() {
        if (this.pending) return this._pendingExperiment();
        var that = this;
        return this.getCompactLog()
            .then((buff)=> {
                debug('parsing compact log');
                return parser.parse('c', buff, {devicetype: 'openspectro', nbParamCompact: that.maxParam})[0];
            })
    }

    getHelp() {
        if (this.pending) return this._pendingExperiment();
        return this.addRequest('h')
            .then((buff)=>debug(buff));
    }


    getSettings() {
        if (this.pending) return this._pendingExperiment();
        return this.addRequest('s').then((buff)=> {
            debug(buff);
        });
    }

    getEpoch() {
        if (this.pending) return this._pendingExperiment();
        return this.addRequest('e').then((buff)=>debug(buff)); //buffer is accessible here
    }

    getFreeMem() {
        if (this.pending) return this._pendingExperiment();
        return this.addRequest('f').then((buff)=>debug(buff));
    }

    getQualifier() {
        if (this.pending) return this._pendingExperiment();
        return this.addRequest('q').then((buff)=>debug('qualifier :', buff));
    }

    getEEPROM() {
        if (this.pending) return this._pendingExperiment();
        return this.addRequest('z', {timeout: 3000}).then((buff)=>debug('eeprom :', buff));
    }

    initializeParameters() {
        if (this.pending) return this._pendingExperiment();
        return this.addRequest('i').then((buff)=>debug(buff));
    }

    //careful, the data acquisition on the openspectro require time, sending to many requests can overfill the queue
    //request exceeding maxQueue length will be disregarded
    getRGB() {
        if (this.pending) return this._pendingExperiment();
        this.pending = true;
        return this.addRequest('a', {timeout: 5000}).then((buff)=> {
            this.pending = false;
            debug('rgb data: ', buff)
        });
    }


    testAll() {
        if (this.pending) return this._pendingExperiment();
        if (this.pending) return this._pendingExperiment();
        this.pending = true;
        return this.addRequest('t', {timeout: 5000}).then((buff)=> {
            this.pending = false;
            debug('test all: ', buff);
        });
    }

    runExperiment(title, description) {
        if (this.pending) return this._pendingExperiment();
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

    /*
     getExperimentResults() {
     return pouchDB.getPouchEntriesSerialData({devicetype: 'openspectro', deviceID: this.id});
     }
     */
    calibrate() {
        return this.addRequest('k', {timeout: 500}).then((buff)=>debug(buff));
    }
}


module.exports = OpenSpectro;