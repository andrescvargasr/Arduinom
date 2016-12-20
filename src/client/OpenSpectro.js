'use strict';
const Common = require('./Common');
const addMethods = require('./addMethods');

module.exports = function (socket) {

    class OpenSpectro extends Common {
        constructor(id) {
            super(id);
            this.type = 'OpenSpectro';
        }
    }

    var methods = ['getParsedCompactLog', 'getLastLog', 'getI2C',
        'compactLogToDB', 'setParameter', 'getDB',
        'autoSetEpoch', 'clearAutoEpoch', 'addRequest', 'getHelp', 'getFreeMem', 'getQualifier', 'getEEPROM',
        'getSettings', 'getCompactLog', 'getEpoch', 'setEpoch', 'setEpochNow'];
    var staticMethods = ['getParamConfig', 'getMaxParam', 'getNbParamLog', 'getDeviceType'];

    addMethods.methods(methods, OpenSpectro, socket);
    addMethods.staticMethods(staticMethods, OpenSpectro, socket);
    return OpenSpectro;
};
