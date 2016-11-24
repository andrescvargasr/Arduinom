'use strict';
const EventEmitter = require('events');

class SpectroWrapper extends EventEmitter {
    constructor(id) {
        super();
        this.id = id;
    }
}
 //to be edited according to spectro config
var staticMethods = ['getParamConfig', 'getMaxParam', 'getNbParamLog', 'getDeviceType']
var methods = ['getParsedCompactLog', 'getLastLog', 'getLastEntryID', 'getI2C', 'getOneWire', 'getMultiLog',
    'getParsedMutiLog', 'multiLogToDB', 'compactLogToDB', 'setParameter', 'getDB', 'autoDataLogger', 'stopAutoLog',
    'autoSetEpoch', 'clearAutoEpoch', 'addRequest', 'getHelp', 'getFreeMem', 'getQualifier', 'getEEPROM',
    'getSettings', 'getCompactLog', 'getEpoch', 'setEpoch', 'setEpochNow'];

for (var method of methods) {
    if (!(method.startsWith('_') || method === 'constructor')) {
        BioWrapper.prototype[method] = function () {
            console.log('calling method: ', method);
            socket.emit('request', {id: BioWrapper.id, method: method, type: 'method'}, function (data) {
            });
        }
    }
}

for (var method of staticMethods) {
    if (!(method.startsWith('_') || method === 'constructor')) {
        BioWrapper.prototype[method] = function () {
            console.log('calling static: ', method);
            socket.emit('request', {id: BioWrapper.id, method: method, type: 'static-method'}, function (data) {
            });
        }
    }
}

module.exports = SpectroWrapper;
