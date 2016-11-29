'use strict';
const Common = require('./Common');
const debug = require('debug')('client: OpenBio');

module.exports = function (socket) {
    class OpenBio extends Common {
        constructor(id) {
            super(id, socket);
            this.type = 'OpenBio';
            _init(id);
        }
    }

    function _init(id) {

        var methods = ['getParsedCompactLog', 'getLastLog', 'getLastEntryID', 'getI2C', 'getOneWire', 'getMultiLog',
            'getParsedMultiLog', 'multiLogToDB', 'compactLogToDB', 'setParameter', 'getDB', 'autoDataLogger', 'stopAutoLog',
            'autoSetEpoch', 'clearAutoEpoch', 'addRequest', 'getHelp', 'getFreeMem', 'getQualifier', 'getEEPROM',
            'getSettings', 'getCompactLog', 'getEpoch', 'setEpoch', 'setEpochNow'];

        for (let method of methods) {
            if (!(method.startsWith('_') || method === 'constructor')) {
                OpenBio.prototype[method] = function () {
                    return new Promise(function (resolve, reject) {
                        debug('calling method: ', method);
                        socket.emit('request', {
                            id: id,
                            method: method,
                            type: 'method',
                            args: Array.from(arguments)
                        }, function (data) {
                            if (data.status === 'success') {
                                resolve(data.data);
                            } else {
                                reject(data.error);
                            }
                        });
                    });
                }
            }
        }

        var staticMethods = ['getParamConfig', 'getMaxParam', 'getNbParamLog', 'getDeviceType'];
        for (let method of staticMethods) {
            if (!(method.startsWith('_') || method === 'constructor')) {
                OpenBio[method] = function () {
                    return new Promise(function (resolve, reject) {
                        console.log('calling static: ', method);
                        socket.emit('request', {
                            id: id,
                            method: method,
                            type: 'static-method',
                            args: Array.from(arguments)
                        }, function (data) {
                            if (data.status === 'success') {
                                resolve(data.data);
                            } else {
                                reject(data.error);
                            }
                        });
                    });
                }
            }
        }
    }

    return OpenBio;
};
