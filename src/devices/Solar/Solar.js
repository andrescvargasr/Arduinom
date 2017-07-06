'use strict';
process.on('unhandledRejection', e => {
    throw e;
});

const AbstractDevice = require('../AbstractDevice');
const debug = require('debug')('arduimon:main:openspectro');
const deviceInformation = require('./deviceInformation');
const parser = require('../../utilities/parser');

class Solar extends AbstractDevice { //issue with extends EventEmitter
    constructor(id) {
        super(id);
        this.deviceInformation = deviceInformation;
    }


    async getTemperature() {
        return this.getParameterValue('A');
    }

    async getLight() {
        return this.getParameterValue('B');
    }

    async getPressure() {
        return this.getParameterValue('C');
    }

    async getHumidity() {
        return this.getParameterValue('D');
    }

    getLastEntryID() {
        return this.addRequest('m');
    }

    getMultiLog(entry) {
        var cmd = 'm' + ((entry === undefined) ? '' : entry);
        return this.addRequest(cmd);
    }

    async getParsedMultiLog(entry) {
        var buffer = await this.getMultiLog(entry);
        debug('Parsing MultiLog');
        return parser.parseMultiLog(buffer, {
            numberLogParameters: this.getNumberLogParameters(),
            hasEvent: false
        });
    }

}

module.exports = Solar;
