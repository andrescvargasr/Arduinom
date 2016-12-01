'use strict';
const Common = require('./Common');
const debug = require('debug')('client: OpenSpectro');

module.exports = function (socket) {

    var methods = ['getParsedCompactLog', 'getLastLog', 'getI2C',
        'compactLogToDB', 'setParameter', 'getDB',
        'autoSetEpoch', 'clearAutoEpoch', 'addRequest', 'getHelp', 'getFreeMem', 'getQualifier', 'getEEPROM',
        'getSettings', 'getCompactLog', 'getEpoch', 'setEpoch', 'setEpochNow'];
    var staticMethods = ['getParamConfig', 'getMaxParam', 'getNbParamLog', 'getDeviceType']

    class OpenSpectro extends Common {
        constructor(id) {
            super(id);
            this.type = 'OpenSpectro';
        }
    }

    addMethods.methods(methods, OpenSpectro, socket);
    addMethods.staticMethods(staticMethods, OpenSpectro, socket);
    return OpenSpectro;
};
