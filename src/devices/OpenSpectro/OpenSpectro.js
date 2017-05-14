'use strict';
process.on('unhandledRejection', e => {
    throw e;
});
const AbstractDevice = require('../AbstractDevice');
const debug = require('debug')('main:openspectro');
const parameters = require('./parameters');
const parser = require('../../utilities/parser');


class OpenSpectro extends AbstractDevice { //issue with extends EventEmitter
    constructor(id) {
        super(id);
        this.type = 'OpenSpectro';
        this.numberParameters = 26;
        this.parameters = parameters;
    }



    // Device specific utilities
    getSettings() {
        var that = this;
        var type = OpenSpectro.getDeviceType();
        return this.getCompactSettings()
            .then((buff) => {
                return parser.parse('c', buff, {devicetype: type, nbParamCompact: that.maxParam})[0];
            });
    }

    calibrate() {
        return this.addRequest('k\n', {timeout: 500});
    }

    initializeParameters() {
        return this.addRequest('i\n');
    }

    //careful, the data acquisition on the openspectro require time, sending to many requests can overfill the queue
    //request exceeding maxQueue length will be disregarded
    getRGB() {
        var getRGB = this.addRequest('a\n', {timeout: 5000}).then((buff) => {
            this.pending = false;
            debug('rgb data: ', buff);
        });
        this.pending = true;
        return getRGB;
    }


    testAll() {
        var testAll = this.addRequest('t\n', {timeout: 5000}).then((buff) => {
            this.pending = false;
            debug('test all: ', buff);
        });
        this.pending = true;
        return testAll;
    }

    runExperiment() {
        var experiment = this.addRequest('I\n', {timeout: 500})
            .then((delay) => {
                debug('experiment delay in ms :', parseInt(delay));
                return this.addRequest('r\n', {timeout: (parseInt(delay) * 1000 + 5000)});
            })
            .then(buff => {
                this.pending = false;
                return buff;
            });
        this.pending = true;
        return experiment;
    }

    runAndParseExperiment() {
        return this.runExperiment()
            .then(buffer => {
                var type = OpenSpectro.getDeviceType();
                return parser.parse('r\n', buffer, {devicetype: type});
            });
    }

}

module.exports = OpenSpectro;
