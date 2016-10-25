/**
 * Created by qcabrol on 10/25/16.
 */
"use strict"
//imported
const SerialPort = require("serialport");
const SerialQueueManager = require("./SerialQueueManager"); //constructor for serial port objects
const EventEmitter = require("events");
const debug = require("debug")('main:device handler');


class DeviceHandler extends EventEmitter { //issue with extends EventEmitter
    constructor() {
        super();
        this.devices = [];
        this.serialQManagers = {};
    }

    /****************************************************
     *   Internal management of the SerialQ Lookup
     ****************************************************/
    _serialDevices(options, initialize) {
        var that = this;
        //find all serial devices connected
        return new Promise(function (resolve, reject) {
            SerialPort.list(function (err, ports) {
                if (err) return reject(err);
                var arr = [];
                this.selectedPorts = ports.filter(function (port) {
                    for (var key in options) {
                        if (port[key] !== options[key])
                            return false
                    }
                    return true; //return port infos if true (boolean for filter method)
                });

                this.selectedPorts.forEach(function (port) {
                    debug('device with desired specs on port :', port.comName);
                    if (!this.serialQManagers[port.comName]) {
                        //create new serial Queue manager if a new serial device was connected
                        this.serialQManagers[port.comName] = new SerialQueueManager(port.comName, {
                                baudRate: 38400,
                                parser: SerialPort.parsers.raw
                            },
                            {
                                init: initialize.init,
                                endString: initialize.endString
                            });
                        debug('instantiate new SerialQ');

                        arr.push(new Promise(function (resolve) {
                            if (!this.serialQListener[port.comName]) {
                                this.serialQListener[port.comName] = true;
                                debug('Declared listeners for port', port.comName);

                                //on ready event
                                this.serialQManagers[port.comName].on('ready', (id) => {
                                    debug('serialQManager ready event, instantiating Device entry');
                                    that.devices[id] = that.serialQManagers[port.comName];
                                    that.emit('newDevice', id);
                                    resolve();
                                });

                                //on reinit event
                                this.serialQManagers[port.comName].on('reinitialized', (id) => {
                                    debug('rematching port and device id on reinitialisation:' + id);
                                    that.devices[id] = that.serialQManagers[port.comName];
                                    resolve();
                                });

                                //on idchange event
                                this.serialQManagers[port.comName].on('idchange', (newId, oldId) => {
                                    debug('device id changed, on port' + port.comName);
                                    //_disableListeners(oldId);
                                    that.devices[oldId] = {}; //disable listeners on old deviceId device class
                                    that.devices[newId] = that.serialQManagers[port.comName];
                                    this.emit('newDevice', newId);
                                    resolve();
                                });
                            }
                        }))
                    }
                });
                Promise.all(arr).then(()=> {
                    resolve(that.devices);
                });
            });
        });
    }


    refreshDevices(options, initialize) {
        this.ready = this._serialDevices(options, initialize);
        return this.ready;
    }


    /**************************************************
     *         Functions To be Called Outside
     **************************************************/
    //return promise of q serialQ object with given ID
    getSerialQ(id) {
        var that=this;
        debug('getting serialQ for device', id);
        return this.ready.then(()=> {
            if (that.devices[id]) return that.devices[id];
            else throw new Error('no existing device with ID: ' + id);
        })
    }
}

exports.Handler = new DeviceHandler(); //-> unused, only one global db is more suited


