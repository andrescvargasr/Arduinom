'use strict';

const EventEmitter = require("events");
const device = require("./../DeviceHandler");
const debug = require("debug")('main:abstractDevice');

class AbstractDevice extends EventEmitter {

    constructor(id) {
        super();
        this._init(id)
        this.id = id;
    }

    _init(id) {
        device.Handler.refreshDevices({manufacturer: 'Arduino_LLC'}, { //--> to be removed
            init: 'q',
            endString: '\r\n\r\n'
        })
            .then(() => {
                debug('devices refreshed');
                return device.Handler.getSerialQ(id);
            })
            .then(Q => {
                if (Q!=={}) this.serialQ = Q;
                else throw new Error('no serialQ for device ', id);
            })
            .then(() => {
                this.initDeviceListeners();
            })
            .catch((err)=> {
                debug(err);
                if(this.serialQ!=={})this.disableDeviceListeners();
                this._scheduleInit(id);
            });
    }

    //here we clear the timeout if already existing, avoid multiple instances of serialportinit running in parallel
    _scheduleInit(id) {
        if (this.initTimeout) {
            clearTimeout(this.initTimeout) //core of the solution
        }
        this.initTimeout = setTimeout(()=> {
            this._init(id)
        }, 5000);
    }


}

module.exports = AbstractDevice;