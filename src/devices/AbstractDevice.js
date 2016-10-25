'use strict';

const EventEmitter = require("events");
const Handler = require("./../DeviceHandler");
const debug = require("debug")('main:abstractDevice');

class AbstractDevice extends EventEmitter {

    constructor(id) {
        super();
        this._init()
        this.id = id;
        this.enabled=true;
    }

    _init() {
        Handler.on('connect', ()=> {
            debug('Device disconnected, disabling methods: ' + id);
            this.enabled=true;
        });
        Handler.on('disconnect', ()=> {
            debug('Device disconnected, disabling methods: ' + id);
            this.enabled=false;
        });
    }
}

module.exports = AbstractDevice;