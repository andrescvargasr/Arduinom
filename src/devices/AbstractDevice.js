'use strict';
var util = require('../utilities/util');
const EventEmitter = require('events');
const Handler = require('./DeviceManager');
const debug = require('debug')('main:abstractDevice');
const parser = require('../utilities/parser');


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
        this.status = 'connect';
    }

    static getParamConfig() {
        throw new Error('getParamConfig not implemented');
    }


    //private methods
    _init() {
        Handler.on('connect', id => {
            if (this.id === id) {
                this.status = 'connect';
                debug('Device connected, enabling methods: ' + this.id);
                this.emit('connect');
            }
        });

        Handler.on('disconnect', id => {
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
        return this.addRequest('h\n');
    }

    getFreeMem() {
        return this.addRequest('f\n');
    }

    getQualifier() {
        return this.addRequest('q\n');
    }

    getEEPROM() {
        return this.addRequest('z\n', {timeout: 500});
    }

    getSettings() {
        this.addRequest('s\n');
    }

    getCompactLog() {
        return this.addRequest('c\n');
    }

    // Time utilities
    getEpoch() {
        return this.addRequest('e\n');
    }

    setEpoch(time) {
        var cmd = 'e' + time + '\n';
        return this.addRequest(cmd);
    }

    setEpochNow() {
        debug('setting epoch to unix time');
        var time = Math.floor(Date.now() / 1000);
        return this.setEpoch(time);
    }

}

module.exports = AbstractDevice;
