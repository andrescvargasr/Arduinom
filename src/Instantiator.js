/**
 * Created by qcabrol on 10/25/16.
 */
"use strict"
var util = require("./util");
const OpenBio = require("./devices/OpenBio");
const OpenSpectro = require("./devices/OpenSpectro");
const device = require("./DeviceHandler");
const debug = require("debug")('main:Instantiator');


class Instantiator extends EventEmitter() {
    constructor() {
        this._init
    }

    _init() {
        setInterval(device.Handler.serialDevices({manufacturer: 'Arduino_LLC'}, { //--> to be removed
                init: 'q',
                endString: '\r\n\r\n'
            }),
            10000)

        device.Handler.on('new', (id)=>this.createDevice(id));
        device.Handler.on('connect', (id)=>this.emit('connect',id));
        device.Handler.on('disconnect', (id)=>this.emit('disconnect',id));
    }

    //create new device instance based onb its qualifier
    createDevice(id) {
        var qualifierReg = /^([\x21-\x7A])([\x21-\x7A])$/;
        var id_string = util.deviceIdNumberToString(id);
        var m = qualifierReg.exec(id);
        switch (m[1]) {
            case '$':
                debug('detected bioreactor with id:', id_string); //then create a filter fo device objects
                this.emit('new',id, new OpenBio(id));
                break;
            case 'S':
                debug('detected spectrophotometer with id:', id_string); //then create a filter fo device objects
                this.emit('new',id, new OpenSpectro(id));
                break;
            default:
                debug('detected unknown device with id:', id);
                break;
        }
    }

}

exports.Instantiator = new Instantiator(); //-> unused, only one global db is more suited