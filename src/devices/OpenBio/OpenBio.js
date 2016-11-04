"use strict";
process.on('unhandledRejection', e => {
    throw e
});
const AbstractDevice = require("./../AbstractDevice");
const debug = require("debug")('main:OpenBio');
const pouchDB = require("./../../pouch");
const paramConfig = require("./bioParam");
const parser = require("./../../parser");


class OpenBio extends AbstractDevice { //issue with extends EventEmitter
    constructor(id) {
        super(id);
        this.maxParam = 52;
        this.paramInfo = paramConfig;
    }


    /********************************
     *      User utililties
     ********************************/
    getCompactLog() {
        return this.addRequest('c').then((buff)=> {
            debug('getting compact Log');
            return buff;
        });
    }

    getParsedCompactLog() {
        var that = this;
        return this.getCompactLog()
            .then((buff)=> {
                debug('parsing compact log');
                return parser.parse('c', buff, {devicetype: 'bioreactor', nbParamCompact: that.maxParam})[0];
            })
    }

    getHelp() {
        this.addRequest('h')
            .then((buff)=>debug(buff));
    }

    getLastLog() {
        this.addRequest('l')
            .then((buff)=>debug(buff));
    }

    /*
     getMultiLog(entry) {
     var cmd = 'm' + entry;
     if (this._ready) this.addRequest(cmd).then(
     (buff)=> {
     debug('openspectro experiment results received');
     debug(buff);
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
    getI2C() {
        return this.addRequest('i').then((buff)=>debug(buff));

    }

    getOneWire() {
        this.addRequest('o').then((buff)=>debug(buff));

    }

    getSettings() {
        this.addRequest('s').then((buff)=>debug(buff));

    }

    getEpoch() {
        this.addRequest('e').then((buff)=>debug(buff)); //buffer is accessible here
    }

    getFreeMem() {
        this.addRequest('f').then((buff)=>debug(buff));
    }

    getQualifier() {
        this.addRequest('q').then((buff)=>debug('qualifier :', buff));
    }

    getEEPROM() {
        this.addRequest('z').then((buff)=>debug('eeprom :', buff));
    }

    setParameter(param, value) {
        var commandReg = /^([A-Z]{1,2})(\d+)?$/;
        var m = commandReg.exec(param + value);
        if (!m) {
            debug('command does not match expected format A-AZ + value, no parameter set');
            return false;
        }
        this.addRequest(param + value).then((buff)=> {
            if (buff === value.toString()) {
                debug('written:', buff);
                return true
            }
            else {
                debug('error writing buffer:', buff);
                return false
            } //throw an error here ?
        });
    }

    setEpoch(epoch) {
        this.addRequest('e' + epoch).then((buff)=>debug('eeprom :', buff));
    }

    setEpochNow() {
        this.setEpoch(Date.now());
    }

}


module.exports = OpenBio;