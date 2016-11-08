'use strict';
process.on('unhandledRejection', e => {
    throw e;
});
const AbstractDevice = require('./../AbstractDevice');
const debug = require('debug')('main:openspectro');
const pouchDB = require('./../../pouch');
const paramConfig = require('./spectroParam');
const parser = require('./../../parser');

class OpenSpectro extends AbstractDevice { //issue with extends EventEmitter
    constructor(id) {
        super(id);
        this.deviceType = 'openspectro';
        this.maxParam = 26;
        this.paramInfo = paramConfig;
    }

    // Device specific utilities
    getParsedCompactLog() {
        var that = this;
        return this.getCompactLog()
            .then((buff)=> {
                return parser.parse('c', buff, {devicetype: this.deviceType, nbParamCompact: that.maxParam})[0];
            });
    }

    calibrate() {
        return this.addRequest('k', {timeout: 500}).then((buff)=> {
            return buff;
        });
    }

    initializeParameters() {
        return this.addRequest('i').then((buff)=> {
            return buff;
        });
    }

    //careful, the data acquisition on the openspectro require time, sending to many requests can overfill the queue
    //request exceeding maxQueue length will be disregarded
    getRGB() {
        this.pending = true;
        return this.addRequest('a', {timeout: 5000}).then((buff)=> {
            this.pending = false;
            debug('rgb data: ', buff);
        });
    }


    testAll() {
        this.pending = true;
        return this.addRequest('t', {timeout: 5000}).then((buff)=> {
            this.pending = false;
            debug('test all: ', buff);
        });
    }

    runExperiment(title, description) {
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

    /* TO BE IMPLEMENTED
     getLastExperimentResults() {
     return pouchDB.getPouchEntriesSerialData({devicetype: 'openspectro', deviceID: this.id});
     }

     getExperimentResults(name) {
     return pouchDB.getPouchEntriesSerialData({devicetype: 'openspectro', deviceID: this.id});
     }

     getAllExperimentResults() {
     return pouchDB.getPouchEntriesSerialData({devicetype: 'openspectro', deviceID: this.id});
     }

     renameExperiment(oldName, newName) {
     return pouchDB.getPouchEntriesSerialData({devicetype: 'openspectro', deviceID: this.id});
     }
     */
}

module.exports = OpenSpectro;
