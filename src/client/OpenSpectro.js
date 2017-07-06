'use strict';
const Common = require('./Common');
const addMethods = require('./addMethods');
const methods = require('./openSpectroMethods.json');

module.exports = function (socket) {

    class OpenSpectro extends Common {
        constructor(id) {
            super(id);
            this.type = 'OpenSpectro';
        }
    }

    addMethods.methods(methods.methods, OpenSpectro, socket);
    addMethods.staticMethods(methods.static, OpenSpectro, socket);
    return OpenSpectro;
};
