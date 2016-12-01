'use strict';
const Common = require('./Common');
const debug = require('debug')('client: OpenBio');
const addMethods = require('./addMethods');

module.exports = function (socket) {

    var methods = ['getParsedCompactLog', 'getLastLog', 'getLastEntryID', 'getI2C', 'getOneWire', 'getMultiLog',
        'getParsedMultiLog', 'multiLogToDB', 'compactLogToDB', 'setParameter', 'getDB', 'autoDataLogger', 'stopAutoLog',
        'autoSetEpoch', 'clearAutoEpoch', 'addRequest', 'getHelp', 'getFreeMem', 'getQualifier', 'getEEPROM',
        'getSettings', 'getCompactLog', 'getEpoch', 'setEpoch', 'setEpochNow'];

    var staticMethods = ['getParamConfig', 'getMaxParam', 'getNbParamLog', 'getDeviceType'];


    class OpenBio extends Common {
        constructor(id) {
            super(id, socket);
            this.type = 'OpenBio';
        }
    }

    addMethods.methods(methods, OpenBio, socket);
    addMethods.staticMethods(staticMethods, OpenBio, socket);
    return OpenBio;
};
