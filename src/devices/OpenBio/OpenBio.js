'use strict';
const AbstractDevice = require('../AbstractDevice');
const debug = require('debug')('main:OpenBio');
const paramConfig = require('./params');
const parser = require('../../utilities/parser');
const deepcopy = require('deepcopy');
const pouch = require('../../pouch');

class OpenBio extends AbstractDevice {
    constructor(id) {
        super(id);
    }

    //static methods
    static getDeviceType() {
        return 'OpenBio';
    }

    static getParamConfig() {
        return deepcopy(paramConfig);
    }

    static getMaxParam() {
        return 52;
    }

    static getNbParamLog() {
        return 26;
    }

    // Device specific utililties
    getParsedCompactLog() {
        var type = OpenBio.getDeviceType();
        var maxParam = OpenBio.getMaxParam();
        return this.getCompactLog()
            .then((buff) => {
                debug('parsing compact log');
                return parser.parseCompactLog(buff, {devicetype: type, nbParamCompact: maxParam});
            });
    }

    getLastLog() {
        return this.addRequest('l\n');
    }

    getLastEntryID() {
        return this.addRequest('m\n');
    }

    getI2C() {
        return this.addRequest('i\n');
    }

    getOneWire() {
        return this.addRequest('o\n');
    }

    getMultiLog(entry) {
        if (entry === undefined) {
            var cmd = 'm';
        } else {
            cmd = 'm' + entry;
        }
        cmd += '\n';
        if (!parser.parseCommand(cmd)) {
            debug('command is :' + JSON.stringify(cmd));
            return new Error('Invalid entry');
        }
        debug('adding multilog request :' + cmd);
        return this.addRequest(cmd);
    }

    getParsedMultiLog(entry) {
        var type = OpenBio.getDeviceType();
        var nbParam = OpenBio.getNbParamLog();
        return this.getMultiLog(entry).then((buff) => {
            var cmd = 'm' + entry;
            debug('Parsing MultiLog');
            return parser.parse(cmd, buff, {devicetype: type, nbParam: nbParam, hasEvent: true});
        });
    }


    multiLogToDB(entry) {
        var type = OpenBio.getDeviceType();
        var that = this;
        return this.getParsedMultiLog(entry).then((data) => {
            var end = data.length;
            debug('memEntry being written to dB: ' + data);
            var i = 0;
            return getNext();
            function getNext() {
                if (i >= end) {
                    return undefined;
                } else {
                    return pouch.saveToSerialData(data[i], {
                        devicetype: type,
                        cmd: 'm',
                        deviceId: that.id,
                        memEntry: data[i].id,
                    }).then(() => {
                        i++;
                    }).then(getNext);
                }
            }
        });
    }


    compactLogToDB() {
        var type = OpenBio.getDeviceType();
        var that = this;
        return this.getParsedCompactLog().then((data) => {
            return pouch.saveToSerialData(data, {
                devicetype: type,
                cmd: 'c',
                deviceId: that.id,
            });
        });
    }

    setParameter(param, value) {
        var command = param + value + '\n';
        if (!parser.parseCommand(command)) {
            debug('command does not match expected format A-AZ + value, no parameter set');
            return Promise.reject(new Error('Command does not match the expected format'));
        } else {
            return this.addRequest(param + value).then((buff) => {
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
        function reSchedule() {
            that.loggerIsRunning = false;
            debug('autodataLog reschedule');
            if (that.dbLoggerTimeout) {
                that.stopAutoLog();
                that.autoDataLogger();
            }
        }

        if (!this.dbLoggerTimeout) {
            var that = this;
            this.dbLoggerTimeout = setTimeout(() => {
                if (!this.loggerIsRunning) {
                    this.loggerIsRunning = true;
                    that.getLastEntryID().then((lastId) => {
                        debug('periodic polling on device :' + that.id);
                        debug('returned: ' + lastId);
                        return that.logUntil(lastId);
                    }).then(reSchedule, reSchedule);
                }
            }, 20000);
        }
    }

    logUntil(end) {
        var that = this;
        var i = 0;
        return getNext();
        function getNext() {
            if (i >= end) {
                that.dbLoggerActive = false;
                return undefined;
            } else {
                return pouch.getLastInDB(Number(that.id)).then((result) => {
                    if (result.total_rows === 0) {
                        debug('database was empty, starting with m0 command');
                        return that.multiLogToDB(0);
                    } else {
                        debug('last memEntry in DB is: ' + result.rows[0].value.id);
                        i = Number(result.rows[0].value.id);
                        debug('continue to log data from entry:' + i);
                        return that.multiLogToDB(i + 1);
                    }
                }).then(getNext);
            } //get Last in Db  is to be implemented
        }
    }

    stopAutoLog() {
        clearTimeout(this.dbLoggerTimeout);
        this.dbLoggerTimeout = undefined;
    }


    //autoEpoch every 2 minutes (make the interval time a argument of the function)
    autoSetEpoch() {
        var that = this;
        that.setEpochNow();
        clearInterval(this.autoEpochInterval);
        this.autoEpochInterval = setInterval(() => {
            return that.setEpochNow();
        }, 120000);
    }

    clearAutoEpoch() {
        clearInterval(this.autoEpochInterval);
        this.autoEpochInterval = undefined;
    }
}

module.exports = OpenBio;

