'use strict';
process.on('unhandledRejection', e => {
    throw e;
});
const AbstractDevice = require('../AbstractDevice');
const debug = require('debug')('arduimon:main:openspectro');
const deviceInformation = require('./deviceInformation');
const parse = require('open-spectro').parse;

class OpenSpectro extends AbstractDevice { //issue with extends EventEmitter
    constructor(id) {
        super(id);
        this.deviceInformation = deviceInformation;
    }


    async calibrate() {
        return this.addRequest('c', {timeout: 5000});
    }

    /*
     * Set the delay for changing the sample in seconds
     */
    async setExperimentDelay(delay) {
        let newDelay = await this.addRequest('I' + delay);
        return newDelay;
    }

    async getExperimentDelay() {
        let delay = await this.addRequest('I');
        return delay;
    }

    /*
     Be careful, the data acquisition on the openspectro requires time,
     sending to many requests can overfill the queue
     request exceeding maxQueue length will be disregarded
     */
    getRGB() {
        return this.addRequest('a', {timeout: 5000});
    }


    testAllColors() {
        return this.addRequest('t', {timeout: 5000});
    }

    async testAndParseAllColors() {
        const result = await this.testAllColors();
        return parse(result);
    }

    async runExperiment() {
        const delay = this.addRequest('I', {timeout: 500});
        debug('experiment delay in ms :', parseInt(delay));
        return this.addRequest('r', {timeout: (parseInt(delay) * 1000 + 5000)});
    }

    async runAndParseExperiment() {
        const result = await this.runExperiment();
        return parse(result);
    }

}

module.exports = OpenSpectro;
