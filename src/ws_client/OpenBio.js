'use strict';
const EventEmitter = require('events');

module.exports = function(socket) {
    class OpenBio extends EventEmitter {
        constructor(id) {
            super();
            this.id = id;
        }
    }

    var staticMethods = ['getParamConfig', 'getMaxParam', 'getNbParamLog', 'getDeviceType']
    var methods = ['getParsedCompactLog', 'getLastLog', 'getLastEntryID', 'getI2C', 'getOneWire', 'getMultiLog',
        'getParsedMutiLog', 'multiLogToDB', 'compactLogToDB', 'setParameter', 'getDB', 'autoDataLogger', 'stopAutoLog',
        'autoSetEpoch', 'clearAutoEpoch', 'addRequest', 'getHelp', 'getFreeMem', 'getQualifier', 'getEEPROM',
        'getSettings', 'getCompactLog', 'getEpoch', 'setEpoch', 'setEpochNow'];

    for (var method of methods) {
        if (!(method.startsWith('_') || method === 'constructor')) {
            OpenBio.prototype[method] = function () {
                console.log('calling method: ', method);
                socket.emit('request', {id: OpenBio.id, method: method, type: 'method', args: Array.from(arguments)}, function (data) {
                });
            }
        }
    }

    for (var method of staticMethods) {
        if (!(method.startsWith('_') || method === 'constructor')) {
            OpenBio.prototype[method] = function () {
                console.log('calling static: ', method);
                socket.emit('request', {id: OpenBio.id, method: method, type: 'static-method', args:Array.from(arguments)}, function (data) {
                });
            }
        }
    }
    return OpenBio;
};
