'use strict';
var util = require('./../utilities/util');
const OpenBio = require('./OpenBio/OpenBio');
const OpenSpectro = require('./OpenSpectro/OpenSpectro');
const DeviceManager = require('./DeviceManager');
const debug = require('debug')('main:DeviceFactory');
const EventEmitter = require('events');
var deviceList = {};

class DeviceFactory extends EventEmitter {
    constructor() {
        super();
        DeviceManager.on('new', createDevice.bind(this));
        DeviceManager.on('disconnect', (id)=> {
            this.emit('disconnect', id);
            this.emit('devices',deviceList);
        });
        DeviceManager.on('connect', (id)=> {
            this.emit('connect', id);
            this.emit('devices',deviceList);
        });
    }

    _createDevice(id, constructor) {
        try {
            var device = new constructor(id);
            //adding the new device to the cached List
            deviceList[id]=device;
        } catch (e) {
            this.emit('error', e);
            return;
        }
        this.emit('newDevice', device);
        this.emit('devices', deviceList);
    }

    getDeviceList(){
        return deviceList;
    }

    getDevice(id) {
        return deviceList[id];
    }
}

function createDevice(id) {
    var idString = util.deviceIdNumberToString(id);
    debug('new device was connected, calling instantiator createDevice()');
    switch (idString[0]) {
        case '$':
            debug('detected bioreactor with id:', idString); //then create a filter fo device objects
            this._createDevice(id, OpenBio);
            break;
        case 'S':
            debug('detected spectrophotometer with id:', idString); //then create a filter fo device objects
            this._createDevice(id, OpenSpectro);
            break;
        default:
            debug('detected unknown device with id:', idString);
            this.emit('error', new Error('Detected device of unknown type'))
            break;
    }
}


module.exports = new DeviceFactory();
