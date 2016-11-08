'use strict';
process.on('unhandledRejection', e => {
    throw e;
});
const AbstractDevice = require('./../AbstractDevice');
const debug = require('debug')('main:OpenBio');
const paramConfig = require('./bioParam');
const parser = require('./../../parser');


class OpenBio extends AbstractDevice { //issue with extends EventEmitter
    constructor(id) {
        super(id);
        this.deviceType = 'bioreactor';
        this.maxParam = 52;
        this.paramInfo = paramConfig;
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
        return this.addRequest('l')
            .then((buff)=> {
                return buff;
            });
    }

    getLastEntryID() {
        return this.addRequest('m').then((buff)=> {
            return buff;
        });
    }

    getI2C() {
        return this.addRequest('i').then((buff)=> {
            return buff;
        });
    }

    getOneWire() {
        return this.addRequest('o').then((buff)=> {
            return buff;
        });
    }

    getMultiLog(entry) {
        var commandReg = /^(\d+)?\s*$/; //command input must be 1 or 2 capital letters or 1 non capital letter followed or not by a number
        var m = commandReg.exec(entry);
        var cmd = 'm' + (m[1] - 10);
        return this.addRequest(cmd).then((buff)=> {
            return buff;
        });
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
                }            else {
                    debug('error writing to param:', buff);
                    return buff; //throw an error here ?
                }

            });
        }
    }
}

module.exports = OpenBio;
