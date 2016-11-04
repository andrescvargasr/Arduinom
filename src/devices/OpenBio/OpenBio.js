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
     *   Device specific utililties
     ********************************/
    getParsedCompactLog() {
        var that = this;
        return this.getCompactLog()
            .then((buff)=> {
                debug('parsing compact log');
                return parser.parse('c', buff, {devicetype: 'bioreactor', nbParamCompact: that.maxParam})[0];
            })
    }

    getLastLog() {
        this.addRequest('l')
            .then((buff)=>{return buff;});
    }

    getI2C() {
        return this.addRequest('i').then((buff)=>{return buff;});
    }

    getOneWire() {
        this.addRequest('o').then((buff)=>{return buff;});
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
                return buff;
            }
            else {
                debug('error writing to param:', buff);
                return buff; //throw an error here ?
            }

        });
    }
}

module.exports = OpenBio;