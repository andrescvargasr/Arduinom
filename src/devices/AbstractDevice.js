'use strict';

const EventEmitter = require("events");
const Handler = require("./../DeviceHandler");
const debug = require("debug")('main:abstractDevice');

class AbstractDevice extends EventEmitter {

    constructor(id) {
        super();
        this._init()
        this.id = id;
        this.pending=false; //flag to check if an experiment is currently running
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
        debug('adding a new request to queue via abstract device class');
        return Promise.resolve().then(()=> {
            var serialQ = Handler.getSerialQ(this.id);
            return serialQ.addRequest(cmd, options);
        })
    }

    //safety to prevent command of being received while an slow experiment is running
    _pendingExperiment() {
        debug('rejected request, wait for completion of the experiment running on device  :', this.id);
        return Promise.reject(new Error('rejected request, wait for completion of the experiment running on openspectro :' + this.id));
    }

    /********************************
     *      Device utilities
     ********************************/
    getHelp() {
        if (this.pending) return this._pendingExperiment();
        return this.addRequest('h')
            .then((buff)=> {
                return buff;
            });
    }

    getFreeMem() {
        if (this.pending) return this._pendingExperiment();
        return this.addRequest('f').then((buff)=> {
            return buff;
        });
    }

    getQualifier() {
        if (this.pending) return this._pendingExperiment();
        return this.addRequest('q').then((buff)=> {
            return buff;
        });
    }

    getEEPROM() {
        if (this.pending) return this._pendingExperiment();
        return this.addRequest('z', {timeout: 500}).then((buff)=> {
            return buff;
        });
    }

    getSettings() {
        if (this.pending) return this._pendingExperiment();
        this.addRequest('s').then((buff)=> {
            return buff;
        });
    }

    getCompactLog() {
        if (this.pending) return this._pendingExperiment();
        return this.addRequest('c').then((buff)=> {
            return buff;
        });
    }

    /********************************
     *      Time utilities
     ********************************/
    getEpoch() {
        if (this.pending) return this._pendingExperiment();
        return this.addRequest('e', time).then((buff)=> {
            return buff;
        }); //buffer is accessible here
    }

    setEpoch(time) {
        if (this.pending) return this._pendingExperiment();
        var cmd = 'e' + time;
        return this.addRequest(cmd).then((buff)=> {
            return buff;
        }); //buffer is accessible here
    }

    setEpochNow() {
        if (this.pending) return this._pendingExperiment();
        var time = (new Date).getTime();
        return this.setEpoch(time); //buffer is accessible here
    }

}

module.exports = AbstractDevice;