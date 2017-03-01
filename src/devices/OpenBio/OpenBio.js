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
                numberParameters: this.numberParameters
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
        var reSchedule = () => {
            this.loggerIsRunning = false;
            debug('autodataLog reschedule');
            if (this.dbLoggerTimeout) {
                this.stopAutoLog();
                this.autoDataLogger();
            }
        };

        if (!this.dbLoggerTimeout) {
            this.dbLoggerTimeout = setTimeout(() => {
                if (!this.loggerIsRunning) {
                    this.loggerIsRunning = true;
                    this.getLastEntryID().then((lastId) => {
                        debug('periodic polling on device :' + this.id);
                        debug('returned: ' + lastId);
                        return this.logUntil(lastId);
                    }).then(reSchedule, reSchedule);
                }
            }, 20000);
        }
    }


    //autoEpoch every 2 minutes (make the interval time a argument of the function)
    autoSetEpoch(interval = 120) {
        this.setEpochNow();
        clearInterval(this.autoEpochInterval);
        this.autoEpochInterval = setInterval(() => {
            // is 'this' not correct ?
            this.setEpochNow();
        }, interval * 1000);
    }

    clearAutoEpoch() {
        clearInterval(this.autoEpochInterval);
        this.autoEpochInterval = undefined;
    }
}

module.exports = OpenBio;

