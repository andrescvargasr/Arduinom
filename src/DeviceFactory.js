'use strict';
var util = require('./util');
const OpenBio = require('./devices/OpenBio/OpenBio');
const OpenSpectro = require('./devices/OpenSpectro/OpenSpectro');
const DeviceManager = require('./DeviceManager');
const debug = require('debug')('main:DeviceFactory');
const EventEmitter = require('events');


class DeviceFactory extends EventEmitter {
    constructor() {
        super();
        DeviceManager.on('new', createDevice.bind(this));
        DeviceManager.on('disconnect', (id)=>this.emit('disconnect', id));
        DeviceManager.on('connect', (id)=>this.emit('connect', id));
    }
}

function createDevice(id) {
    debug('new device was connected, calling instantiator createDevice()');
    var qualifierReg = /^([\x21-\x7A])([\x21-\x7A])$/;
    var idString = util.deviceIdNumberToString(id);
    var m = qualifierReg.exec(idString);
    if (!m) {
        debug('The id did not match the regex. Id was: ' + idString);
        throw new Error('Invalid device id');
    }
    switch (m[1]) {
        case '$':
            debug('detected bioreactor with id:', idString); //then create a filter fo device objects
            this.emit('newDevice', new OpenBio(id));
            break;
        case 'S':
            debug('detected spectrophotometer with id:', idString); //then create a filter fo device objects
            this.emit('newDevice', new OpenSpectro(id));
            break;
        default:
            debug('detected unknown device with id:', id);
            break;
    }
}

module.exports = new DeviceFactory(); //-> unused, only one global db is more suited
