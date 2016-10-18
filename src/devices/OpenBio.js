"use strict";
process.on('unhandledRejection', e => {
    throw e
});
const AbstractDevice = require("./AbstractDevice");
const debug = require("debug")('main:OpenBio');
const pouchDB = require("./../pouch");
const paramConfig = require("./../config/paramInfo/bioParam");
const parser = require("./../parser");


class OpenBio extends AbstractDevice { //issue with extends EventEmitter
    constructor(id) {
        super(id);
        this.maxParam = 52;
        this.paramInfo = paramConfig;
    }


    _notReady() {
        debug('OpenBio not ready or not existing device :', this.id);
        return Promise.reject(new Error('OpenBio not ready or not existing device :' + this.id));
    }

    /********************************
     *      User utililties
     ********************************/


    getCompactLog() {
        if (this._ready) {
            return this.serialQ.addRequest('c').then((buff)=> {
                debug(buff);
                return buff;
            });
        }
        else return this._notReady();
    }


    getParsedCompactLog(){
        var that=this;
        return this.getCompactLog()
            .then((buff)=>{
                return parser.parse('c',buff,{devicetype:'bioreactor', nbParamCompact: that.nbParamCompact});
            })
    }


    getHelp() {
        if (this._ready) this.serialQ.addRequest('h')
            .then((buff)=>debug(buff));
        else return this._notReady();
    }

    getLastLog() {
        if (this._ready) this.serialQ.addRequest('l').then((buff)=>debug(buff));
        else return this._notReady();
    }



    getMultiLog(entry) {
        var cmd = 'm' + entry;
        if (this._ready) this.serialQ.addRequest(cmd).then(
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

    getI2C() {
        if (this._ready) return this.serialQ.addRequest('i').then((buff)=>debug(buff));
        else return this._notReady();
    }

    getOneWire() {
        if (this._ready) this.serialQ.addRequest('o').then((buff)=>debug(buff));
        else return this._notReady();
    }

    getSettings() {
        if (this._ready) this.serialQ.addRequest('s').then((buff)=>debug(buff));
        else return this._notReady();
    }

    getEpoch() {
        if (this._ready) this.serialQ.addRequest('e').then((buff)=>debug(buff)); //buffer is accessible here
        else return this._notReady();
    }

    getFreeMem() {
        if (this._ready) this.serialQ.addRequest('f').then((buff)=>debug(buff));
        else return this._notReady();
    }

    getQualifier() {
        if (this._ready) this.serialQ.addRequest('q').then((buff)=>debug('qualifier :', buff));
        else return this._notReady();
    }

    getEEPROM() {
        if (this._ready) this.serialQ.addRequest('z').then((buff)=>debug('eeprom :', buff));
        else return this._notReady();
    }

    setParameter(param, value) {
        var commandReg = /^([A-Z]{1,2})(\d+)?$/;
        var m = commandReg.exec(param + value);
        if (!m) {
            debug('command does not match expected format A-AZ + value, no parameter set');
            return false;
        }
        if (this._ready) this.serialQ.addRequest(param + value).then((buff)=> {
            if (buff === value.toString()) {
                debug('written:', buff);
                return true
            }
            else {
                debug('error writing buffer:', buff);
                return false
            } //throw an error here ?
        });
        else return this._notReady();
    }

    setEpoch(epoch) {
        if (this._ready) this.serialQ.addRequest('e' + epoch).then((buff)=>debug('eeprom :', buff));
        else return this._notReady();
    }


    setEpochNow() {
        this.setEpoch(Date.now());
    }

}


module.exports = OpenBio;