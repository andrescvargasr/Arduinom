'use strict';
const AbstractDevice = require('../AbstractDevice');
const debug = require('debug')('main:OpenBio');
const parameters = require('./parameters');
const parser = require('../../utilities/parser');
const deepcopy = require('deepcopy');


class OpenBio extends AbstractDevice {
    constructor(id) {
        super(id);
        this.type = 'OpenBio';
        this.numberParameters = 52;
        this.numberLogParameters = 26;
    }

    // Device specific utilities
    getParsedCompactLog() {
        return this.getCompactSettings().then((buff) => {
            debug('parsing compact log');
            return parser.parseCompactLog(buff, {
                numberParameters: this.numberParameters
            });
        });
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

