'use strict';
process.on('unhandledRejection', e => {
    throw e;
});
const AbstractDevice = require('../AbstractDevice');
const debug = require('debug')('main:openspectro');
const deviceInformation = require('./deviceInformation');

class Solar extends AbstractDevice { //issue with extends EventEmitter
    constructor(id) {
        super(id);
        this.deviceInformation = deviceInformation;
    }


    async getTemperature() {
        return await this.addRequest('A');
    }

    async getLight() {
        return await this.addRequest('B');
    }

    async getPressure() {
        return await this.addRequest('C');
    }

    async getHumidity() {
        return await this.addRequest('D');
    }

}

module.exports = Solar;
