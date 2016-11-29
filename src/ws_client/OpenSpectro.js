'use strict';
const Common = require('./Common');

module.exports = function(socket) {
    class OpenSpectro extends Common {
        constructor(id) {
            super(id);
            this.type='OpenSpectro';
            _init(id);
        }
    }

    function _init(id) {
        //to be edited according to spectro config ++++ !!!!
        var methods = ['getParsedCompactLog', 'getLastLog', 'getI2C',
            'compactLogToDB', 'setParameter', 'getDB',
            'autoSetEpoch', 'clearAutoEpoch', 'addRequest', 'getHelp', 'getFreeMem', 'getQualifier', 'getEEPROM',
            'getSettings', 'getCompactLog', 'getEpoch', 'setEpoch', 'setEpochNow'];

        for (let method of methods) {
            if (!(method.startsWith('_') || method === 'constructor')) {
                OpenSpectro.prototype[method] = function () {
                    console.log('calling method: ', method);
                    socket.emit('request', {id: id, method: method, type: 'method'}, function (data) {
                    });
                }
            }
        }
        /*var staticMethods = ['getParamConfig', 'getMaxParam', 'getNbParamLog', 'getDeviceType']
         for (let method of staticMethods) {
         if (!(method.startsWith('_') || method === 'constructor')) {
         OpenSpectro.prototype[method] = function () {
         console.log('calling static: ', method);
         socket.emit('request', {id: OpenSpectro.id, method: method, type: 'static-method'}, function (data) {
         });
         }
         }
         }*/
    }
    return OpenSpectro;
};
