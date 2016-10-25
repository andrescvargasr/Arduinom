"use strict"
var util = require("./util");
const OpenBio = require("./devices/OpenBio");
const OpenSpectro = require("./devices/OpenSpectro");
const Handler = require("./DeviceHandler");
const debug = require("debug")('main:Instantiator');
const EventEmitter = require("events");


class Instantiator extends EventEmitter() {
    constructor() {
        Handler.on('new', createDevice);
    }
}

function createDevice(id) {
    var qualifierReg = /^([\x21-\x7A])([\x21-\x7A])$/;
    var id_string = util.deviceIdNumberToString(id);
    var m = qualifierReg.exec(id);
    switch (m[1]) {
        case '$':
            debug('detected bioreactor with id:', id_string); //then create a filter fo device objects
            this.emit('new', new OpenBio(id));
            break;
        case 'S':
            debug('detected spectrophotometer with id:', id_string); //then create a filter fo device objects
            this.emit('new', new OpenSpectro(id));
            break;
        default:
            debug('detected unknown device with id:', id);
            break;
    }
}

module.exports = new Instantiator(); //-> unused, only one global db is more suited