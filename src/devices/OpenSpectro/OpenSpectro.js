'use strict';
process.on('unhandledRejection', e => {
    throw e;
});
const AbstractDevice = require('../AbstractDevice');
const debug = require('debug')('main:openspectro');
const deviceInformation = require('./deviceInformation');
const parser = require('../../utilities/parser');


class OpenSpectro extends AbstractDevice { //issue with extends EventEmitter
    constructor(id) {
        super(id);
        this.deviceInformation = deviceInformation;
    }


    calibrate() {
        return this.addRequest('k', {timeout: 500});
    }


    /*
     Be careful, the data acquisition on the openspectro requires time,
     sending to many requests can overfill the queue
     request exceeding maxQueue length will be disregarded
     */
    getRGB() {
        var getRGB = this.addRequest('a', {timeout: 5000}).then((buff) => {
            this.pending = false;
            debug('rgb data: ', buff);
        });
        this.pending = true;
        return getRGB;
    }


    testAll() {
        var testAll = this.addRequest('t', {timeout: 5000}).then((buff) => {
            this.pending = false;
            debug('test all: ', buff);
        });
        this.pending = true;
        return testAll;
    }

    runExperiment() {
        var experiment = this.addRequest('I', {timeout: 500})
            .then((delay) => {
                debug('experiment delay in ms :', parseInt(delay));
                console.log(parseInt(delay)*1000+5000);
                return this.addRequest('r', {timeout: (parseInt(delay) * 1000 + 5000)});
            })
            .then(buff => {
                this.pending = false;
                return buff;
            });
        this.pending = true;
        return experiment;
    }
}

module.exports = OpenSpectro;
