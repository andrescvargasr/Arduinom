'use strict';
process.on('unhandledRejection', e => {
    throw e;
});
const AbstractDevice = require('./../AbstractDevice');
const debug = require('debug')('main:OpenBio');
const paramConfig = require('./bioParam');
const parser = require('./../../parser');
const deepcopy = require('deepcopy');


class OpenBio extends AbstractDevice { //issue with extends EventEmitter
    constructor(id) {
        super(id);
        this.deviceType = 'bioreactor';
        this.maxParam = 52;
        this.paramInfo = deepcopy(paramConfig);
    }

    static getParamConfig() {
        return deepcopy(paramConfig);
    }

    // Device specific utililties
    getParsedCompactLog() {
        var that = this;
        return this.getCompactLog()
            .then((buff)=> {
                debug('parsing compact log');
                return parser.parse('c', buff, {devicetype: this.deviceType, nbParamCompact: that.maxParam})[0];
            });
    }

    getLastLog() {
        return this.addRequest('l');
    }

    getLastEntryID() {
        return this.addRequest('m');
    }

    getI2C() {
        return this.addRequest('i');
    }

    getOneWire() {
        return this.addRequest('o');
    }

    getMultiLog(entry) {
        if(entry === undefined) {
            var cmd = 'm';
        } else {
            cmd = 'm' + entry;
        }
        if(!parser.parseCommand(cmd)) {
            throw new Error('Invalid entry');
        }
        return this.addRequest(cmd);
    }


    /*
     getMultiLog(entry) {
     return pouchDB.addPouchEntry(this.db, buff, cmd, {
     devicetype: 'bioreactor',
     deviceID: this.id,
     nbParamCompact: this.maxParam,
     nbParam: this.maxParam
     });
     });
     else return this._notReady();
     }
     */

    setParameter(param, value) {
        var command = param + value;
        if (!parser.parseCommand(command)) {
            debug('command does not match expected format A-AZ + value, no parameter set');
            return Promise.reject(new Error('Command does not match the expected format'));
        } else {
            return this.addRequest(param + value).then((buff)=> {
                if (buff === value.toString()) {
                    debug('written:', buff);
                    return buff;
                } else {
                    debug('error writing to param:', buff);
                    return Promise.reject('Param may not have been written');
                }
            });
        }
    }
}

module.exports = OpenBio;
