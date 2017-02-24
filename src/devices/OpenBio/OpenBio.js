'use strict';
const AbstractDevice = require('../AbstractDevice');
const debug = require('debug')('main:OpenBio');
const paramConfig = require('./params');
const parser = require('../../utilities/parser');
const deepcopy = require('deepcopy');


class OpenBio extends AbstractDevice {
    constructor(id) {
        super(id);
        this.type = 'OpenBio';
        this.numberParameters = 52;
        this.numberLogParameters = 26;
    }


    static getParamConfig() {
        return deepcopy(paramConfig);
    }

    // Device specific utilities
    getParsedCompactLog() {
        return this.getCompactLog().then((buff) => {
            debug('parsing compact log');
            return parser.parseCompactLog(buff, {
                numberParameters:this.numberParameters
            });
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
        var cmd = 'm' + ((entry === undefined) ? '' : entry);
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

    setParameter(param, value) {
        var command = param + value;
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
    autoSetEpoch(interval = 120) {
        var that = this;
        that.setEpochNow();
        clearInterval(this.autoEpochInterval);
        this.autoEpochInterval = setInterval(() => {
            // is 'this' not correct ?
            that.setEpochNow();
        }, interval * 1000);
    }

    clearAutoEpoch() {
        clearInterval(this.autoEpochInterval);
        this.autoEpochInterval = undefined;
    }
}

module.exports = OpenBio;

