/**
 * Created by qcabrol on 9/26/16.
 */
"use strict";

process.on('unhandledRejection', e => {throw e});


const EventEmitter = require("events");
const Serial = require("./../SerialDevices");
const SerialQManager = require("./../SerialQueueManager");
const debug = require("debug")('main:OpenBio');
const pouchDB = require("./../pouch");
const util = require("./../util");

class OpenBio extends AbstractDevice { //issue with extends EventEmitter
    constructor(id) {
        super(id);
    }


    _notReady() {
        debug('OpenBio not ready or not existing device :', this.id);
        return Promise.reject('OpenBio not ready or not existing device :'+ this.id);
    }

    _pendingExperiment() {
        debug('rejected request, wait for completion of the experiment running on OpenBio :', this.id);
        return Promise.reject(new Error('rejected request, wait for completion of the experiment running on OpenBio :'+ this.id));
    }

    /********************************
     *      User utililties
     ********************************/

    getHelp() {
        if (this._ready && !this.pending) this.serialQ.addRequest('h').then((buff)=>debug(buff));
        else if (this.pending) this._pendingExperiment();
        else this._notReady();
    }

    getSettings() {
        if (this._ready && !this.pending) this.serialQ.addRequest('s').then((buff)=>debug(buff));
        else if (this.pending) this._pendingExperiment();
        else this._notReady();
    }

    getEpoch() {
        if (this._ready && !this.pending) this.serialQ.addRequest('e').then((buff)=>debug(buff)); //buffer is accessible here
        else if (this.pending) this._pendingExperiment();
        else this._notReady();
    }

    getFreeMem() {
        if (this._ready && !this.pending) this.serialQ.addRequest('f').then((buff)=>debug(buff));
        else if (this.pending) this._pendingExperiment();
        else this._notReady();
    }

    getQualifier() {
        if (this._ready && !this.pending) this.serialQ.addRequest('q').then((buff)=>debug('qualifier :', buff));
        else if (this.pending) this._pendingExperiment();
        else this._notReady();
    }

    //careful, the data acquisition on the OpenBio require time, sending to many requests can overfill the queue
    //request exceeding maxQueue length will be disregarded
    getRGB() {
        if (this._ready && !this.pending) {
            this.pending = true;
            this.serialQ.addRequest('a', {timeout: 5000}).then((buff)=> {
                this.pending = false;
                debug('rgb data: ', buff)
            });
        }
        else if (this.pending) this._pendingExperiment();
        else this._notReady();
    }





    calibrate() {
        if (this._ready && !this.pending) this.serialQ.addRequest('c', {timeout: 500}).then((buff)=>debug(buff));
        else if (this.pending) this._pendingExperiment();
        else this._notReady();
    }


}


module.exports = OpenBio;