'use strict';
const Common = require('./Common');
const addMethods = require('./addMethods');

module.exports = function (socket) {
    class OpenBio extends Common {
        constructor(id) {
            super(id, socket);
            this.type = 'OpenBio';
        }
    }

    var methods = ['getParsedCompactLog', 'getLastLog', 'getLastEntryID', 'getI2C', 'getOneWire', 'getMultiLog',
        'getParsedMultiLog', 'multiLogToDB', 'compactLogToDB', 'setParameter', 'getDB', 'addRequest', 'getHelp',
        'getFreeMem', 'getQualifier', 'getEEPROM', 'getSettings', 'getCompactLog', 'getEpoch', 'setEpoch',
        'setEpochNow'];
    var staticMethods = ['getParamConfig', 'getMaxParam', 'getNbParamLog', 'getDeviceType'];

    addMethods.methods(methods, OpenBio, socket);
    addMethods.staticMethods(staticMethods, OpenBio, socket);
    return OpenBio;
};
