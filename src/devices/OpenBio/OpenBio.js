'use strict';
const AbstractDevice = require('../AbstractDevice');
const debug = require('debug')('main:OpenBio');
const deviceInformation = require('./deviceInformation');
const parser = require('../../utilities/parser');
const deepcopy = require('deepcopy');


class OpenBio extends AbstractDevice {
    constructor(id) {
        super(id);
        this.deviceInformation=deviceInformation;
    }

    getLastLog() {
        return this.addRequest('ll');
    }

    getLastEntryID() {
        return this.addRequest('lm');
    }

    getI2C() {
        return this.addRequest('i');
    }

    getOneWire() {
        return this.addRequest('o');
    }

    getMultiLog(entry) {
        var cmd = 'lm' + ((entry === undefined) ? '' : entry);
        return this.addRequest(cmd);
    }

    getParsedMultiLog(entry) {
        return this.getMultiLog(entry).then((buff) => {
            debug('Parsing MultiLog');
            return parser.parseMultiLog(buff, {
                numberLogParameters: this.numberLogParameters
            });
        });
    }

}

module.exports = OpenBio;

