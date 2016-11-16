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
        this.deviceType = OpenBio.getDeviceType();
        this.maxParam = OpenBio.getMaxParam();
        this.paramInfo = OpenBio.getParamConfig();
    }

    static getParamConfig() {
        return deepcopy(paramConfig);
    }

    static getDeviceType(){
        return 'bioreactor';
    }

    static getMaxParam(){
        return 52;
    }

    static getNbParamLog(){
        return 26;
    }
    // Device specific utililties
    getParsedCompactLog() {
        var deviceType=OpenBio.getDeviceType();
        var maxParam=OpenBio.getMaxParam();
        return this.getCompactLog()
            .then((buff)=> {
                debug('parsing compact log');
                return parser.parse('c', buff, {devicetype: deviceType, nbParamCompact: maxParam})[0];
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
        debug('adding multilog request :' +cmd);
        return this.addRequest(cmd);
    }

    getParsedMultiLog(entry) {
        var deviceType=OpenBio.getDeviceType();
        var nbParam=OpenBio.getNbParamLog();
        return this.getMultiLog(entry).then((buff)=> {
            var cmd = 'm' + entry;
            debug('Parsing MultiLog');
            return parser.parse(cmd, buff, {devicetype: deviceType, nbParam: nbParam, hasEvent:true});
        });
    }

    multiLogToDB(entry) {
        var deviceType=OpenBio.getDeviceType();
        var that = this;
        return this.getParsedMultiLog(entry).then((data)=> {
            return that.logInPouch(data, {
                devicetype: deviceType,
                cmd: 'm',
                title: title,
                deviceID: that.id,
                memEntry: entry,
            });
        });
    }

    compacLogToDB() {
        var deviceType=OpenBio.getDeviceType();
        var that = this;
        return this.getParsedCompactLog().then((data)=> {
            return that.logInPouch(data, {
                devicetype: deviceType,
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
        return pouch.getDeviceDB('bioreactors/by_mem', this.id);
    }

    //autoDBLogging every 30sec
    autoDataLogger() {
        this.dbLoggerActive = true;
        var that = this;
        clearTimeout(this.dbLoggerInterval);
        this.dbLoggerInterval = setTimeout(()=> {
            this.getLastEntryID().then((lastId)=> {
                debug('periodic last entry polling on device :' + that.id);
                debug('returned: ' + lastId);
                that.logUntil(lastId);
            }).then(reSchedule, reSchedule);
        }, 30000);
        function reSchedule() {
            if (that.dbLoggerActive) that.autoDataLogger();
        }
    }

    logUntil(end) {
        var that = this;
        var i = 0;
        return getNext();
        function getNext() {
            if (i >= end) return;
            else return pouch.getLastInDB(that.id).then((result)=> {
                if (result.total_rows === 0) {
                    debug('database was empty, starting with m0 command');
                    return that.multiLogToDB(0);
                }
                else {
                    i = result.rows[0].$content.misc.memEntry+1;
                    debug('continue to log data from entry:' +i);
                    return that.multiLogToDB(i);
                }
            }).then(getNext); //get Last in Db  is to be implemented
        }
    }

    stopAutoLog() {
        this.dbLoggerActive = false;
        clearTimeout(this.dbLoggerInterval);
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

