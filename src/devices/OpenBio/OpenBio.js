'use strict';
const AbstractDevice = require('../AbstractDevice');
const debug = require('debug')('arduimon:main:OpenBio');
const deviceInformation = require('./deviceInformation');
const parser = require('../../utilities/parser');


class OpenBio extends AbstractDevice {
    constructor(id) {
        super(id);
        this.deviceInformation=deviceInformation;
    }

    getI2C() {
        return this.addRequest('i');
    }

    getOneWire() {
        return this.addRequest('o');
    }

    getLastLog() {
        return this.addRequest('ll');
    }

    getLastEntryID() {
        return this.addRequest('lm');
    }

    getMultiLog(entry) {
        var cmd = 'lm' + ((entry === undefined) ? '' : entry);
        return this.addRequest(cmd);
    }

    async getParsedMultiLog(entry) {
        var buffer=await this.getMultiLog(entry);
        debug('Parsing MultiLog');
        return parser.parseMultiLog(buffer, {
            numberLogParameters: this.getNumberLogParameters()
        });
    }

    async dbParsedMultiLog(entry) {
        var entries = await this.getParsedMultiLog(entry);
        return entries.map( e => {
            let newEntry={};

            return newEntry;
        })
    }

}

module.exports = OpenBio;

