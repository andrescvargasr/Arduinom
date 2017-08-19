'use strict';
const Common = require('./../Common');
const addMethods = require('./../addMethods');
const methods = require('./SolarMethods.json');

module.exports = function (socket) {
    class Solar extends Common {
        constructor(id) {
            super(id, socket);
            this.type = 'Solar';
        }
    }

    addMethods.methods(methods.methods, Solar, socket);
    addMethods.staticMethods(methods.static, Solar, socket);
    return Solar;
};
