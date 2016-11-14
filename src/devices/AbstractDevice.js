'use strict';
var util = require('../util');
const EventEmitter = require('events');
const Handler = require('./../DeviceManager');
const debug = require('debug')('main:abstractDevice');
const parser = require('./../parser');
const pouch = require('./../pouch');


class AbstractDevice extends EventEmitter {

    constructor(id) {
        super();
        var qualifierReg = /^([\x21-\x7A])([\x21-\x7A])$/;
        var idString = util.deviceIdNumberToString(id);
        var m = qualifierReg.exec(idString);
        if (!m) {
            debug('The id did not match the regex. Id was: ' + idString);
            throw new Error('Invalid device id');
        }
        this._init();
        this.id = id;
        this.pending = false; //flag to check if an experiment is currently running
    }

    static getParamConfig() {
        throw new Error('getParamConfig not implemented');
    }

    logInPouch(data, options) {
            for (let i = 0; i < data.length; i++) {
                pouch.saveToSerialData(data[i],options)
            }
   }

    _init() {
        Handler.on('connect', id => {
            if (this.id === id) {
                debug('Device connected, enabling methods: ' + this.id);
                this.emit('connect');
            }
        });

        Handler.on('disconnect', id => {
            if (this.id === id) {
                debug('Device disconnected, disabling methods: ' + this.id);
                this.emit('disconnect');
            }
        });
    }

    addRequest(cmd, options) {
        //check here that the command does match the expected standard
        if (!parser.parseCommand(cmd)) return Promise.reject(new Error('Invalid command. Command was:' + JSON.stringify(cmd)));
        if (this.pending) return this._pendingExperiment();
        debug('adding a new request to queue via abstract device class');
        return Promise.resolve().then(()=> {
            var serialQ = Handler.getSerialQ(this.id);
            return serialQ.addRequest(cmd, options);
        });
    }

    //safety to prevent command of being received while an slow experiment is running
    _pendingExperiment() {
        debug('rejected request, wait for completion of the experiment running on device  :', this.id);
        return Promise.reject(new Error('rejected request, wait for completion of the experiment running on openspectro :' + this.id));
    }

    // Device utilities
    getHelp() {
        return this.addRequest('h');
    }

    getFreeMem() {
        return this.addRequest('f');
    }

    getQualifier() {
        return this.addRequest('q');
    }

    getEEPROM() {
        return this.addRequest('z', {timeout: 500});
    }

    getSettings() {
        this.addRequest('s');
    }

    getCompactLog() {
        return this.addRequest('c');
    }

    // Time utilities
    getEpoch() {
        return this.addRequest('e');
    }

    setEpoch(time) {
        var cmd = 'e' + time;
        return this.addRequest(cmd);
    }

    setEpochNow() {
        debug('setting epoch to unix time');
        var time = Date.now();
        return this.setEpoch(time); //buffer is accessible here
    }

}

module.exports = AbstractDevice;
