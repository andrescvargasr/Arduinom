'use strict';
var util = require('../utilities/util');
const EventEmitter = require('events');
const deviceManagerInstance = require('./DeviceManager');
const debug = require('debug')('main:abstractDevice');
const deepcopy = require('deepcopy');

class AbstractDevice extends EventEmitter {

    constructor(id) {
        super();
        var idString = util.deviceIdNumberToString(id);
        var parameters=[];
        if (! idString.match(/^([\x21-\x7A])([\x21-\x7A])$/)) {
            debug('The id did not match the regex. Id was: ' + idString);
            throw new Error('Invalid device id');
        }
        this._init();
        this.id = id;
        this.pending = false; //flag to check if an experiment is currently running
        this.status = 'connect';
    }

    //private methods
    _init() {
        deviceManagerInstance.on('connect', id => {
            if (this.id === id) {
                this.status = 'connect';
                debug('Device connected, enabling methods: ' + this.id);
                this.emit('connect');
            }
        });

        deviceManagerInstance.on('disconnect', id => {
            if (this.id === id) {
                this.status = 'disconnect';
                debug('Device disconnected, disabling methods: ' + this.id);
                this.emit('disconnect');
            }
        });
    }

    //public methods
    addRequest(cmd, options) {
        //check here that the command does match the expected standard
        if (!isCommandValid(cmd)) return Promise.reject(new Error('Invalid command. Command was:' + JSON.stringify(cmd)));
        if (this.pending) return this._pendingExperiment();
        debug('adding a new request to queue via abstract device class');
        return deviceManagerInstance.addRequest(this.id, cmd + '\n', options).then(res => res.replace(/[\r\n]*$/, ''));
    }


    //safety to prevent command of being received while an slow experiment is running
    _pendingExperiment() {
        debug('rejected request, wait for completion of the experiment running on device  :', this.id);
        return Promise.reject(new Error('rejected request, wait for completion of the experiment running on openspectro :' + this.id));
    }

    getParameters() {
        return this.parameters;
    }

    setParameter(param, value) {
        return this.addRequest(param + value).then((buff) => {
            if (buff === value.toString()) {
                debug('written:', buff);
                return buff;
            } else {
                debug('error writing to param:', buff);
                return Promise.reject('Param may not have been written');
            }
        });
    }

    getParameter(param) {
        return this.addRequest(param + value).then((buff) => {
            if (buff === value.toString()) {
                debug('written:', buff);
                return buff;
            } else {
                debug('error writing to param:', buff);
                return Promise.reject('Param may not have been written');
            }
        });
    }

    // Device utilities
    getHelp() {
        return this.addRequest('h');
    }

    getSettings() {
        this.addRequest('s');
    }

    getFreeMemory() {
        return this.addRequest('uf');
    }

    getQualifier() {
        return this.addRequest('uq');
    }

    getEEPROM() {
        return this.addRequest('uz', {timeout: 500});
    }

    getCompactSettings() {
        return this.addRequest('uc');
    }

    // Time utilities
    getEpoch() {
        return this.addRequest('ue');
    }

    setEpoch(time) {
        var cmd = 'ue' + time;
        return this.addRequest(cmd);
    }

    setEpochNow() {
        debug('setting epoch to unix time');
        var time = Math.round(Date.now() / 1000);
        return this.setEpoch(time);
    }
}

module.exports = AbstractDevice;

function isCommandValid(cmd) {
    if (cmd.match(/^([A-Z]{1,2}|[a-z]{1,2})\d*$/)) {
        return true;
    } else {
        return false;
    }
}
