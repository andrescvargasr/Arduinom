'use strict';
process.on('unhandledRejection', e => {
    throw e;
});
const AbstractDevice = require('../AbstractDevice');
const debug = require('debug')('main:openspectro');
const paramConfig = require('./spectroParam');
const parser = require('../../utilities/parser');
const deepcopy = require('deepcopy');
const pouch = require('../../pouch');


class OpenSpectro extends AbstractDevice { //issue with extends EventEmitter
    constructor(id) {
        super(id);
        this.deviceType = 'openspectro';
        this.maxParam = 26;
        this.paramConfig = deepcopy(paramConfig);
    }

    static getParamConfig() {
        return deepcopy(paramConfig);
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
        return this.addRequest('k', {timeout: 500});
    }

    initializeParameters() {
        return this.addRequest('i');
    }

    //careful, the data acquisition on the openspectro require time, sending to many requests can overfill the queue
    //request exceeding maxQueue length will be disregarded
    getRGB() {
        var getRGB = this.addRequest('a', {timeout: 5000}).then((buff)=> {
            this.pending = false;
            debug('rgb data: ', buff);
        });
        this.pending = true;
        return getRGB;
    }


    testAll() {
        var testAll = this.addRequest('t', {timeout: 5000}).then((buff)=> {
            this.pending = false;
            debug('test all: ', buff);
        });
        this.pending = true;
        return testAll;
    }

    runExperiment(title, description) {
        var experiment = this.addRequest('I', {timeout: 500})
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
        this.pending = true;
        return experiment;
    }

    runAndParseExperiment() {
        return this.runExperiment()
            .then((experiment)=> {
                return parser.parse('r', experiment, {decicetype: 'openspectro'});
            });
    }

    runAndLogExperiment(title, description) {
        var that = this;
        return this.runAndParseExperiment().then((data)=>{
            return this.logInPouch(data, {
                devicetype: 'openspectro',
                cmd: 'r',
                title: title,
                description: description,
                deviceID: that.id
            });
        });
    }


     getAllExperimentResults() {
        return pouch.getDeviceDB(pouch.mapSpectros,this.id);
     }


    /* TO BE IMPLEMENTED
     renameExperiment(oldName, newName) {
     return pouchDB.getEntriesSerialData({devicetype: 'openspectro', deviceID: this.id});
     }
     */
}

module.exports = OpenSpectro;
