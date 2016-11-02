'use strict';

const EventEmitter = require("events");
const Handler = require("./../DeviceHandler");
const debug = require("debug")('main:abstractDevice');

class AbstractDevice extends EventEmitter {

    constructor(id) {
        super();
        this._init()
        this.id = id;
    }

    _init() {
        Handler.on('connect', ()=> {
            debug('Device connected, enabling methods: ' + this.id);
            this.emit('connect');

        });

        Handler.on('disconnect', ()=> {
            debug('Device disconnected, disabling methods: ' + this.id);
            this.emit('disconnect');
        });
    }

    addRequest(cmd, options) {
        debug('adding a new request to queue via abstract device class, port for device is :' + Handler.devices[this.id].portParam);
        return Promise.resolve().then(()=> {
            var serialQ = Handler.getSerialQ(this.id);
            return serialQ.addRequest(cmd, options);
        })
    }
}

module.exports = AbstractDevice;