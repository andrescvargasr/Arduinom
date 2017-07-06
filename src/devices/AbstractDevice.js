'use strict';
var util = require('../utilities/util');
const EventEmitter = require('events');
const deviceManagerInstance = require('./DeviceManager');
const debug = require('debug')('arduimon:main:abstractDevice');
const parser = require('../utilities/parser');

class AbstractDevice extends EventEmitter {

    constructor(id) {
        super();
        var idString = util.deviceIdNumberToString(id);
        if (!idString.match(/^([\x21-\x7A])([\x21-\x7A])$/)) {
            debug('The id did not match the regex. Id was: ' + idString);
            throw new Error('Invalid device id');
        }
        this._init();
        this.id = id;
        // TODO: Is this necessary ? Then it should be a boolean I think
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

    get numberParameters() {
        return this.deviceInformation.numberParameters;
    }

    get type() {
        return this.deviceInformation.type;
    }

    //public methods
    async addRequest(cmd, options) {
        //check here that the command does match the expected standard
        if (!isCommandValid(cmd)) {
            return Promise.reject(new Error('Invalid command. Command was:' + JSON.stringify(cmd)));
        }
        debug('adding a new request to queue via abstract device class');
        var result = await deviceManagerInstance.addRequest(this.id, cmd + '\n', options);
        return result.replace(/[\r\n]*$/, '');
    }

    getDeviceInformation() {
        return this.deviceInformation;
    }

    getNumberLogParameters() {
        return this.getDeviceInformation().numberLogParameters;
    }

    getFactor(label) {
        for (var parameter of this.deviceInformation.parameters) {
            if (label === parameter.label) {
                return parameter.factor || 1;
            }
        }
        return 1;
    }

    setParameter(param, value) {
        return this.addRequest(param + value).then((buffer) => {
            if (buffer === value.toString()) {
                debug('written:', buffer);
                return buffer;
            } else {
                debug('error writing the parameter:', buffer);
                return Promise.reject('Parameter may not have been written');
            }
        });
    }

    async getParameter(parameter) {
        return this.addRequest(parameter);
    }

    // we take into account conversion factor
    async getParameterValue(label) {
        return (await this.addRequest(label)) / this.getFactor(label);
    }


    // Device utilities
    getHelp() {
        return this.addRequest('h');
    }

    getSettings() {
        return this.addRequest('s');
    }

    getFreeMemory() {
        return this.addRequest('uf');
    }

    getQualifier() {
        return this.addRequest('uq');
    }

    getEEPROM() {
        return this.addRequest('uz');
    }

    getCompactSettings() {
        return this.addRequest('uc');
    }

    async getFormattedSettings() {
        var settings = await this.getCompactSettings();
        return parser.parseCompactLog(settings, this.numberParameters);
    }

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
