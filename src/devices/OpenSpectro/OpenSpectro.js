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

    /**
     * Set the delay for changing the sample in seconds
     * @param delay
     * @returns {Promise}
     */
    async setExperimentDelay(delay) {
        let newDelay = await this.addRequest('I'+delay);
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
    async getRGB() {
        return await this.addRequest('a', {timeout: 5000});
    }


    async testAllColors() {
        return await this.addRequest('t', {timeout: 5000});
    }

    async testAndParseAllColors() {
        var result = await this.testAllColors();
        return parse(result);
    }

    runExperiment() {
        var experiment = this.addRequest('I', {timeout: 500})
            .then((delay) => {
                debug('experiment delay in ms :', parseInt(delay));
                return this.addRequest('r', {timeout: (parseInt(delay) * 1000 + 5000)});
            })
            .then(buff => {
                return buff;
            });
        return experiment;
    }

    async runAndParseExperiment() {
        var result=await this.runExperiment();
        return parse(result);
    }

}

module.exports = OpenSpectro;
