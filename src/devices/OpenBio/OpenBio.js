'use strict';
process.on('unhandledRejection', e => {
    throw e;
});
const AbstractDevice = require('./../AbstractDevice');
const debug = require('debug')('main:OpenBio');
const paramConfig = require('./bioParam');
const parser = require('./../../parser');
const deepcopy = require('deepcopy');
const pouch = require('./../../pouch');


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
                return parser.parse('c', buff, {devicetype: that.deviceType, nbParamCompact: that.maxParam})[0];
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
        if (entry === undefined) {
            var cmd = 'm';
        } else {
            cmd = 'm' + entry;
        }
        if (!parser.parseCommand(cmd)) {
            throw new Error('Invalid entry');
        }
        return this.addRequest(cmd);
    }

    getParsedMultiLog(entry) {
        var that = this;
        return this.getMultiLog(entry).then((buff)=> {
            var cmd = 'm' + entry
            debug('Parsing MultiLog');
            return parser.parse(cmd, buff, {deviceType: that.deviceType, nbParamCompact: that.maxParam})
        });
    }

    multiLogToDB(entry) {
        var that = this;
        return this.getParsedMultiLog(entry).then((data)=> {
            return that.logInPouch(data, {
                devicetype: 'bioreactor',
                cmd: 'm',
                title: title,
                deviceID: that.id,
                memEntry: entry,
            });
        });
    }

    compacLogToDB() {
        var that = this;
        return this.getParsedCompactLog().then((data)=> {
            return that.logInPouch(data, {
                devicetype: 'bioreactor',
                cmd: 'c',
                title: title,
                deviceID: that.id,
            });
        });
    }

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

    //getter
    getDB() {
        return pouch.getDeviceDB('bioreactors/by_id', this.id);
    }

    //autoDBLogging every 30sec
    autoDataLogger() {
        var that = this;
        clearInterval(this.dbLoggerInterval);
        this.dbLoggerInterval = setInterval(()=> {
            this.getLastEntryID().then((lastId)=>{
                //this.getLastEntryInDB().then(()=>{})
            })
            //here poll the last db entry, then compare it to the last flash entry
            //if local entry > then log all the newest in the pouchdb
        }, 30000)
    }

    stopAutoLog() {
        clearInterval(this.dbLoggerInterval);
        this.dbLoggerInterval = undefined;
    }


    //autoEpoch every 2 minutes
    autoSetEpoch() {
        var that = this;
        clearInterval(this.autoEpochInterval);
        this.autoEpochInterval = setInterval(()=> {
               return that.setEpochNow();
            },
            120000);
    }

    clearAutoEpoch() {
        clearInterval(this.autoEpochInterval);
        this.autoEpochInterval = undefined;
    }
}

module.exports = OpenBio;
