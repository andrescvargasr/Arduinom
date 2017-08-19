'use strict';
const Common = require('./../Common');
const addMethods = require('./../addMethods');
const methods = require('./OpenBioMethods.json');

module.exports = function (socket) {
    class OpenBio extends Common {
        constructor(id) {
            super(id, socket);
            this.type = 'OpenBio';
        }
    }

    addMethods.methods(methods.methods, OpenBio, socket);
    addMethods.staticMethods(methods.static, OpenBio, socket);
    return OpenBio;
};
